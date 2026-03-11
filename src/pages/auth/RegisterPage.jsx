import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff } from 'lucide-react'
import { authService } from '../../services/authService'
import { InlineAlert, Spinner } from '../../components/ui/index'
import { MARTIAL_ARTS } from '../../utils/helpers'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    telefono: '',
    fechaNacimiento: '',
    arteMarcial: 'taekwondo',
    direccion: '',
    contactoEmergencia: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.register(form)
      toast.success('Cuenta creada correctamente. Inicia sesión.')
      navigate('/login')
    } catch (err) {
      console.error('Error completo:', err)
      console.error('Response:', err.response)
      console.error('Message:', err.message)
      setError(err.response?.data?.message ?? err.message ?? 'Error al crear la cuenta')
    } finally {
      setLoading(false)
    }
  }

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  return (
    <div className="min-h-screen bg-dojo-black flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">

        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-dojo-red rounded-lg flex items-center justify-center glow-red">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-display text-2xl text-dojo-white tracking-widest">DOJOAPP</span>
        </div>

        <div className="mb-8">
          <h2 className="font-display text-4xl text-dojo-white tracking-wide mb-2">Crear cuenta</h2>
          <p className="text-dojo-text/50 text-sm">Completa tus datos para unirte al gimnasio</p>
        </div>

        {error && <div className="mb-6"><InlineAlert type="error" message={error} /></div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="label">Nombre completo *</label>
            <input type="text" className="input" placeholder="Juan García López"
              value={form.fullName} onChange={set('fullName')} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Email *</label>
              <input type="email" className="input" placeholder="tu@email.com"
                value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="label">Contraseña *</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="Mínimo 6 caracteres"
                  value={form.password} onChange={set('password')}
                  required minLength={6}
                />
                <button type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dojo-text/30 hover:text-dojo-text"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Fecha de nacimiento *</label>
              <input type="date" className="input"
                value={form.fechaNacimiento} onChange={set('fechaNacimiento')} required />
            </div>
            <div>
              <label className="label">Teléfono *</label>
              <input type="tel" className="input" placeholder="600 000 000"
                value={form.telefono} onChange={set('telefono')} required />
            </div>
          </div>

          <div>
            <label className="label">Disciplina marcial *</label>
            <select className="input" value={form.arteMarcial} onChange={set('arteMarcial')}>
              {MARTIAL_ARTS.map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Dirección *</label>
            <input type="text" className="input" placeholder="Calle, número, ciudad"
              value={form.direccion} onChange={set('direccion')} required />
          </div>

          <div>
            <label className="label">Contacto de emergencia *</label>
            <input type="text" className="input" placeholder="Nombre y teléfono"
              value={form.contactoEmergencia} onChange={set('contactoEmergencia')} required />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
          >
            {loading ? <Spinner size="sm" /> : null}
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-6 text-center text-dojo-text/40 text-xs">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-dojo-red hover:text-dojo-red-bright transition-colors">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}