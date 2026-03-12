import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle, ShoppingBag, GraduationCap, Award, Calendar, Tag } from 'lucide-react'
import { paymentService, chargeService } from '../../services/index'
import { Spinner, EmptyState, StatusBadge, StatCard } from '../../components/ui/index'
import { fmtDate, fmtCurrency, fmtMonth } from '../../utils/helpers'

const CHARGE_CATEGORIES = [
  { key: 'material',    label: 'Material',      icon: ShoppingBag   },
  { key: 'inscripcion', label: 'Inscripciones',  icon: GraduationCap },
  { key: 'licencia',    label: 'Licencias',      icon: Award         },
  { key: 'evento',      label: 'Eventos',        icon: Calendar      },
  { key: 'otro',        label: 'Otros',          icon: Tag           },
]

export default function StudentPayments() {
  const [payments,       setPayments]       = useState([])
  const [chargesGrouped, setChargesGrouped] = useState({})
  const [loading,        setLoading]        = useState(true)
  const [tab,            setTab]            = useState('mensualidades')

  useEffect(() => {
    async function load() {
      try {
        const [p, c] = await Promise.all([
          paymentService.getMyPayments(),
          chargeService.getMyCharges(),
        ])
        setPayments(Array.isArray(p) ? p : (p?.payments ?? []))
        setChargesGrouped(c?.grouped ?? {})
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const paid    = payments.filter(p => p.paid)
  const pending = payments.filter(p => !p.paid)
  const overdue = pending.filter(p => p.dueDate && new Date(p.dueDate) < new Date())

  // Total de cargos adicionales pendientes
  const allCharges = Object.values(chargesGrouped).flat()
  const chargesPending = allCharges.filter(c => !c.paid).length

  const totalPaid = paid.reduce((s, p) => s + (p.amount ?? 0), 0)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const tabs = [
    { key: 'mensualidades', label: 'Mensualidades', icon: CreditCard },
    ...CHARGE_CATEGORIES.filter(cat => (chargesGrouped[cat.key]?.length ?? 0) > 0),
  ]

  return (
    <div className="space-y-6 slide-up max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Mis Pagos</h1>
        <p className="page-subtitle">Mensualidades y cargos adicionales</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CreditCard}  label="Total pagado"   value={fmtCurrency(totalPaid)} accent />
        <StatCard icon={CheckCircle} label="Meses pagados"  value={paid.length}    sub="Este año" />
        <StatCard
          icon={CreditCard}
          label="Pendientes"
          value={pending.length + chargesPending}
          sub={overdue.length > 0 ? `${overdue.length} vencidos` : 'Al día'}
          alert={overdue.length > 0}
        />
      </div>

      {overdue.length > 0 && (
        <div className="alert-red">
          <span className="font-500 text-dojo-light">
            Tienes {overdue.length} {overdue.length === 1 ? 'pago vencido' : 'pagos vencidos'}.
          </span>
          <span className="text-dojo-text/60 ml-1 text-sm">
            Contacta con el gimnasio para regularizar tu situación.
          </span>
        </div>
      )}

      {/* Tabs — solo mostrar categorías con datos */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-1 bg-dojo-dark p-1 rounded-lg border border-dojo-border">
          {tabs.map(({ key, label, icon: Icon }) => (
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
      )}

      {/* Contenido */}
      <div className="card overflow-hidden">
        {tab === 'mensualidades' ? (
          payments.length === 0 ? (
            <EmptyState icon={CreditCard} title="Sin mensualidades" description="Aún no tienes mensualidades registradas" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dojo-dark/50 border-b border-dojo-border">
                  <tr>
                    <th className="table-header">Mes</th>
                    <th className="table-header">Importe</th>
                    <th className="table-header hidden md:table-cell">Vencimiento</th>
                    <th className="table-header hidden md:table-cell">Fecha pago</th>
                    <th className="table-header hidden lg:table-cell">Método</th>
                    <th className="table-header">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p._id} className="table-row">
                      <td className="table-cell font-500 text-dojo-light">{fmtMonth(p.month)}</td>
                      <td className="table-cell font-mono">{fmtCurrency(p.amount)}</td>
                      <td className="table-cell hidden md:table-cell text-xs font-mono text-dojo-text/50">{fmtDate(p.dueDate)}</td>
                      <td className="table-cell hidden md:table-cell text-xs font-mono text-dojo-text/50">{p.paymentDate ? fmtDate(p.paymentDate) : '—'}</td>
                      <td className="table-cell hidden lg:table-cell capitalize text-xs">{p.paymentMethod ?? '—'}</td>
                      <td className="table-cell"><StatusBadge paid={p.paid} dueDate={p.dueDate} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Tabla de cargos adicionales
          (() => {
            const catCharges = chargesGrouped[tab] ?? []
            const catInfo = CHARGE_CATEGORIES.find(c => c.key === tab)
            if (catCharges.length === 0) return (
              <EmptyState icon={catInfo?.icon ?? Tag} title={`Sin cargos de ${catInfo?.label?.toLowerCase()}`} />
            )
            return (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-dojo-dark/50 border-b border-dojo-border">
                    <tr>
                      <th className="table-header">Descripción</th>
                      <th className="table-header">Importe</th>
                      <th className="table-header hidden md:table-cell">Vencimiento</th>
                      <th className="table-header hidden lg:table-cell">Método</th>
                      <th className="table-header">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catCharges.map(c => (
                      <tr key={c._id} className="table-row">
                        <td className="table-cell font-500 text-dojo-light">{c.description}</td>
                        <td className="table-cell font-mono">{fmtCurrency(c.amount)}</td>
                        <td className="table-cell hidden md:table-cell text-xs font-mono text-dojo-text/50">{c.dueDate ? fmtDate(c.dueDate) : '—'}</td>
                        <td className="table-cell hidden lg:table-cell capitalize text-xs">{c.paymentMethod}</td>
                        <td className="table-cell"><StatusBadge paid={c.paid} dueDate={c.dueDate} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          })()
        )}
      </div>
    </div>
  )
}