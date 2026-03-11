import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { dashboardService, studentService } from '../../services/index'
import { StatCard, CardSkeleton, BeltBadge, StatusBadge, Avatar } from '../../components/ui/index'
import { fmtDate, fmtMonth, fmtCurrency, getMartialArtLabel, BELT_ORDER } from '../../utils/helpers'
import { CreditCard, Calendar, Award, Clock } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [profile,   setProfile]   = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const prof = await studentService.getMyProfile()
        // studentController devuelve { message, profile: {...} }
        const studentData = prof?.profile ?? prof?.student ?? prof
        setProfile(studentData)
        const studentId = studentData?._id
        if (studentId) {
          const dash = await dashboardService.getStudentDashboard(studentId)
          setDashboard(dash)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="space-y-6">
      <div className="page-header"><div className="h-10 w-64 bg-dojo-muted/20 rounded animate-pulse" /></div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({length:4}).map((_,i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  )

  const belt    = profile?.cinturonActual ?? 'blanco'
  const beltIdx = BELT_ORDER.indexOf(belt)
  const nextBelt = beltIdx < BELT_ORDER.length - 1 ? BELT_ORDER[beltIdx + 1] : null
  const payments = Array.isArray(dashboard?.payments ?? dashboard?.pagos)
    ? (dashboard?.payments ?? dashboard?.pagos)
    : []
  const pendingCount = payments.filter(p => !p.paid).length
  const events = Array.isArray(dashboard?.events ?? dashboard?.eventos)
    ? (dashboard?.events ?? dashboard?.eventos)
    : []

  return (
    <div className="space-y-8 slide-up">
      {/* Header */}
      <div className="page-header flex items-center gap-4">
        <Avatar src={profile?.foto} name={profile?.fullName} size="xl" />
        <div>
          <h1 className="page-title">{profile?.fullName ?? user?.email}</h1>
          <div className="flex items-center gap-2 mt-2">
            <BeltBadge cinturon={belt} />
            <span className="badge badge-gray capitalize">{getMartialArtLabel(profile?.arteMarcial)}</span>
            <span className="badge badge-gray capitalize">{profile?.categoria}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Award}
          label="Cinturón actual"
          value={belt?.replace(/-/g, ' ')}
          sub={nextBelt ? `Siguiente: ${nextBelt.replace(/-/g,' ')}` : 'Nivel máximo'}
          accent
        />
        <StatCard
          icon={CreditCard}
          label="Pagos pendientes"
          value={pendingCount}
          sub="Este año"
          alert={pendingCount > 0}
        />
        <StatCard
          icon={Calendar}
          label="Eventos próximos"
          value={events.length}
          sub="Asignados"
        />
        <StatCard
          icon={Clock}
          label="Próximo examen"
          value={profile?.fechaProximoExamen ? fmtDate(profile.fechaProximoExamen, 'dd MMM') : '—'}
          sub={profile?.fechaProximoExamen ? fmtDate(profile.fechaProximoExamen, 'yyyy') : 'Sin programar'}
        />
      </div>

      {/* Belt progression */}
      <div className="card p-5">
        <h3 className="font-display text-xl text-dojo-white mb-5 tracking-wide">Progresión de Grado</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {BELT_ORDER.map((b, i) => {
            const passed  = i < beltIdx
            const current = i === beltIdx
            return (
              <div key={b} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono
                  ${current ? 'ring-2 ring-dojo-gold ring-offset-2 ring-offset-dojo-card' : ''}
                  ${passed  ? 'opacity-80' : current ? '' : 'opacity-20'}
                  ${b === 'blanco' ? 'bg-white text-black border border-gray-300'
                    : b === 'amarillo' ? 'bg-yellow-400 text-black'
                    : b === 'naranja'  ? 'bg-orange-500 text-white'
                    : b === 'verde'    ? 'bg-green-600 text-white'
                    : b === 'azul'     ? 'bg-blue-600 text-white'
                    : b === 'violeta'  ? 'bg-purple-700 text-white'
                    : b === 'marron'   ? 'bg-amber-800 text-white'
                    : b === 'rojo'     ? 'bg-red-600 text-white'
                    : 'bg-black text-yellow-400 border border-yellow-500/40'
                  }
                `}>
                  {passed ? '✓' : current ? '●' : ''}
                </div>
                {current && (
                  <span className="text-dojo-gold text-xs font-mono whitespace-nowrap">tú</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent payments */}
        <div className="card p-5">
          <h3 className="font-display text-xl text-dojo-white mb-5 tracking-wide">Mis Pagos</h3>
          <div className="space-y-3">
            {payments.length === 0 && (
              <p className="text-dojo-text/30 text-sm text-center py-4">Sin pagos registrados</p>
            )}
            {payments.slice(0, 6).map((p, i) => (
              <div key={p._id ?? i} className="flex items-center justify-between py-2 border-b border-dojo-border/30 last:border-0">
                <div>
                  <p className="text-dojo-light text-sm font-500">{fmtMonth(p.month)}</p>
                  <p className="text-dojo-text/40 text-xs font-mono">{fmtCurrency(p.amount)}</p>
                </div>
                <StatusBadge paid={p.paid} dueDate={p.dueDate} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="card p-5">
          <h3 className="font-display text-xl text-dojo-white mb-5 tracking-wide">Mis Eventos</h3>
          <div className="space-y-3">
            {events.length === 0 && (
              <p className="text-dojo-text/30 text-sm text-center py-4">Sin eventos asignados</p>
            )}
            {events.slice(0, 5).map((ev, i) => (
              <div key={ev._id ?? i} className="flex items-center gap-3 py-2 border-b border-dojo-border/30 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-dojo-muted/20 flex flex-col items-center justify-center shrink-0">
                  <span className="font-display text-lg text-dojo-white leading-none">
                    {new Date(ev.date ?? ev.fecha).getDate()}
                  </span>
                  <span className="text-dojo-text/40 text-xs font-mono uppercase">
                    {fmtDate(ev.date ?? ev.fecha, 'MMM')}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-dojo-light text-sm font-500 truncate">{ev.title ?? ev.titulo}</p>
                  <p className="text-dojo-text/40 text-xs font-mono capitalize">{ev.type ?? ev.tipo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}