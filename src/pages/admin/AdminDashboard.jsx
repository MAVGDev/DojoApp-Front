import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, CreditCard, Calendar, AlertTriangle, Clock, ChevronRight, GraduationCap, X } from 'lucide-react'
import { dashboardService, studentService } from '../../services/index'
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
  const [examAlerts,    setExamAlerts]    = useState([])
  const [showExamModal, setShowExamModal] = useState(false)

  useEffect(() => {
    async function load() {
      const [s, d, p, a, r, e, allStudentsRes] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getDistribution(),
        dashboardService.getPaymentsStatus(),
        dashboardService.getActiveAlerts(),
        dashboardService.getRecentStudents(),
        dashboardService.getAdminUpcomingEvents(),
        studentService.getAll(),
      ])

      if (s.status === 'fulfilled') setStats(s.value?.data ?? s.value)
      else console.error('❌ getStats:', s.reason)

      if (d.status === 'fulfilled') {
        const dv = d.value
        setDist(dv?.data ?? dv?.distribution ?? (Array.isArray(dv) ? dv : []))
      } else console.error('❌ getDistribution:', d.reason)

      if (p.status === 'fulfilled') setPayments(p.value?.data ?? p.value)
      else console.error('❌ getPaymentsStatus:', p.reason)

      if (a.status === 'fulfilled') setAlerts(a.value?.data ?? a.value)
      else console.error('❌ getActiveAlerts:', a.reason)

      if (r.status === 'fulfilled') {
        const rv = r.value
        setRecent(rv?.data ?? rv?.students ?? (Array.isArray(rv) ? rv : []))
      } else console.error('❌ getRecentStudents:', r.reason)

      if (e.status === 'fulfilled') {
        const ev = e.value
        setEvents(ev?.data ?? ev?.events ?? (Array.isArray(ev) ? ev : []))
      } else console.error('❌ getAdminUpcomingEvents:', e.reason)

      const studentList = allStudentsRes.status === 'fulfilled'
        ? (Array.isArray(allStudentsRes.value) ? allStudentsRes.value : (allStudentsRes.value?.students ?? []))
        : []

      const now      = new Date()
      const oneMonth = new Date()
      oneMonth.setMonth(oneMonth.getMonth() + 1)

      const upcoming = studentList.filter(st => {
        if (!st.fechaProximoExamen) return false
        const examDate = new Date(st.fechaProximoExamen)
        return examDate >= now && examDate <= oneMonth
      }).sort((a, b) => new Date(a.fechaProximoExamen) - new Date(b.fechaProximoExamen))

      setExamAlerts(upcoming)
      setLoading(false)
    }
    load()
  }, [])

  const distData = dist.map((d) => ({
    name:  getMartialArtLabel(d.arte_marcial ?? d.arteMarcial ?? d._id ?? d.name),
    value: d.cantidad ?? d.count ?? 0,
  }))

  const paymentData = payments ? [
    { name: 'Pagados',    value: payments.pagados?.cantidad    ?? payments.paid    ?? 0 },
    { name: 'Pendientes', value: payments.pendientes?.cantidad ?? payments.pending ?? 0 },
    { name: 'Vencidos',   value: payments.vencidos?.cantidad   ?? payments.overdue ?? 0 },
  ] : []

  const alertCount     = alerts ? (alerts.pagosPendientes?.length ?? alerts.paymentAlerts?.length ?? 0) : 0
  const totalStudents  = stats?.totalEstudiantes ?? stats?.totalStudents  ?? '—'
  const monthlyRevenue = stats?.ingresosMes      ?? stats?.monthlyRevenue ?? 0
  const monthlyEvents  = stats?.eventosMes       ?? stats?.monthlyEvents  ?? '—'

  return (
    <div className="space-y-8 slide-up">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Resumen general del gimnasio</p>
      </div>

      {/* Banner pagos vencidos */}
      {alertCount > 0 && (
        <div className="alert-red">
          <AlertTriangle size={16} className="mt-0.5 shrink-0 text-dojo-red" />
          <div className="flex-1">
            <span className="font-500 text-dojo-light">
              {alertCount} {alertCount === 1 ? 'pago vencido' : 'pagos vencidos'}
            </span>
            <span className="text-dojo-text/60 ml-2 text-xs">Revisa la sección de pagos</span>
          </div>
          <Link to="/admin/payments" className="btn-ghost text-xs text-dojo-red">
            Ver alertas <ChevronRight size={12} className="inline" />
          </Link>
        </div>
      )}

      {/* Banner exámenes próximos */}
      {examAlerts.length > 0 && (
        <button
          onClick={() => setShowExamModal(true)}
          className="w-full text-left alert-gold flex items-center gap-3 hover:border-dojo-gold/60 transition-colors cursor-pointer"
        >
          <GraduationCap size={16} className="shrink-0 text-dojo-gold mt-0.5" />
          <div className="flex-1">
            <span className="font-500 text-dojo-light">
              {examAlerts.length} {examAlerts.length === 1 ? 'alumno tiene' : 'alumnos tienen'} examen en el próximo mes
            </span>
            <span className="text-dojo-text/60 ml-2 text-xs">Pulsa para ver el listado</span>
          </div>
          <ChevronRight size={14} className="text-dojo-gold shrink-0" />
        </button>
      )}

      {/* Modal alumnos con examen próximo */}
      {showExamModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowExamModal(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative z-10 w-full max-w-lg bg-dojo-card border border-dojo-border rounded-2xl shadow-card-hover slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-dojo-border">
              <div className="flex items-center gap-2">
                <GraduationCap size={18} className="text-dojo-gold" />
                <h3 className="font-display text-xl text-dojo-white tracking-wide">Exámenes próximos</h3>
              </div>
              <button onClick={() => setShowExamModal(false)} className="btn-ghost p-1.5">
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 max-h-96 overflow-y-auto">
              {examAlerts.map(st => {
                const examDate = new Date(st.fechaProximoExamen)
                const daysLeft = Math.ceil((examDate - new Date()) / (1000 * 60 * 60 * 24))
                const isUrgent = daysLeft <= 7
                return (
                  <div key={st._id} className="flex items-center gap-3 py-2 border-b border-dojo-border/30 last:border-0">
                    <Avatar src={st.foto} name={st.fullName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-dojo-light text-sm font-500 truncate">{st.fullName}</p>
                      <p className="text-dojo-text/40 text-xs font-mono">
                        {getMartialArtLabel(st.arteMarcial)} · {st.categoria}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-xs font-mono font-500 ${isUrgent ? 'text-dojo-red' : 'text-dojo-gold'}`}>
                        {fmtDate(st.fechaProximoExamen, 'dd MMM yyyy')}
                      </p>
                      <p className="text-dojo-text/40 text-xs">
                        {daysLeft === 0 ? 'Hoy' : daysLeft === 1 ? 'Mañana' : `en ${daysLeft} días`}
                      </p>
                    </div>
                    <BeltBadge cinturon={st.cinturonActual} />
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
        ) : (
          <>
            <StatCard icon={Users}         label="Alumnos activos"  value={totalStudents}               sub="Total registrados"        />
            <StatCard icon={CreditCard}    label="Ingresos del mes" value={fmtCurrency(monthlyRevenue)} sub="Pagos completados" accent  />
            <StatCard icon={Calendar}      label="Eventos este mes" value={monthlyEvents}               sub="Programados"              />
            <StatCard icon={AlertTriangle} label="Alertas activas"  value={alertCount}                  sub="Pagos vencidos" alert={alertCount > 0} />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <h3 className="font-display text-xl text-dojo-white mb-5 tracking-wide">Distribución por Disciplina</h3>
          {distData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={distData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {distData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }} labelStyle={{ color: '#C8C8C8' }} itemStyle={{ color: '#E8E8E8' }} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#C8C8C8', fontFamily: 'DM Sans' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-dojo-text/30 text-sm">Sin datos disponibles</div>
          )}
        </div>

        <div className="card p-5">
          <h3 className="font-display text-xl text-dojo-white mb-5 tracking-wide">Estado de Pagos</h3>
          {paymentData.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={paymentData} barSize={32}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#C8C8C8', fontSize: 12, fontFamily: 'DM Sans' }} />
                <YAxis hide />
                <Tooltip contentStyle={{ background: '#1A1A1A', border: '1px solid #2A2A2A', borderRadius: 8 }} labelStyle={{ color: '#C8C8C8' }} itemStyle={{ color: '#E8E8E8' }} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {paymentData.map((_, i) => <Cell key={i} fill={['#27AE60','#D4AF37','#C0392B'][i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-dojo-text/30 text-sm">Sin datos disponibles</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl text-dojo-white tracking-wide">Alumnos Recientes</h3>
            <Link to="/admin/students" className="text-xs text-dojo-red hover:text-dojo-red-bright transition-colors flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && <p className="text-dojo-text/30 text-sm text-center py-4">Sin registros recientes</p>}
            {recent.slice(0, 5).map(s => (
              <div key={s._id} className="flex items-center gap-3 py-2 border-b border-dojo-border/30 last:border-0">
                <Avatar name={s.fullName} size="sm" src={s.foto} />
                <div className="flex-1 min-w-0">
                  <p className="text-dojo-light text-sm font-500 truncate">{s.fullName}</p>
                  <p className="text-dojo-text/40 text-xs font-mono">{getMartialArtLabel(s.arteMarcial)}</p>
                </div>
                {s.cinturonActual && <BeltBadge cinturon={s.cinturonActual} />}
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display text-xl text-dojo-white tracking-wide">Próximos Eventos</h3>
            <Link to="/admin/events" className="text-xs text-dojo-red hover:text-dojo-red-bright transition-colors flex items-center gap-1">
              Ver todos <ChevronRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {events.length === 0 && <p className="text-dojo-text/30 text-sm text-center py-4">Sin eventos próximos</p>}
            {events.slice(0, 5).map(ev => (
              <div key={ev._id} className="flex items-center gap-3 py-2 border-b border-dojo-border/30 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-dojo-muted/20 flex items-center justify-center shrink-0">
                  <Calendar size={14} className="text-dojo-text/40" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dojo-light text-sm font-500 truncate">{ev.title ?? ev.titulo}</p>
                  <p className="text-dojo-text/40 text-xs font-mono flex items-center gap-1">
                    <Clock size={10} /> {fmtRelative(ev.date ?? ev.fecha)}
                  </p>
                </div>
                <span className="badge badge-gray text-xs">{ev.type ?? ev.tipo}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}