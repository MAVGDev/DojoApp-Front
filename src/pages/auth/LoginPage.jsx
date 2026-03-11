import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { InlineAlert, Spinner } from '../../components/ui/index'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate   = useNavigate()
  const [form, setForm]     = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Bienvenido de vuelta`)
      navigate(user.role === 'admin' ? '/admin' : '/student')
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Credenciales incorrectas'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dojo-black flex">
      {/* Left — decorative panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-dojo-red-dark via-dojo-dark to-dojo-black" />
        <div className="absolute inset-0"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(255,255,255,0.015) 60px,rgba(255,255,255,0.015) 61px), repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(255,255,255,0.015) 60px,rgba(255,255,255,0.015) 61px)'
          }}
        />
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-dojo-red/10 blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 rounded-full bg-dojo-gold/5 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="w-16 h-16 bg-dojo-red rounded-2xl flex items-center justify-center glow-red mb-8">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="font-display text-7xl text-dojo-white leading-none tracking-wider mb-4">
            DOJO<br />
            <span className="text-dojo-red">APP</span>
          </h1>
          <p className="text-dojo-text/60 text-lg font-body max-w-xs leading-relaxed">
            Sistema de gestión integral para tu gimnasio de artes marciales
          </p>

          <div className="mt-12 space-y-4">
            {['Taekwondo', 'Hapkido', 'Muay Thai'].map((art) => (
              <div key={art} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 bg-dojo-red rounded-full" />
                <span className="text-dojo-text/50 text-sm font-mono">{art}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-dojo-red rounded-lg flex items-center justify-center">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-display text-2xl text-dojo-white tracking-widest">DOJOAPP</span>
          </div>

          <div className="mb-8">
            <h2 className="font-display text-4xl text-dojo-white tracking-wide mb-2">
              Iniciar sesión
            </h2>
            <p className="text-dojo-text/50 text-sm">
              Accede a tu panel de gestión
            </p>
          </div>

          {error && <div className="mb-6"><InlineAlert type="error" message={error} /></div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dojo-text/30" />
                <input
                  type="email"
                  className="input pl-10"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dojo-text/30" />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pl-10 pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dojo-text/30 hover:text-dojo-text transition-colors"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 mt-2"
            >
              {loading ? <Spinner size="sm" /> : null}
              {loading ? 'Verificando...' : 'Entrar al sistema'}
            </button>
          </form>

          <p className="mt-6 text-center text-dojo-text/40 text-xs">
            ¿Primera vez?{' '}
            <Link to="/register" className="text-dojo-red hover:text-dojo-red-bright transition-colors">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
