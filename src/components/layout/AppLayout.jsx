import { useState } from 'react'
import { NavLink, useNavigate, Outlet } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, Calendar, LogOut,
  Menu, X, Bell, ChevronRight, Shield, User
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Avatar } from '../ui/index'
import toast from 'react-hot-toast'

const adminLinks = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/admin/students',  icon: Users,           label: 'Alumnos'     },
  { to: '/admin/payments',  icon: CreditCard,      label: 'Pagos'       },
  { to: '/admin/events',    icon: Calendar,        label: 'Eventos'     },
]

const studentLinks = [
  { to: '/student',         icon: LayoutDashboard, label: 'Mi Dashboard' },
  { to: '/student/profile', icon: User,            label: 'Mi Perfil'    },
  { to: '/student/payments',icon: CreditCard,      label: 'Mis Pagos'    },
  { to: '/student/events',  icon: Calendar,        label: 'Eventos'      },
]

export default function AppLayout() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = isAdmin ? adminLinks : studentLinks

  function handleLogout() {
    logout()
    toast.success('Sesión cerrada')
    navigate('/login')
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`
      ${mobile ? 'fixed inset-0 z-50' : 'hidden lg:flex'}
      flex-col bg-dojo-dark border-r border-dojo-border w-64 h-full
    `}>
      {/* Mobile overlay */}
      {mobile && (
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm -z-10"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-dojo-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-dojo-red rounded-lg flex items-center justify-center glow-red">
            <Shield size={16} className="text-white" />
          </div>
          <span className="font-display text-xl text-dojo-white tracking-widest">DOJOAPP</span>
        </div>
        {mobile && (
          <button onClick={() => setMobileOpen(false)} className="btn-ghost p-1.5">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-dojo-border/50">
        <span className={`badge text-xs ${isAdmin ? 'badge-red' : 'badge-blue'}`}>
          {isAdmin ? '👑 Administrador' : '🥋 Alumno'}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="label px-3 mb-3">Navegación</p>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/admin' || to === '/student'}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
            <ChevronRight size={12} className="ml-auto opacity-30" />
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-dojo-border">
        <div className="flex items-center gap-3 px-2 mb-3">
          <Avatar name={user?.email} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-dojo-light text-xs font-500 truncate">{user?.email}</p>
            <p className="text-dojo-text/40 text-xs font-mono truncate">
              {isAdmin ? 'Admin' : 'Alumno'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full btn-ghost flex items-center gap-2 text-dojo-text/60 hover:text-dojo-red"
        >
          <LogOut size={14} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-dojo-black">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile sidebar */}
      {mobileOpen && <Sidebar mobile />}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-dojo-border bg-dojo-dark">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-dojo-red rounded flex items-center justify-center">
              <Shield size={12} className="text-white" />
            </div>
            <span className="font-display text-lg text-dojo-white tracking-widest">DOJOAPP</span>
          </div>
          <button onClick={() => setMobileOpen(true)} className="btn-ghost p-1.5">
            <Menu size={20} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 lg:py-8 fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
