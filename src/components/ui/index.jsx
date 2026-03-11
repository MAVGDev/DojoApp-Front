import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'
import { getInitials, getBeltBadge, BELT_LABELS } from '../../utils/helpers'

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 'md', className = '' }) {
  const sz = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' }[size]
  return (
    <div className={`${sz} ${className} border-2 border-dojo-border border-t-dojo-red rounded-full animate-spin`} />
  )
}

export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 bg-dojo-black flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-dojo-text/50 text-sm font-mono">Cargando...</p>
      </div>
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-full bg-dojo-muted/20 flex items-center justify-center">
          <Icon size={24} className="text-dojo-text/30" />
        </div>
      )}
      <div>
        <p className="text-dojo-light font-500 text-sm">{title}</p>
        {description && <p className="text-dojo-text/50 text-xs mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
export function Avatar({ src, name, size = 'md', belt, className = '' }) {
  const sz = {
    xs:  'w-7 h-7 text-xs',
    sm:  'w-8 h-8 text-xs',
    md:  'w-10 h-10 text-sm',
    lg:  'w-14 h-14 text-base',
    xl:  'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-3xl',
  }[size]

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sz} rounded-full object-cover border border-dojo-border ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sz} rounded-full bg-dojo-muted/40 border border-dojo-border 
                  flex items-center justify-center font-display text-dojo-text ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}

// ─── BELT BADGE ───────────────────────────────────────────────────────────────
export function BeltBadge({ cinturon }) {
  if (!cinturon) return null
  return (
    <span className={`badge text-xs px-2.5 py-0.5 rounded-full font-mono ${getBeltBadge(cinturon)}`}>
      {BELT_LABELS[cinturon] ?? cinturon}
    </span>
  )
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative z-10 w-full ${widths[size]} bg-dojo-card border border-dojo-border 
                    rounded-2xl shadow-card-hover slide-up my-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-dojo-border">
          <h3 className="font-display text-xl text-dojo-white tracking-wide">{title}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5 rounded-lg">
            <X size={16} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirmar', variant = 'danger' }) {
  if (!open) return null
  const btnClass = variant === 'danger' ? 'btn-primary' : 'btn-secondary'
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <p className="text-dojo-text/70 text-sm mb-6">{description}</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onClose} className="btn-secondary">Cancelar</button>
        <button
          onClick={() => { onConfirm(); onClose() }}
          className={btnClass}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
export function StatusBadge({ paid, dueDate }) {
  if (paid) return <span className="badge-green">Pagado</span>
  if (dueDate && new Date(dueDate) < new Date()) {
    return <span className="badge-red pulse-alert">Vencido</span>
  }
  return <span className="badge-gold">Pendiente</span>
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h2 className="font-display text-2xl text-dojo-white tracking-wide">{title}</h2>
        {subtitle && <p className="text-dojo-text/50 text-sm mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
export function FormField({ label, error, children, required }) {
  return (
    <div>
      {label && (
        <label className="label">
          {label}{required && <span className="text-dojo-red ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-dojo-red text-xs mt-1">{error}</p>}
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
export function StatCard({ icon: Icon, label, value, sub, accent = false, alert = false }) {
  return (
    <div className={`stat-card ${alert ? 'border-dojo-red/40' : accent ? 'border-dojo-gold/20' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="label mb-0">{label}</span>
        {Icon && (
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center
            ${alert ? 'bg-dojo-red/10 text-dojo-red' : accent ? 'bg-dojo-gold/10 text-dojo-gold' : 'bg-dojo-muted/20 text-dojo-text/40'}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <p className={`text-3xl font-display tracking-wide ${alert ? 'text-dojo-red-bright' : accent ? 'text-dojo-gold' : 'text-dojo-white'}`}>
        {value ?? '—'}
      </p>
      {sub && <p className="text-dojo-text/40 text-xs font-mono">{sub}</p>}
    </div>
  )
}

// ─── INLINE ALERT ─────────────────────────────────────────────────────────────
export function InlineAlert({ type = 'info', message }) {
  const styles = {
    error:   { cls: 'alert-red',   Icon: AlertTriangle },
    success: { cls: 'alert-green', Icon: CheckCircle   },
    info:    { cls: 'alert-gold',  Icon: Info          },
  }
  const { cls, Icon } = styles[type] ?? styles.info
  return (
    <div className={cls}>
      <Icon size={16} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
export function Skeleton({ className = 'h-4 w-full' }) {
  return <div className={`${className} bg-dojo-muted/20 rounded animate-pulse`} />
}

export function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}