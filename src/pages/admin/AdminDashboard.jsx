import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CreditCard, Calendar, AlertTriangle, Clock, ChevronRight } from 'lucide-react'
import { dashboardService } from '../../services/index'
import { StatCard, CardSkeleton, BeltBadge, Avatar } from '../../components/ui/index'
import { fmtCurrency, fmtDate, fmtRelative, getMartialArtLabel } from '../../utils/helpers'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const PIE_COLORS = ['#C0392B', '#D4AF37', '#27AE60', '#2980B9', '#8E44AD']

export default function AdminDashboard() {
  const [stats,    setStats]    = useState(null)
  const [dist,     setDist]     = useState([])
  const [payments, setPayments] = useState(null)
  const [alerts,   setAlerts]   = useState(null)
  const [recent,   setRecent]   = useState([])
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const s = await dashboardService.getStats()
        // El backend devuelve { success, data: { totalEstudiantes, ingresosMes, ... } }
        setStats(s?.data ?? s)

        const d = await dashboardService.getDistribution()
        // El backend devuelve { success, data: [ { arte_marcial, cantidad }, ... ] }
        const distArr = d?.data ?? d?.distribution ?? (Array.isArray(d) ? d : [])
        setDist(distArr)

        const p = await dashboardService.getPaymentsStatus()
        // El backend devuelve { success, data: { pagados: {cantidad,total}, pendientes, vencidos } }
        setPayments(p?.data ?? p)

        const a = await dashboardService.getActiveAlerts()
        // El backend devuelve { success, data: { pagosPendientes, eventosProximos } }
        setAlerts(a?.data ?? a)

        const r = await dashboardService.getRecentStudents()
        // El backend devuelve { success, data: [ ...students ] }
        const recentArr = r?.data ?? r?.students ?? (Array.isArray(r) ? r : [])
        setRecent(recentArr)

        const e = await dashboardService.getAdminUpcomingEvents()
        // El backend devuelve { success, data: [ ...events ] }
        const eventsArr = e?.data ?? e?.events ?? (Array.isArray(e) ? e : [])
        setEvents(eventsArr)
      } catch (err) {
        console.error('❌ Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Normalizar datos para el gráfico de distribución
  // Backend devuelve { arte_marcial, cantidad, porcentaje } o { _id, count }
  const distData = dist.map((d) => ({
    name: getMartialArtLabel(d.arte_marcial ?? d.arteMarcial ?? d._id ?? d.name),
    value: d.cantidad ?? d.count ?? 0,
  }))

  // Normalizar datos para el gráfico de pagos
  // Backend devuelve { pagados: {cantidad}, pendientes: {cantidad}, vencidos: {cantidad} }
  const paymentData = payments ? [
    { name: 'Pagados',    value: payments.pagados?.cantidad    ?? payments.paid    ?? 0 },
    { name: 'Pendientes', value: payments.pendientes?.cantidad ?? payments.pending ?? 0 },
    { name: 'Vencidos',   value: payments.vencidos?.cantidad   ?? payments.overdue ?? 0 },
  ] : []

  // Alertas: backend devuelve { pagosPendientes: [...], eventosProximos: [...] }
  const alertCount = alerts
    ? (alerts.pagosPendientes?.length ?? alerts.paymentAlerts?.length ?? 0)
    : 0

  // Stats: backend devuelve { totalEstudiantes, ingresosMes, eventosMes, alertasActivas }
  const totalStudents  = stats?.totalEstudiantes  ?? stats?.totalStudents  ?? '—'
  const monthlyRevenue = stats?.ingresosMes       ?? stats?.monthlyRevenue ?? 0
  const monthlyEvents  = stats?.eventosMes        ?? stats?.monthlyEvents  ?? '—'

  return (
    <div className="space-y-8 slide-up">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Resumen general del gimnasio</p>
      </div>

      {/* Alert banner */}
      {alertCount > 0 && (
        <div className="alert-red">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-dojo-red" />
          <div className="flex-1">
            <span className="font-500 text-dojo-light">
              {alertCount} {alertCount === 1 ? 'pago vencido' : 'pagos vencidos'}
            </span>
            <span className="text-dojo-text/60 ml-2 text-xs">
              Revisa la sección de pagos
            </span>
          </div>
          <Link to="/admin/payments" className="btn-ghost text-xs text-dojo-red">
            Ver alertas <ChevronRight size={12} className="inline" />
          </Link>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard
              icon={Users}
              label="Alumnos activos"
              value={totalStudents}
              sub="Total registrados"
            />
            <StatCard
              icon={CreditCard}
              label="Ingresos del mes"
              value={fmtCurrency(monthlyRevenue)}
              sub="Pagos completados"
              accent
            />
            <StatCard
              icon={Calendar}
              label="Eventos este mes"
              value={monthlyEvents}
              sub="Programados"
            />
            <StatCard
              icon={AlertTriangle}
              label="Alertas activas"
              value={alertCount}
              sub="Pagos vencidos"
              alert={alertCount > 0}
            />
          </>
        )}
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Martial arts distribution */}
        <div className="card p-5">
          <h3 className="font-display text-xl text-dojo-white mb-5 tracking-wide">
            Distribución por Disciplina
          </h3>
          {distData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={distData}
                  cx="50%" cy="50%"
                  innerRadius={60} outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {distData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }}
                  labelStyle={{ color: '#C8C8C8' }}
                  itemStyle={{ color: '#E8E8E8' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: '#C8C8C8', fontFamily: 'DM Sans' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-dojo-text/30 text-sm">
              Sin datos disponibles
            </div>
          )}
        </div>

        {/* Payment status */}
        <div className="card p-5">
          <h3 className="font-display text-xl text-dojo-white mb-5 tracking-wide">
            Estado de Pagos
          </h3>
          {paymentData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentData} barSize={32}>
                <XAxis
                  dataKey="name"
                  axisLine={false} tickLine={false}
                  tick={{ fill: '#C8C8C8', fontSize: 12, fontFamily: 'DM Sans' }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }}
                  labelStyle={{ color: '#C8C8C8' }}
                  itemStyle={{ color: '#E8E8E8' }}
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {paymentData.map((_, i) => {
                    const colors = ['#27AE60', '#D4AF37', '#C0392B']
                    return <Cell key={i} fill={colors[i]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-dojo-text/30 text-sm">
              Sin datos disponibles
            </div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent students */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl text-dojo-white tracking-wide">Alumnos Recientes</h3>
            <Link to="/admin/students" className="text-xs text-dojo-red hover:text-dojo-red-bright transition-colors flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && (
              <p className="text-dojo-text/30 text-sm text-center py-4">Sin registros recientes</p>
            )}
            {recent.slice(0, 5).map((s) => (
              <div key={s._id ?? s.id} className="flex items-center gap-3 py-2 border-b border-dojo-border/30 last:border-0">
                <Avatar name={s.fullName} size="sm" src={s.foto} />
                <div className="flex-1 min-w-0">
                  <p className="text-dojo-light text-sm font-500 truncate">{s.fullName}</p>
                  <p className="text-dojo-text/40 text-xs font-mono">
                    {getMartialArtLabel(s.arteMarcial)}
                  </p>
                </div>
                {s.cinturonActual && <BeltBadge cinturon={s.cinturonActual} />}
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl text-dojo-white tracking-wide">Próximos Eventos</h3>
            <Link to="/admin/events" className="text-xs text-dojo-red hover:text-dojo-red-bright transition-colors flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {events.length === 0 && (
              <p className="text-dojo-text/30 text-sm text-center py-4">Sin eventos próximos</p>
            )}
            {events.slice(0, 5).map((ev) => (
              <div key={ev._id ?? ev.id} className="flex items-center gap-3 py-2 border-b border-dojo-border/30 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-dojo-muted/20 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-dojo-text/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dojo-light text-sm font-500 truncate">
                    {ev.title ?? ev.titulo}
                  </p>
                  <p className="text-dojo-text/40 text-xs font-mono flex items-center gap-1">
                    <Clock size={10} />
                    {fmtRelative(ev.date ?? ev.fecha)}
                  </p>
                </div>
                <span className="badge badge-gray text-xs">
                  {ev.type ?? ev.tipo}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}