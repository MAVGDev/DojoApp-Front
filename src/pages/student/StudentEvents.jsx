import { useEffect, useState } from 'react'
import { Calendar, Clock, MapPin, Users, Tag } from 'lucide-react'
import { eventService } from '../../services/index'
import { Spinner, EmptyState } from '../../components/ui/index'
import { fmtDate, fmtDateTime, fmtRelative, EVENT_TYPE_CSS } from '../../utils/helpers'

export default function StudentEvents() {
  const [events,   setEvents]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('upcoming') // 'upcoming' | 'all'

  useEffect(() => {
    const fn = filter === 'upcoming' ? eventService.getUpcoming : eventService.getAll
    fn()
      .then(d => {
        const arr = Array.isArray(d) ? d : (d?.events ?? [])
        arr.sort((a, b) => new Date(a.date ?? a.fecha) - new Date(b.date ?? b.fecha))
        setEvents(arr)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [filter])

  return (
    <div className="space-y-6 slide-up max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">Eventos</h1>
        <p className="page-subtitle">Competiciones, exámenes y entrenamientos</p>
      </div>

      {/* Filter toggle */}
      <div className="flex gap-1 bg-dojo-dark p-1 rounded-lg w-fit border border-dojo-border">
        {[
          { key: 'upcoming', label: 'Próximos' },
          { key: 'all',      label: 'Todos'    },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setLoading(true) }}
            className={`px-4 py-2 rounded-md text-sm transition-all
              ${filter === key
                ? 'bg-dojo-red text-white shadow'
                : 'text-dojo-text/60 hover:text-dojo-text'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Events list */}
      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : events.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={Calendar}
            title="Sin eventos"
            description={filter === 'upcoming' ? 'No hay eventos próximos' : 'No hay eventos registrados'}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <EventCard key={ev._id} event={ev} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({ event: ev }) {
  const type  = ev.type  ?? ev.tipo  ?? 'general'
  const title = ev.title ?? ev.titulo
  const date  = ev.date  ?? ev.fecha
  const isPast = new Date(date) < new Date()

  const borderColors = {
    'competición':   'border-l-dojo-red',
    'examen':        'border-l-dojo-gold',
    'entrenamiento': 'border-l-dojo-success',
    'general':       'border-l-dojo-muted',
  }

  return (
    <div className={`card p-5 border-l-4 ${borderColors[type] ?? borderColors.general} ${isPast ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-dojo-light font-500 text-base">{title}</h4>
            <span className={`${EVENT_TYPE_CSS[type] ?? 'badge-gray'} badge text-xs`}>{type}</span>
          </div>

          <div className="flex flex-wrap gap-4 text-xs text-dojo-text/50 font-mono">
            <span className="flex items-center gap-1.5">
              <Clock size={12} />
              {fmtDateTime(date)}
            </span>
            {ev.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={12} />
                {ev.location}
              </span>
            )}
            {ev.duration > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {ev.duration} min
              </span>
            )}
            {ev.participantLimit > 0 && (
              <span className="flex items-center gap-1.5">
                <Users size={12} />
                Máx. {ev.participantLimit}
              </span>
            )}
            {ev.martialArt && ev.martialArt !== 'all' && (
              <span className="flex items-center gap-1.5">
                <Tag size={12} />
                {ev.martialArt}
              </span>
            )}
          </div>

          {ev.description && (
            <p className="text-dojo-text/50 text-sm mt-3 leading-relaxed">{ev.description}</p>
          )}

          {ev.cost > 0 && (
            <p className="text-dojo-gold text-xs font-mono mt-2">
              Coste: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(ev.cost)}
            </p>
          )}
        </div>

        {/* Date block */}
        <div className="shrink-0 text-right">
          <p className="font-display text-3xl text-dojo-white leading-none">
            {new Date(date).getDate()}
          </p>
          <p className="text-dojo-text/40 text-xs font-mono uppercase">
            {fmtDate(date, 'MMM yyyy')}
          </p>
          <p className="text-dojo-text/30 text-xs font-mono mt-1">
            {fmtRelative(date)}
          </p>
        </div>
      </div>
    </div>
  )
}
