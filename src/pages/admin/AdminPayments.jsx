import { useEffect, useState, useCallback } from 'react'
import { AlertTriangle, Plus, CheckCircle, CreditCard, FileText } from 'lucide-react'
import { paymentService, studentService } from '../../services/index'
import {
  Spinner, EmptyState, StatusBadge, Modal, SectionHeader, Skeleton, InlineAlert
} from '../../components/ui/index'
import { fmtDate, fmtCurrency, fmtMonth } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AdminPayments() {
  const [alerts,   setAlerts]   = useState([])
  const [report,   setReport]   = useState([])
  const [tab,      setTab]      = useState('alerts') // 'alerts' | 'report'
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const now = new Date()
      const year  = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')

      const [a, r] = await Promise.all([
        paymentService.getAlerts(),
        paymentService.getMonthlyReport({ year, month }),
      ])

      // alerts: { overdue: { payments: [] }, upcoming: { payments: [] } }
      const overduePayments  = a?.alerts?.overdue?.payments  ?? []
      const upcomingPayments = a?.alerts?.upcoming?.payments ?? []
      setAlerts([...overduePayments, ...upcomingPayments])

      // report: { payments: { paid: [], pending: [] } }
      const paidList    = r?.payments?.paid    ?? []
      const pendingList = r?.payments?.pending ?? []
      setReport([...pendingList, ...paidList])
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
    } catch {
      toast.error('Error al actualizar pago')
    }
  }

  const overdueAlerts = alerts.filter(p => p.daysOverdue > 0)

  return (
    <div className="space-y-6 slide-up">
      <SectionHeader
        title="Pagos"
        subtitle="Control de cuotas y alertas de impago"
        action={
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
            <Plus size={15} />
            Nuevo pago
          </button>
        }
      />

      {/* Alert summary */}
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
      <div className="flex gap-1 bg-dojo-dark p-1 rounded-lg w-fit border border-dojo-border">
        {[
          { key: 'alerts', icon: AlertTriangle, label: 'Alertas' },
          { key: 'report', icon: FileText,      label: 'Reporte mensual' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all
              ${tab === key
                ? 'bg-dojo-red text-white shadow'
                : 'text-dojo-text/60 hover:text-dojo-text'
              }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : tab === 'alerts' ? (
          <AlertsTable payments={alerts} onMarkPaid={markPaid} />
        ) : (
          <ReportTable payments={report} onMarkPaid={markPaid} />
        )}
      </div>

      <CreatePaymentModal
        open={creating}
        onClose={() => setCreating(false)}
        onRefresh={load}
      />
    </div>
  )
}

// ─── ALERTS TABLE ────────────────────────────────────────────────────────────
function AlertsTable({ payments, onMarkPaid }) {
  if (payments.length === 0) {
    return (
      <div className="p-8 text-center">
        <CheckCircle size={36} className="text-dojo-success mx-auto mb-3 opacity-50" />
        <p className="text-dojo-light font-500">Todo al día</p>
        <p className="text-dojo-text/40 text-sm mt-1">No hay pagos pendientes</p>
      </div>
    )
  }

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
          {payments.map((p) => (
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
                <button
                  onClick={() => onMarkPaid(p._id)}
                  className="btn-ghost text-xs text-dojo-success hover:text-green-400 flex items-center gap-1 ml-auto"
                >
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
  if (payments.length === 0) {
    return <EmptyState icon={CreditCard} title="Sin registros" description="No hay pagos en el reporte" />
  }

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
          {payments.map((p) => (
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
                  <button
                    onClick={() => onMarkPaid(p._id)}
                    className="btn-ghost text-xs text-dojo-success hover:text-green-400 flex items-center gap-1 ml-auto"
                  >
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

// ─── CREATE PAYMENT MODAL ─────────────────────────────────────────────────────
function CreatePaymentModal({ open, onClose, onRefresh }) {
  const [students, setStudents] = useState([])
  const [form, setForm] = useState({
    student: '', month: '', amount: '', dueDate: '', paymentMethod: 'tarjeta', notes: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      studentService.getAll().then(d => setStudents(Array.isArray(d) ? d : (d?.students ?? []))).catch(() => {})
    }
  }, [open])

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await paymentService.create({
        studentId: form.student,   // backend espera studentId
        month:     form.month,
        year:      parseInt(form.month?.split('-')[0]),
        amount:    parseFloat(form.amount),
        dueDate:   form.dueDate,
        paymentMethod: form.paymentMethod,
        notes:     form.notes,
      })
      toast.success('Pago creado correctamente')
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
    <Modal open={open} onClose={onClose} title="Nuevo Pago" size="md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Alumno *</label>
          <select className="input" value={form.student} onChange={set('student')} required>
            <option value="">Seleccionar alumno...</option>
            {students.map(s => (
              <option key={s._id} value={s._id}>{s.fullName}</option>
            ))}
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
            {loading && <Spinner size="sm" />} Crear pago
          </button>
        </div>
      </form>
    </Modal>
  )
}