import { useEffect, useState, useCallback } from 'react'
import { Plus, Calendar, Clock, MapPin, Trash2, Edit, Users } from 'lucide-react'
import { eventService } from '../../services/index'
import {
  Spinner, EmptyState, Modal, ConfirmDialog, SectionHeader, Skeleton
} from '../../components/ui/index'
import {
  fmtDate, fmtDateTime, EVENT_TYPES, EVENT_TYPE_CSS, MARTIAL_ARTS_ALL
} from '../../utils/helpers'
import toast from 'react-hot-toast'

const TYPE_COLORS = {
  'competición':   'border-dojo-red/40 bg-dojo-red/5',
  'examen':        'border-dojo-gold/40 bg-dojo-gold/5',
  'entrenamiento': 'border-dojo-success/40 bg-dojo-success/5',
  'general':       'border-dojo-border bg-dojo-muted/5',
}

export default function AdminEvents() {
  const [events,  setEvents]  = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(null) // null | 'create' | event object (edit)
  const [confirm, setConfirm] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await eventService.getAll()
      const arr = Array.isArray(data) ? data : (data?.events ?? [])
      // Sort by date ascending
      arr.sort((a, b) => new Date(a.date ?? a.fecha) - new Date(b.date ?? b.fecha))
      setEvents(arr)
    } catch {
      toast.error('Error cargando eventos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleDelete(id) {
    try {
      await eventService.delete(id)
      toast.success('Evento eliminado')
      load()
    } catch {
      toast.error('Error al eliminar evento')
    }
  }

  const upcoming = events.filter(e => new Date(e.date ?? e.fecha) >= new Date())
  const past     = events.filter(e => new Date(e.date ?? e.fecha) <  new Date())

  return (
    <div className="space-y-6 slide-up">
      <SectionHeader
        title="Eventos"
        subtitle={`${upcoming.length} eventos próximos`}
        action={
          <button onClick={() => setModal('create')} className="btn-primary flex items-center gap-2">
            <Plus size={15} />
            Nuevo evento
          </button>
        }
      />

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 w-full" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="card">
          <EmptyState icon={Calendar} title="Sin eventos" description="Crea el primer evento del gimnasio" />
        </div>
      ) : (
        <div className="space-y-8">
          {upcoming.length > 0 && (
            <section>
              <p className="label mb-4">Próximos</p>
              <div className="space-y-3">
                {upcoming.map(ev => (
                  <EventCard key={ev._id} event={ev} onEdit={() => setModal(ev)} onDelete={() => setConfirm(ev)} />
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <p className="label mb-4">Pasados</p>
              <div className="space-y-3 opacity-60">
                {past.slice(0, 5).map(ev => (
                  <EventCard key={ev._id} event={ev} onEdit={() => setModal(ev)} onDelete={() => setConfirm(ev)} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      <EventFormModal
        open={!!modal}
        event={modal === 'create' ? null : modal}
        onClose={() => setModal(null)}
        onRefresh={load}
      />

      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleDelete(confirm?._id)}
        title="Eliminar evento"
        description={`¿Eliminar "${confirm?.title ?? confirm?.titulo}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        variant="danger"
      />
    </div>
  )
}

// ─── EVENT CARD ───────────────────────────────────────────────────────────────
function EventCard({ event: ev, onEdit, onDelete }) {
  const type   = ev.type ?? ev.tipo ?? 'general'
  const title  = ev.title ?? ev.titulo
  const date   = ev.date ?? ev.fecha
  const typeStyle = TYPE_COLORS[type] ?? TYPE_COLORS.general

  return (
    <div className={`card p-4 border ${typeStyle} flex items-start gap-4 group`}>
      {/* Date block */}
      <div className="shrink-0 w-14 text-center">
        <p className="font-display text-2xl text-dojo-white leading-none">
          {new Date(date).getDate()}
        </p>
        <p className="text-dojo-text/40 text-xs font-mono uppercase mt-0.5">
          {fmtDate(date, 'MMM')}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-dojo-light font-500 text-sm truncate">{title}</h4>
          <span className={`${EVENT_TYPE_CSS[type] ?? 'badge-gray'} badge text-xs`}>{type}</span>
        </div>
        <div className="flex flex-wrap gap-3 text-xs text-dojo-text/40 font-mono">
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {fmtDateTime(date)}
          </span>
          {ev.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              {ev.location}
            </span>
          )}
          {ev.duration > 0 && (
            <span>{ev.duration} min</span>
          )}
          {ev.martialArt && ev.martialArt !== 'all' && (
            <span className="badge badge-gray capitalize">{ev.martialArt}</span>
          )}
          {!ev.visibleToStudents && (
            <span className="badge badge-gray">Solo admin</span>
          )}
        </div>
        {ev.description && (
          <p className="text-dojo-text/50 text-xs mt-1.5 line-clamp-2">{ev.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} className="btn-ghost p-1.5 text-dojo-text/40 hover:text-dojo-light">
          <Edit size={14} />
        </button>
        <button onClick={onDelete} className="btn-ghost p-1.5 text-dojo-text/40 hover:text-dojo-red">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

// ─── EVENT FORM MODAL ─────────────────────────────────────────────────────────
function EventFormModal({ open, event, onClose, onRefresh }) {
  const isEdit = !!event
  const [form, setForm] = useState({
    title: '', description: '', date: '', type: 'general',
    martialArt: 'all', location: '', duration: 60,
    visibleToStudents: true, participantLimit: 0, cost: 0
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (event) {
      setForm({
        title:              event.title ?? '',
        description:        event.description ?? '',
        date:               event.date ? new Date(event.date).toISOString().slice(0,16) : '',
        type:               event.type ?? 'general',
        martialArt:         event.martialArt ?? 'all',
        location:           event.location ?? '',
        duration:           event.duration ?? 60,
        visibleToStudents:  event.visibleToStudents ?? true,
        participantLimit:   event.participantLimit ?? 0,
        cost:               event.cost ?? 0,
      })
    } else {
      setForm({ title:'', description:'', date:'', type:'general', martialArt:'all',
                location:'', duration:60, visibleToStudents:true, participantLimit:0, cost:0 })
    }
  }, [event, open])

  const set = (f) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked
      : ['duration','participantLimit','cost'].includes(f) ? Number(e.target.value)
      : e.target.value
    setForm(prev => ({ ...prev, [f]: val }))
  }

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isEdit) {
        await eventService.update(event._id, form)
        toast.success('Evento actualizado')
      } else {
        await eventService.create(form)
        toast.success('Evento creado')
      }
      onRefresh()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al guardar evento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Evento' : 'Nuevo Evento'} size="lg">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label">Título *</label>
          <input className="input" value={form.title} onChange={set('title')} required maxLength={100} />
        </div>

        <div>
          <label className="label">Descripción</label>
          <textarea className="input resize-none" rows={2} value={form.description} onChange={set('description')} maxLength={1000} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Fecha y hora *</label>
            <input type="datetime-local" className="input" value={form.date} onChange={set('date')} required />
          </div>
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.type} onChange={set('type')}>
              {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Disciplina</label>
            <select className="input" value={form.martialArt} onChange={set('martialArt')}>
              {MARTIAL_ARTS_ALL.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Duración (min)</label>
            <input type="number" min="0" className="input" value={form.duration} onChange={set('duration')} />
          </div>
          <div>
            <label className="label">Ubicación</label>
            <input type="text" className="input" value={form.location} onChange={set('location')} maxLength={200} />
          </div>
          <div>
            <label className="label">Coste (€)</label>
            <input type="number" min="0" step="0.01" className="input" value={form.cost} onChange={set('cost')} />
          </div>
          <div>
            <label className="label">Límite participantes (0 = sin límite)</label>
            <input type="number" min="0" className="input" value={form.participantLimit} onChange={set('participantLimit')} />
          </div>
          <div className="flex items-center gap-3 pt-6">
            <input
              type="checkbox"
              id="visible"
              checked={form.visibleToStudents}
              onChange={set('visibleToStudents')}
              className="w-4 h-4 accent-dojo-red"
            />
            <label htmlFor="visible" className="text-sm text-dojo-text cursor-pointer">
              Visible para alumnos
            </label>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <Spinner size="sm" />}
            {isEdit ? 'Guardar cambios' : 'Crear evento'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
