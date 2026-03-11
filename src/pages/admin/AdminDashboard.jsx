import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CreditCard, Calendar, AlertTriangle, TrendingUp, Clock, ChevronRight } from 'lucide-react'
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
        console.log('🔄 Cargando dashboard...')
        const s = await dashboardService.getStats()
        console.log('✅ stats:', s)
        setStats(s)

        const d = await dashboardService.getDistribution()
        console.log('✅ dist:', d)
        setDist(Array.isArray(d) ? d : (d?.data ?? d?.distribution ?? []))

        const p = await dashboardService.getPaymentsStatus()
        console.log('✅ payments:', p)
        setPayments(p?.data ?? p)

        const a = await dashboardService.getActiveAlerts()
        console.log('✅ alerts:', a)
        setAlerts(a?.data ?? a)

        const r = await dashboardService.getRecentStudents()
        console.log('✅ recent:', r)
        setRecent(Array.isArray(r?.data) ? r.data : (r?.students ?? []))

        const e = await dashboardService.getAdminUpcomingEvents()
        console.log('✅ events:', e)
        setEvents(Array.isArray(e?.data) ? e.data : (e?.events ?? []))
      } catch (err) {
        console.error('❌ Dashboard error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Normalize dist data for chart
  const distData = dist.map((d) => ({
    name: getMartialArtLabel(d.arteMarcial ?? d.arte_marcial ?? d.name ?? d._id),
    value: d.count ?? d.cantidad ?? d.quantity ?? 0,
  }))

  // Payment chart data
  const paymentData = payments ? [
    { name: 'Pagados',   value: payments.paid   ?? payments.pagados   ?? 0 },
    { name: 'Pendientes',value: payments.pending ?? payments.pendientes ?? 0 },
    { name: 'Vencidos',  value: payments.overdue ?? payments.vencidos  ?? 0 },
  ] : []

  const alertCount = alerts
    ? (alerts.paymentAlerts?.length ?? alerts.pagosPendientes?.length ?? 0)
    : 0

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
              value={stats?.totalStudents ?? stats?.totalEstudiantes ?? '—'}
              sub="Total registrados"
            />
            <StatCard
              icon={CreditCard}
              label="Ingresos del mes"
              value={fmtCurrency(stats?.monthlyRevenue ?? stats?.ingresosMes ?? 0)}
              sub="Pagos completados"
              accent
            />
            <StatCard
              icon={Calendar}
              label="Eventos este mes"
              value={stats?.monthlyEvents ?? stats?.eventosMes ?? '—'}
              sub="Programados"
            />
            <StatCard
              icon={AlertTriangle}
              label="Alertas activas"
              value={alertCount}
              sub="Pagos pendientes/vencidos"
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
                  {paymentData.map((entry, i) => {
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
                <Avatar name={s.fullName ?? s.nombre_completo} size="sm" src={s.foto} />
                <div className="flex-1 min-w-0">
                  <p className="text-dojo-light text-sm font-500 truncate">
                    {s.fullName ?? s.nombre_completo}
                  </p>
                  <p className="text-dojo-text/40 text-xs font-mono">
                    {getMartialArtLabel(s.arteMarcial ?? s.arte_marcial)}
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
                <span className={`badge text-xs badge-gray`}>
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