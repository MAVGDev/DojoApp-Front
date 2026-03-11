import { useEffect, useState } from 'react'
import { Camera, Save, Trash2 } from 'lucide-react'
import { studentService } from '../../services/index'
import {
  Spinner, Avatar, BeltBadge, InlineAlert, FormField
} from '../../components/ui/index'
import {
  fmtDate, getMartialArtLabel, MARTIAL_ARTS, CATEGORIES
} from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function StudentProfile() {
  const [profile,  setProfile]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [editing,  setEditing]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [form,     setForm]     = useState({})
  const [photoFile,setPhotoFile]= useState(null)
  const [preview,  setPreview]  = useState(null)
  const [error,    setError]    = useState('')

  async function loadProfile() {
    try {
      const data = await studentService.getMyProfile()
      const s = data?.profile ?? data?.student ?? data
      setProfile(s)
      setForm({
        telefono:           s.telefono ?? '',
        contactoEmergencia: s.contactoEmergencia ?? '',
        direccion:          s.direccion ?? '',
      })
    } catch { toast.error('Error cargando perfil') }
    finally { setLoading(false) }
  }

  useEffect(() => { loadProfile() }, [])

  function handlePhotoChange(e) {
    const f = e.target.files[0]
    if (!f) return
    setPhotoFile(f)
    setPreview(URL.createObjectURL(f))
  }

  async function uploadPhoto() {
    if (!photoFile) return
    setSaving(true)
    try {
      await studentService.uploadMyPhoto(photoFile)
      toast.success('Foto actualizada')
      setPhotoFile(null)
      setPreview(null)
      loadProfile()
    } catch { toast.error('Error al subir foto') }
    finally { setSaving(false) }
  }

  async function deletePhoto() {
    setSaving(true)
    try {
      await studentService.deleteMyPhoto()
      toast.success('Foto eliminada')
      loadProfile()
    } catch { toast.error('Error al eliminar foto') }
    finally { setSaving(false) }
  }

  async function saveProfile(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      await studentService.updateMyProfile(form)
      toast.success('Perfil actualizado')
      setEditing(false)
      loadProfile()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error al guardar')
    } finally { setSaving(false) }
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  )

  const s = profile

  return (
    <div className="max-w-2xl space-y-8 slide-up">
      <div className="page-header">
        <h1 className="page-title">Mi Perfil</h1>
        <p className="page-subtitle">Información personal y datos de entrenamiento</p>
      </div>

      {/* Photo + basic info */}
      <div className="card p-6">
        <div className="flex items-start gap-6">
          {/* Avatar with upload */}
          <div className="relative group shrink-0">
            <Avatar src={preview ?? s?.foto} name={s?.fullName} size="2xl" />
            <label
              className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100
                         transition-opacity flex items-center justify-center cursor-pointer"
            >
              <Camera size={20} className="text-white" />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>

          <div className="flex-1">
            <h2 className="font-display text-2xl text-dojo-white">{s?.fullName}</h2>
            <div className="flex flex-wrap gap-2 mt-2">
              <BeltBadge cinturon={s?.cinturonActual} />
              <span className="badge badge-gray capitalize">{getMartialArtLabel(s?.arteMarcial)}</span>
              <span className="badge badge-gray capitalize">{s?.categoria}</span>
            </div>

            {photoFile && (
              <div className="flex gap-2 mt-4">
                <button onClick={uploadPhoto} disabled={saving} className="btn-primary text-xs flex items-center gap-1.5 py-2">
                  {saving ? <Spinner size="sm" /> : <Save size={13} />} Guardar foto
                </button>
                <button onClick={() => { setPhotoFile(null); setPreview(null) }} className="btn-secondary text-xs py-2">
                  Cancelar
                </button>
              </div>
            )}
            {!photoFile && s?.foto && (
              <button onClick={deletePhoto} disabled={saving} className="mt-4 btn-ghost text-xs text-dojo-red/60 hover:text-dojo-red flex items-center gap-1">
                <Trash2 size={12} /> Eliminar foto
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info sections */}
      <div className="card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-dojo-white tracking-wide">Información personal</h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-secondary text-sm">Editar</button>
          )}
        </div>

        {error && <InlineAlert type="error" message={error} />}

        {editing ? (
          <form onSubmit={saveProfile} className="space-y-4">
            <FormField label="Teléfono">
              <input type="tel" className="input" value={form.telefono} onChange={set('telefono')} />
            </FormField>
            <FormField label="Contacto de emergencia">
              <input type="text" className="input" value={form.contactoEmergencia} onChange={set('contactoEmergencia')} />
            </FormField>
            <FormField label="Dirección">
              <input type="text" className="input" value={form.direccion} onChange={set('direccion')} />
            </FormField>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)} className="btn-secondary">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                {saving && <Spinner size="sm" />} Guardar cambios
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-y-5 gap-x-8 text-sm">
            <InfoRow label="Fecha de nacimiento" value={fmtDate(s?.fechaNacimiento)} />
            <InfoRow label="Teléfono"             value={s?.telefono} />
            <InfoRow label="Dirección"             value={s?.direccion} />
            <InfoRow label="Contacto emergencia"  value={s?.contactoEmergencia} />
            <InfoRow label="Miembro desde"        value={fmtDate(s?.fechaRegistro ?? s?.createdAt)} />
            {s?.fechaProximoExamen && (
              <InfoRow label="Próximo examen" value={fmtDate(s.fechaProximoExamen)} />
            )}
          </div>
        )}
      </div>

      {/* Federation info */}
      {s?.informacionFederacion?.federadoActual && (
        <div className="card p-6">
          <h3 className="font-display text-xl text-dojo-white mb-5 tracking-wide">Información Federativa</h3>
          <div className="grid grid-cols-2 gap-y-5 gap-x-8 text-sm">
            <InfoRow label="Federación"       value={s.informacionFederacion.nombreFederacion} />
            <InfoRow label="Nº de licencia"   value={s.informacionFederacion.numeroLicencia} />
            <InfoRow label="Tipo de licencia" value={s.informacionFederacion.tipoLicencia} />
            <InfoRow label="Vence"            value={fmtDate(s.informacionFederacion.fechaVencimientoLicencia)} />
          </div>
        </div>
      )}

      {/* Belt history */}
      {s?.historialCinturones?.length > 0 && (
        <div className="card p-6">
          <h3 className="font-display text-xl text-dojo-white mb-5 tracking-wide">Historial de Grados</h3>
          <div className="space-y-3">
            {s.historialCinturones.map((h, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-dojo-border/30 last:border-0">
                <BeltBadge cinturon={h.cinturon} />
                <div className="flex-1">
                  <p className="text-dojo-text/40 text-xs font-mono">{fmtDate(h.fechaObtencion)}</p>
                  {h.instructor && <p className="text-dojo-text/60 text-xs">Instructor: {h.instructor}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="label mb-0.5">{label}</p>
      <p className="text-dojo-light">{value || '—'}</p>
    </div>
  )
}