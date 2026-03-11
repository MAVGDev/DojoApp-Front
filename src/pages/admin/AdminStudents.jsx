import { useEffect, useState, useCallback } from 'react'
import { Search, UserPlus, Trash2, Eye, Upload, X } from 'lucide-react'
import { studentService } from '../../services/index'
import {
  Spinner, EmptyState, Avatar, BeltBadge, Modal, ConfirmDialog,
  SectionHeader, Skeleton
} from '../../components/ui/index'
import {
  fmtDate, getMartialArtLabel, MARTIAL_ARTS, CATEGORIES, BELT_ORDER,
  BELT_LABELS
} from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function AdminStudents() {
  const [students, setStudents]   = useState([])
  const [loading,  setLoading]    = useState(true)
  const [query,    setQuery]      = useState('')
  const [selected, setSelected]   = useState(null) // student detail modal
  const [confirm,  setConfirm]    = useState(null) // deactivate confirm
  const [creating, setCreating]   = useState(false) // register modal
  const [photoStudent, setPhotoStudent] = useState(null) // photo upload modal

  const load = useCallback(async () => {
    try {
      const data = await studentService.getAll()
      setStudents(Array.isArray(data) ? data : (data?.students ?? []))
    } catch (err) {
      toast.error('Error cargando alumnos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleSearch(e) {
    const q = e.target.value
    setQuery(q)
    if (q.length < 2) {
      if (q.length === 0) load()
      return
    }
    try {
      const data = await studentService.search(q)
      setStudents(Array.isArray(data) ? data : (data?.students ?? []))
    } catch { /* no-op */ }
  }

  async function handleDeactivate(id) {
    try {
      await studentService.deactivate(id)
      toast.success('Alumno desactivado')
      load()
    } catch {
      toast.error('Error al desactivar alumno')
    }
  }

  const filtered = students // already filtered by backend search

  return (
    <div className="space-y-6 slide-up">
      <SectionHeader
        title="Alumnos"
        subtitle={`${students.length} alumnos registrados`}
        action={
          <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-2">
            <UserPlus size={15} />
            Nuevo alumno
          </button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dojo-text/30" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Buscar por nombre, email..."
          value={query}
          onChange={handleSearch}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={Search} title="Sin alumnos" description="No se encontraron resultados" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dojo-dark/50 border-b border-dojo-border">
                <tr>
                  <th className="table-header">Alumno</th>
                  <th className="table-header hidden md:table-cell">Disciplina</th>
                  <th className="table-header hidden lg:table-cell">Cinturón</th>
                  <th className="table-header hidden lg:table-cell">Categoría</th>
                  <th className="table-header hidden xl:table-cell">Registro</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s._id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <Avatar src={s.foto} name={s.fullName} size="sm" />
                        <div>
                          <p className="text-dojo-light font-500 text-sm">{s.fullName}</p>
                          <p className="text-dojo-text/40 text-xs font-mono">{s.user?.email ?? '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-sm">{getMartialArtLabel(s.arteMarcial)}</span>
                    </td>
                    <td className="table-cell hidden lg:table-cell">
                      <BeltBadge cinturon={s.cinturonActual} />
                    </td>
                    <td className="table-cell hidden lg:table-cell capitalize text-sm">
                      {s.categoria}
                    </td>
                    <td className="table-cell hidden xl:table-cell text-xs font-mono text-dojo-text/50">
                      {fmtDate(s.fechaRegistro ?? s.createdAt)}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPhotoStudent(s)}
                          className="btn-ghost p-1.5 text-dojo-text/40 hover:text-dojo-gold"
                          title="Foto"
                        >
                          <Upload size={14} />
                        </button>
                        <button
                          onClick={() => setSelected(s)}
                          className="btn-ghost p-1.5 text-dojo-text/40 hover:text-dojo-light"
                          title="Ver detalle"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => setConfirm(s)}
                          className="btn-ghost p-1.5 text-dojo-text/40 hover:text-dojo-red"
                          title="Desactivar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail modal */}
      <StudentDetailModal student={selected} onClose={() => setSelected(null)} onRefresh={load} />

      {/* Photo upload modal */}
      <PhotoUploadModal
        student={photoStudent}
        onClose={() => setPhotoStudent(null)}
        onRefresh={load}
      />

      {/* Confirm deactivate */}
      <ConfirmDialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={() => handleDeactivate(confirm?._id)}
        title="Desactivar alumno"
        description={`¿Deseas desactivar a ${confirm?.fullName}? El alumno perderá acceso al sistema.`}
        confirmLabel="Desactivar"
        variant="danger"
      />

      {/* Create student modal */}
      <CreateStudentModal
        open={creating}
        onClose={() => setCreating(false)}
        onRefresh={load}
      />
    </div>
  )
}

// ─── STUDENT DETAIL MODAL ────────────────────────────────────────────────────
function StudentDetailModal({ student: s, onClose, onRefresh }) {
  const [editing,      setEditing]      = useState(false)
  const [form,         setForm]         = useState({})
  const [saving,       setSaving]       = useState(false)
  const [localStudent, setLocalStudent] = useState(null)

  useEffect(() => {
    if (s) setLocalStudent(s)
  }, [s])

  useEffect(() => {
    if (s) setForm({
      cinturonActual:   s.cinturonActual ?? 'blanco',
      arteMarcial:      s.arteMarcial ?? 'taekwondo',
      categoria:        s.categoria ?? 'adulto',
      telefono:         s.telefono ?? '',
      contactoEmergencia: s.contactoEmergencia ?? '',
      direccion:        s.direccion ?? '',
      fechaProximoExamen: s.fechaProximoExamen
        ? new Date(s.fechaProximoExamen).toISOString().split('T')[0]
        : '',
      federadoActual:          s.informacionFederacion?.federadoActual ?? false,
      nombreFederacion:        s.informacionFederacion?.nombreFederacion ?? '',
      numeroLicencia:          s.informacionFederacion?.numeroLicencia ?? '',
      tipoLicencia:            s.informacionFederacion?.tipoLicencia ?? 'competencia',
      fechaVencimientoLicencia: s.informacionFederacion?.fechaVencimientoLicencia
        ? new Date(s.informacionFederacion.fechaVencimientoLicencia).toISOString().split('T')[0]
        : '',
    })
  }, [s])

  async function save() {
    setSaving(true)
    try {
      const { federadoActual, nombreFederacion, numeroLicencia,
              tipoLicencia, fechaVencimientoLicencia, ...rest } = form
      const payload = {
        ...rest,
        informacionFederacion: {
          federadoActual,
          nombreFederacion,
          numeroLicencia:           numeroLicencia || undefined,
          tipoLicencia,
          fechaVencimientoLicencia: fechaVencimientoLicencia || null,
        }
      }
      const updated = await studentService.update(localStudent._id, payload)
      // Actualizar localStudent para reflejar cambios en la vista inmediatamente
      setLocalStudent(updated?.student ?? { ...localStudent, ...payload,
        informacionFederacion: payload.informacionFederacion })
      toast.success('Alumno actualizado')
      onRefresh()
      setEditing(false)
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  if (!s) return null

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <Modal open={!!s} onClose={onClose} title="Ficha del Alumno" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Avatar src={localStudent?.foto} name={localStudent?.fullName} size="xl" />
          <div>
            <h3 className="font-display text-2xl text-dojo-white">{localStudent?.fullName}</h3>
            <p className="text-dojo-text/50 text-sm font-mono">{localStudent?.user?.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <BeltBadge cinturon={localStudent?.cinturonActual} />
              <span className="badge badge-gray capitalize">{localStudent?.arteMarcial}</span>
              <span className="badge badge-gray capitalize">{localStudent?.categoria}</span>
            </div>
          </div>
        </div>

        <div className="divider" />

        {editing ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Arte marcial</label>
              <select className="input" value={form.arteMarcial} onChange={set('arteMarcial')}>
                {MARTIAL_ARTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Categoría</label>
              <select className="input" value={form.categoria} onChange={set('categoria')}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Cinturón actual</label>
              <select className="input" value={form.cinturonActual} onChange={set('cinturonActual')}>
                {BELT_ORDER.map(b => <option key={b} value={b}>{BELT_LABELS[b]}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Próximo examen</label>
              <input type="date" className="input" value={form.fechaProximoExamen} onChange={set('fechaProximoExamen')} />
            </div>
            <div>
              <label className="label">Teléfono</label>
              <input type="text" className="input" value={form.telefono} onChange={set('telefono')} />
            </div>
            <div>
              <label className="label">Contacto emergencia</label>
              <input type="text" className="input" value={form.contactoEmergencia} onChange={set('contactoEmergencia')} />
            </div>
            <div className="col-span-2">
              <label className="label">Dirección</label>
              <input type="text" className="input" value={form.direccion} onChange={set('direccion')} />
            </div>

            {/* Separador federación */}
            <div className="col-span-2 pt-2">
              <p className="label text-dojo-gold/70">Información federativa</p>
            </div>

            <div className="col-span-2 flex items-center gap-3">
              <input
                type="checkbox"
                id="federado"
                checked={form.federadoActual}
                onChange={(e) => setForm({ ...form, federadoActual: e.target.checked })}
                className="w-4 h-4 accent-dojo-red"
              />
              <label htmlFor="federado" className="text-sm text-dojo-text cursor-pointer">
                Alumno federado
              </label>
            </div>

            {form.federadoActual && (<>
              <div>
                <label className="label">Federación</label>
                <input type="text" className="input" value={form.nombreFederacion} onChange={set('nombreFederacion')} placeholder="Nombre de la federación" />
              </div>
              <div>
                <label className="label">Nº de licencia</label>
                <input type="text" className="input" value={form.numeroLicencia} onChange={set('numeroLicencia')} placeholder="Número de licencia" />
              </div>
              <div>
                <label className="label">Tipo de licencia</label>
                <select className="input" value={form.tipoLicencia} onChange={set('tipoLicencia')}>
                  <option value="competencia">Competencia</option>
                  <option value="instructor">Instructor</option>
                  <option value="arbitro">Árbitro</option>
                  <option value="general">General</option>
                </select>
              </div>
              <div>
                <label className="label">Vencimiento licencia</label>
                <input type="date" className="input" value={form.fechaVencimientoLicencia} onChange={set('fechaVencimientoLicencia')} />
              </div>
            </>)}
            <div className="col-span-2 flex gap-3 justify-end">
              <button onClick={() => setEditing(false)} className="btn-secondary">Cancelar</button>
              <button onClick={save} disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <Spinner size="sm" />} Guardar
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <Info label="Fecha de nacimiento" value={fmtDate(localStudent?.fechaNacimiento)} />
            <Info label="Teléfono"  value={localStudent?.telefono} />
            <Info label="Dirección" value={localStudent?.direccion} />
            <Info label="Contacto emergencia" value={localStudent?.contactoEmergencia} />
            <Info label="Federado" value={localStudent?.informacionFederacion?.federadoActual ? 'Sí' : 'No'} />
            {localStudent?.informacionFederacion?.federadoActual && (<>
              {localStudent?.informacionFederacion?.nombreFederacion && (
                <Info label="Federación" value={localStudent.informacionFederacion.nombreFederacion} />
              )}
              {localStudent?.informacionFederacion?.numeroLicencia && (
                <Info label="Nº Licencia" value={localStudent.informacionFederacion.numeroLicencia} />
              )}
              {localStudent?.informacionFederacion?.tipoLicencia && (
                <Info label="Tipo licencia" value={localStudent.informacionFederacion.tipoLicencia} />
              )}
              {localStudent?.informacionFederacion?.fechaVencimientoLicencia && (
                <Info label="Vence" value={fmtDate(localStudent.informacionFederacion.fechaVencimientoLicencia)} />
              )}
            </>)}
            <Info label="Próximo examen" value={fmtDate(localStudent?.fechaProximoExamen)} />
            <Info label="Registro" value={fmtDate(localStudent?.fechaRegistro ?? localStudent?.createdAt)} />
          </div>
        )}

        {!editing && (
          <div className="flex justify-end">
            <button onClick={() => setEditing(true)} className="btn-secondary">Editar alumno</button>
          </div>
        )}
      </div>
    </Modal>
  )
}

function Info({ label, value }) {
  return (
    <div>
      <p className="label mb-0.5">{label}</p>
      <p className="text-dojo-light">{value || '—'}</p>
    </div>
  )
}

// ─── PHOTO UPLOAD MODAL ──────────────────────────────────────────────────────
function PhotoUploadModal({ student, onClose, onRefresh }) {
  const [file,    setFile]    = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleFile(e) {
    const f = e.target.files[0]
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function upload() {
    if (!file) return
    setLoading(true)
    try {
      await studentService.uploadPhoto(student._id, file)
      toast.success('Foto actualizada')
      onRefresh()
      onClose()
    } catch {
      toast.error('Error al subir la foto')
    } finally {
      setLoading(false)
    }
  }

  async function deletePhoto() {
    setLoading(true)
    try {
      await studentService.deletePhoto(student._id)
      toast.success('Foto eliminada')
      onRefresh()
      onClose()
    } catch {
      toast.error('Error al eliminar la foto')
    } finally {
      setLoading(false)
    }
  }

  if (!student) return null

  return (
    <Modal open={!!student} onClose={onClose} title="Foto del alumno" size="sm">
      <div className="flex flex-col items-center gap-5">
        <Avatar src={preview ?? student.foto} name={student.fullName} size="2xl" />
        <div className="w-full space-y-3">
          <label className="btn-secondary w-full flex items-center justify-center gap-2 cursor-pointer">
            <Upload size={15} />
            Seleccionar foto
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          {file && (
            <button onClick={upload} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading && <Spinner size="sm" />}
              Subir foto
            </button>
          )}
          {student.foto && !file && (
            <button onClick={deletePhoto} disabled={loading} className="btn-ghost w-full text-dojo-red/70 hover:text-dojo-red text-sm">
              Eliminar foto actual
            </button>
          )}
        </div>
      </div>
    </Modal>
  )
}

// ─── CREATE STUDENT MODAL ────────────────────────────────────────────────────
function CreateStudentModal({ open, onClose, onRefresh }) {
  const [form, setForm] = useState({
    email: '', password: '', fullName: '', fechaNacimiento: '',
    arteMarcial: 'taekwondo', telefono: '',
    contactoEmergencia: '', direccion: ''
  })
  const [loading, setLoading] = useState(false)

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      // authController.registerUser crea User + Student en una sola llamada
      await import('../../services/api').then(({ default: api }) =>
        api.post('/auth/register', form)
      )
      toast.success('Alumno registrado correctamente')
      onRefresh()
      onClose()
      setForm({ email: '', password: '', fullName: '', fechaNacimiento: '',
                arteMarcial: 'taekwondo', telefono: '', contactoEmergencia: '', direccion: '' })
    } catch (err) {
      toast.error(err.response?.data?.message ?? 'Error al registrar alumno')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo Alumno" size="lg">
      <form onSubmit={submit} className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Nombre completo *</label>
          <input className="input" value={form.fullName} onChange={set('fullName')} required placeholder="Juan García López" />
        </div>
        <div>
          <label className="label">Email *</label>
          <input type="email" className="input" value={form.email} onChange={set('email')} required />
        </div>
        <div>
          <label className="label">Contraseña *</label>
          <input type="password" className="input" value={form.password} onChange={set('password')} required minLength={6} placeholder="Mínimo 6 caracteres" />
        </div>
        <div>
          <label className="label">Fecha de nacimiento *</label>
          <input type="date" className="input" value={form.fechaNacimiento} onChange={set('fechaNacimiento')} required />
        </div>
        <div>
          <label className="label">Arte marcial *</label>
          <select className="input" value={form.arteMarcial} onChange={set('arteMarcial')}>
            {MARTIAL_ARTS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Teléfono *</label>
          <input type="tel" className="input" value={form.telefono} onChange={set('telefono')} required />
        </div>
        <div>
          <label className="label">Contacto emergencia *</label>
          <input type="text" className="input" value={form.contactoEmergencia} onChange={set('contactoEmergencia')} required />
        </div>
        <div className="col-span-2">
          <label className="label">Dirección *</label>
          <input type="text" className="input" value={form.direccion} onChange={set('direccion')} required />
        </div>
        <div className="col-span-2 flex gap-3 justify-end pt-2">
          <button type="button" onClick={onClose} className="btn-secondary">Cancelar</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <Spinner size="sm" />} Registrar alumno
          </button>
        </div>
      </form>
    </Modal>
  )
}