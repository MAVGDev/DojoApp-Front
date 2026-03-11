import { useEffect, useState } from 'react'
import { CreditCard, CheckCircle } from 'lucide-react'
import { paymentService } from '../../services/index'
import { Spinner, EmptyState, StatusBadge, StatCard } from '../../components/ui/index'
import { fmtDate, fmtCurrency, fmtMonth } from '../../utils/helpers'

export default function StudentPayments() {
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    paymentService.getMyPayments()
      .then(d => setPayments(Array.isArray(d) ? d : (d?.payments ?? [])))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const paid    = payments.filter(p => p.paid)
  const pending = payments.filter(p => !p.paid)
  const overdue = pending.filter(p => p.dueDate && new Date(p.dueDate) < new Date())
  const totalPaid = paid.reduce((s, p) => s + (p.amount ?? 0), 0)

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  return (
    <div className="space-y-6 slide-up max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Mis Pagos</h1>
        <p className="page-subtitle">Historial de cuotas mensuales</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={CreditCard}   label="Total pagado"   value={fmtCurrency(totalPaid)} accent />
        <StatCard icon={CheckCircle}  label="Meses pagados"  value={paid.length}    sub="Este año" />
        <StatCard
          icon={CreditCard}
          label="Pendientes"
          value={pending.length}
          sub={overdue.length > 0 ? `${overdue.length} vencidos` : 'Al día'}
          alert={overdue.length > 0}
        />
      </div>

      {/* Overdue alert */}
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

      {/* Payments table */}
      <div className="card overflow-hidden">
        {payments.length === 0 ? (
          <EmptyState icon={CreditCard} title="Sin pagos registrados" description="Aún no tienes pagos en el sistema" />
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
                {payments.map((p) => (
                  <tr key={p._id} className="table-row">
                    <td className="table-cell font-500 text-dojo-light">{fmtMonth(p.month)}</td>
                    <td className="table-cell font-mono">{fmtCurrency(p.amount)}</td>
                    <td className="table-cell hidden md:table-cell text-xs font-mono text-dojo-text/50">
                      {fmtDate(p.dueDate)}
                    </td>
                    <td className="table-cell hidden md:table-cell text-xs font-mono text-dojo-text/50">
                      {p.paymentDate ? fmtDate(p.paymentDate) : '—'}
                    </td>
                    <td className="table-cell hidden lg:table-cell capitalize text-xs">
                      {p.paymentMethod ?? '—'}
                    </td>
                    <td className="table-cell">
                      <StatusBadge paid={p.paid} dueDate={p.dueDate} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
