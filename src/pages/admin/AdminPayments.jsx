import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, Plus, CheckCircle, CreditCard, FileText, ShoppingBag, GraduationCap, Award, Calendar, Tag, Trash2 } from 'lucide-react'
import { paymentService, studentService, chargeService } from '../../services/index'
import {
  Spinner, EmptyState, StatusBadge, Modal, SectionHeader, Skeleton, InlineAlert, ConfirmDialog
} from '../../components/ui/index'
import { fmtDate, fmtCurrency, fmtMonth } from '../../utils/helpers'
import toast from 'react-hot-toast'

const CHARGE_CATEGORIES = [
  { key: 'material',    label: 'Material',      icon: ShoppingBag,   color: 'badge-blue'  },
  { key: 'inscripcion', label: 'Inscripciones',  icon: GraduationCap, color: 'badge-gold'  },
  { key: 'licencia',    label: 'Licencias',      icon: Award,         color: 'badge-green' },
  { key: 'evento',      label: 'Eventos',        icon: Calendar,      color: 'badge-red'   },
  { key: 'otro',        label: 'Otros',          icon: Tag,           color: 'badge-gray'  },
]

export default function AdminPayments() {
  const [alerts,     setAlerts]     = useState([])
  const [report,     setReport]     = useState([])
  const [charges,    setCharges]    = useState({})
  const [tab,        setTab]        = useState('alerts')
  const [loading,    setLoading]    = useState(true)
  const [creating,   setCreating]   = useState(false)
  const [creatingCharge, setCreatingCharge] = useState(null) // categoría activa al crear

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const now   = new Date()
      const year  = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')

      const [a, r, c] = await Promise.all([
        paymentService.getAlerts(),
        paymentService.getMonthlyReport({ year, month }),
        chargeService.getAll(),
      ])

      const overduePayments  = a?.alerts?.overdue?.payments  ?? []
      const upcomingPayments = a?.alerts?.upcoming?.payments ?? []
      setAlerts([...overduePayments, ...upcomingPayments])

      const paidList    = r?.payments?.paid    ?? []
      const pendingList = r?.payments?.pending ?? []
      setReport([...pendingList, ...paidList])

      setCharges(c?.grouped ?? {})
    } catch {
      toast.error('Error cargando pagos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function markPaid(paymentId) {
    try {
      await paymentService.markAsPaid(paymentId, { paymentMethod: 'efectivo' })
      toast.success('Pago marcado como pagado')
      load()
    } catch { toast.error('Error al actualizar pago') }
  }

  async function markChargePaid(id) {
    try {
      await chargeService.markAsPaid(id, { paymentMethod: 'efectivo' })
      toast.success('Cargo marcado como pagado')
      load()
    } catch { toast.error('Error al actualizar cargo') }
  }

  async function deleteCharge(id) {
    try {
      await chargeService.delete(id)
      toast.success('Cargo eliminado')
      load()
    } catch { toast.error('Error al eliminar cargo') }
  }

  const overdueAlerts = alerts.filter(p => p.daysOverdue > 0)

  const allTabs = [
    { key: 'alerts',  label: 'Alertas',          icon: AlertTriangle },
    { key: 'report',  label: 'Mensualidades',     icon: FileText      },
    ...CHARGE_CATEGORIES.map(c => ({ key: c.key, label: c.label, icon: c.icon })),
  ]

  return (
    <div className="space-y-6 slide-up">
      <SectionHeader
        title="Pagos"
        subtitle="Control de cuotas y cargos adicionales"
        action={
          <div className="flex gap-2">
            {CHARGE_CATEGORIES.map(cat => (
              tab === cat.key && (
                <button
                  key={cat.key}
                  onClick={() => setCreatingCharge(cat.key)}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus size={15} /> Nuevo {cat.label.slice(0,-1) || cat.label}
                </button>
              )
            ))}
            {(tab === 'alerts' || tab === 'report') && (
              <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
                <Plus size={15} /> Nueva mensualidad
              </button>
            )}
          </div>
        }
      />

      {overdueAlerts.length > 0 && (
        <div className="alert-red">
          <AlertTriangle size={16} className="shrink-0 text-dojo-red mt-0.5" />
          <div>
            <span className="font-500 text-dojo-light">
              {overdueAlerts.length} {overdueAlerts.length === 1 ? 'pago vencido' : 'pagos vencidos'}
            </span>
            <span className="text-dojo-text/60 ml-2 text-sm">
              — Total adeudado: {fmtCurrency(overdueAlerts.reduce((s, p) => s + (p.amount ?? 0), 0))}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 bg-dojo-dark p-1 rounded-lg border border-dojo-border">
        {allTabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all
              ${tab === key ? 'bg-dojo-red text-white shadow' : 'text-dojo-text/60 hover:text-dojo-text'}`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : tab === 'alerts' ? (
          <AlertsTable payments={alerts} onMarkPaid={markPaid} />
        ) : tab === 'report' ? (
          <ReportTable payments={report} onMarkPaid={markPaid} />
        ) : (
          <ChargesTable
            charges={charges[tab] ?? []}
            category={CHARGE_CATEGORIES.find(c => c.key === tab)}
            onMarkPaid={markChargePaid}
            onDelete={deleteCharge}
          />
        )}
      </div>

      <CreatePaymentModal open={creating} onClose={() => setCreating(false)} onRefresh={load} />

      <CreateChargeModal
        open={!!creatingCharge}
        category={creatingCharge}
        onClose={() => setCreatingCharge(null)}
        onRefresh={load}
      />
    </div>
  )
}

// ─── ALERTS TABLE ─────────────────────────────────────────────────────────────
function AlertsTable({ payments, onMarkPaid }) {
  if (payments.length === 0) return (
    <div className="p-8 text-center">
      <CheckCircle size={36} className="text-dojo-success mx-auto mb-3 opacity-50" />
      <p className="text-dojo-light font-500">Todo al día</p>
      <p className="text-dojo-text/40 text-sm mt-1">No hay pagos pendientes</p>
    </div>
  )
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dojo-dark/50 border-b border-dojo-border">
          <tr>
            <th className="table-header">Alumno</th>
            <th className="table-header">Mes</th>
            <th className="table-header">Importe</th>
            <th className="table-header">Vencimiento</th>
            <th className="table-header">Estado</th>
            <th className="table-header text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p._id} className="table-row">
              <td className="table-cell">
                <p className="text-dojo-light text-sm font-500">
                  {typeof p.student === 'string' ? p.student : (p.student?.fullName ?? '—')}
                </p>
              </td>
              <td className="table-cell text-xs font-mono">{fmtMonth(p.month)}</td>
              <td className="table-cell font-mono text-dojo-light">{fmtCurrency(p.amount)}</td>
              <td className="table-cell text-xs font-mono text-dojo-text/60">{fmtDate(p.dueDate)}</td>
              <td className="table-cell"><StatusBadge paid={p.paid} dueDate={p.dueDate} /></td>
              <td className="table-cell text-right">
                <button onClick={() => onMarkPaid(p._id)} className="btn-ghost text-xs text-dojo-success flex items-center gap-1 ml-auto">
                  <CheckCircle size={13} /> Marcar pagado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── REPORT TABLE ─────────────────────────────────────────────────────────────
function ReportTable({ payments, onMarkPaid }) {
  if (payments.length === 0) return <EmptyState icon={CreditCard} title="Sin registros" description="No hay mensualidades este mes" />
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-dojo-dark/50 border-b border-dojo-border">
          <tr>
            <th className="table-header">Alumno</th>
            <th className="table-header">Mes</th>
            <th className="table-header">Importe</th>
            <th className="table-header hidden md:table-cell">Método</th>
            <th className="table-header hidden lg:table-cell">Fecha pago</th>
            <th className="table-header">Estado</th>
            <th className="table-header text-right">Acción</th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p._id} className="table-row">
              <td className="table-cell">
                <p className="text-dojo-light text-sm font-500">
                  {typeof p.student === 'string' ? p.student : (p.student?.fullName ?? '—')}
                </p>
              </td>
              <td className="table-cell text-xs font-mono">{fmtMonth(p.month)}</td>
              <td className="table-cell font-mono text-dojo-light">{fmtCurrency(p.amount)}</td>
              <td className="table-cell hidden md:table-cell capitalize text-xs">{p.paymentMethod ?? '—'}</td>
              <td className="table-cell hidden lg:table-cell text-xs font-mono text-dojo-text/60">
                {p.paymentDate ? fmtDate(p.paymentDate) : '—'}
              </td>
              <td className="table-cell"><StatusBadge paid={p.paid} dueDate={p.dueDate} /></td>
              <td className="table-cell text-right">
                {!p.paid && (
                  <button onClick={() => onMarkPaid(p._id)} className="btn-ghost text-xs text-dojo-success flex items-center gap-1 ml-auto">
                    <CheckCircle size={13} /> Pagar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── CHARGES TABLE ────────────────────────────────────────────────────────────
function ChargesTable({ charges, category, onMarkPaid, onDelete }) {
  const [confirmId, setConfirmId] = useState(null)

  if (!charges || charges.length === 0) return (
    <EmptyState
      icon={category?.icon ?? Tag}
      title={`Sin cargos de ${category?.label?.toLowerCase()}`}
      description="Crea el primer cargo con el botón de arriba"
    />
  )

  const total       = charges.reduce((s, c) => s + c.amount, 0)
  const totalPaid   = charges.filter(c => c.paid).reduce((s, c) => s + c.amount, 0)
  const totalPending= total - totalPaid

  return (
    <>
      {/* Resumen */}
      <div className="flex gap-6 px-5 py-3 border-b border-dojo-border bg-dojo-dark/30">
        <span className="text-xs font-mono text-dojo-text/50">
          Total: <span className="text-dojo-light">{fmtCurrency(total)}</span>
        </span>
        <span className="text-xs font-mono text-dojo-text/50">
          Cobrado: <span className="text-dojo-success">{fmtCurrency(totalPaid)}</span>
        </span>
        <span className="text-xs font-mono text-dojo-text/50">
          Pendiente: <span className="text-dojo-gold">{fmtCurrency(totalPending)}</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-dojo-dark/50 border-b border-dojo-border">
            <tr>
              <th className="table-header">Alumno</th>
              <th className="table-header">Descripción</th>
              <th className="table-header">Importe</th>
              <th className="table-header hidden md:table-cell">Vencimiento</th>
              <th className="table-header hidden lg:table-cell">Método</th>
              <th className="table-header">Estado</th>
              <th className="table-header text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {charges.map(c => (
              <tr key={c._id} className="table-row">
                <td className="table-cell">
                  <p className="text-dojo-light text-sm font-500">
                    {c.student?.fullName ?? '—'}
                  </p>
                </td>
                <td className="table-cell text-sm">{c.description}</td>
                <td className="table-cell font-mono text-dojo-light">{fmtCurrency(c.amount)}</td>
                <td className="table-cell hidden md:table-cell text-xs font-mono text-dojo-text/60">
                  {c.dueDate ? fmtDate(c.dueDate) : '—'}
                </td>
                <td className="table-cell hidden lg:table-cell capitalize text-xs">{c.paymentMethod}</td>
                <td className="table-cell"><StatusBadge paid={c.paid} dueDate={c.dueDate} /></td>
                <td className="table-cell text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!c.paid && (
                      <button onClick={() => onMarkPaid(c._id)} className="btn-ghost text-xs text-dojo-success flex items-center gap-1">
                        <CheckCircle size={13} /> Cobrar
                      </button>
                    )}
                    <button onClick={() => setConfirmId(c._id)} className="btn-ghost p-1.5 text-dojo-text/40 hover:text-dojo-red">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => { onDelete(confirmId); setConfirmId(null) }}
        title="Eliminar cargo"
        description="¿Eliminar este cargo? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        variant="danger"
      />
    </>
  )
}

// ─── CREATE CHARGE MODAL ──────────────────────────────────────────────────────
function CreateChargeModal({ open, category, onClose, onRefresh }) {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ student: '', description: '', amount: '', dueDate: '', paymentMethod: 'efectivo', notes: '' })
  const [loading, setLoading] = useState(false)

  const catInfo = CHARGE_CATEGORIES.find(c => c.key === category)

  useEffect(() => {
    if (open) {
      studentService.getAll()
        .then(d => setStudents(Array.isArray(d) ? d : (d?.students ?? [])))
        .catch(() => {})
      setForm({ student: '', description: '', amount: '', dueDate: '', paymentMethod: 'efectivo', notes: '' })
    }
  }, [open])

  const set = f => e => setForm({ ...form, [f]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await chargeService.create({
        studentId:     form.student,
        category,
        description:   form.description,
        amount:        parseFloat(form.amount),
        dueDate:       form.dueDate || null,
        paymentMethod: form.paymentMethod,
        notes:         form.notes,
      })
      toast.success('Cargo creado correctamente')
      onRefresh()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al crear cargo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={`Nuevo cargo — ${catInfo?.label ?? ''}`} size="md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Alumno *</label>
          <select className="input" value={form.student} onChange={set('student')} required>
            <option value="">Seleccionar alumno...</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.fullName}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Descripción *</label>
          <input className="input" value={form.description} onChange={set('description')} required
            placeholder={
              category === 'material'    ? 'Ej: Dobok talla M' :
              category === 'inscripcion' ? 'Ej: Inscripción torneo mayo' :
              category === 'licencia'    ? 'Ej: Licencia federativa 2025' :
              category === 'evento'      ? 'Ej: Cuota campeonato regional' :
              'Descripción del cargo'
            }
            maxLength={200}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Importe (€) *</label>
            <input type="number" step="0.01" min="0" className="input" value={form.amount} onChange={set('amount')} required placeholder="0.00" />
          </div>
          <div>
            <label className="label">Fecha límite</label>
            <input type="date" className="input" value={form.dueDate} onChange={set('dueDate')} />
          </div>
          <div>
            <label className="label">Método de pago</label>
            <select className="input" value={form.paymentMethod} onChange={set('paymentMethod')}>
              <option value="efectivo">Efectivo</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="transferencia">Transferencia</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea className="input resize-none" rows={2} value={form.notes} onChange={set('notes')} placeholder="Opcional..." />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <Spinner size="sm" />} Crear cargo
          </button>
        </div>
      </form>
    </Modal>
  )
}

// ─── CREATE PAYMENT MODAL (mensualidad) ───────────────────────────────────────
function CreatePaymentModal({ open, onClose, onRefresh }) {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({ student: '', month: '', amount: '', dueDate: '', paymentMethod: 'tarjeta', notes: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      studentService.getAll().then(d => setStudents(Array.isArray(d) ? d : (d?.students ?? []))).catch(() => {})
    }
  }, [open])

  const set = f => e => setForm({ ...form, [f]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await paymentService.create({
        studentId:     form.student,
        month:         form.month,
        year:          parseInt(form.month?.split('-')[0]),
        amount:        parseFloat(form.amount),
        dueDate:       form.dueDate,
        paymentMethod: form.paymentMethod,
        notes:         form.notes,
      })
      toast.success('Mensualidad creada correctamente')
      onRefresh()
      onClose()
      setForm({ student: '', month: '', amount: '', dueDate: '', paymentMethod: 'tarjeta', notes: '' })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al crear pago')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nueva Mensualidad" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Alumno *</label>
          <select className="input" value={form.student} onChange={set('student')} required>
            <option value="">Seleccionar alumno...</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.fullName}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Mes (YYYY-MM) *</label>
            <input type="month" className="input" value={form.month} onChange={set('month')} required />
          </div>
          <div>
            <label className="label">Importe (€) *</label>
            <input type="number" step="0.01" min="0" className="input" value={form.amount} onChange={set('amount')} required placeholder="50.00" />
          </div>
          <div>
            <label className="label">Fecha límite *</label>
            <input type="date" className="input" value={form.dueDate} onChange={set('dueDate')} required />
          </div>
          <div>
            <label className="label">Método de pago</label>
            <select className="input" value={form.paymentMethod} onChange={set('paymentMethod')}>
              <option value="tarjeta">Tarjeta</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
            </select>
          </div>
        </div>
        <div>
          <label className="label">Notas</label>
          <textarea className="input resize-none" rows={2} value={form.notes} onChange={set('notes')} placeholder="Opcional..." />
        </div>
        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <Spinner size="sm" />} Crear mensualidad
          </button>
        </div>
      </form>
    </Modal>
  )
}