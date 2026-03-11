import { format, formatDistanceToNow, isPast, isToday, isTomorrow, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

// ─── BELT ─────────────────────────────────────────────────────────────────────
export const BELT_ORDER = [
  'blanco','amarillo','naranja','verde',
  'azul','violeta','marron','rojo',
  'negro-1dan','negro-2dan','negro-3dan','negro-4dan','negro-5dan','negro-6dan'
]

export const BELT_LABELS = {
  blanco:     'Blanco',
  amarillo:   'Amarillo',
  naranja:    'Naranja',
  verde:      'Verde',
  azul:       'Azul',
  violeta:    'Violeta',
  marron:     'Marrón',
  rojo:       'Rojo',
  'negro-1dan':'Negro 1º Dan',
  'negro-2dan':'Negro 2º Dan',
  'negro-3dan':'Negro 3º Dan',
  'negro-4dan':'Negro 4º Dan',
  'negro-5dan':'Negro 5º Dan',
  'negro-6dan':'Negro 6º Dan',
}

export const BELT_CSS = {
  blanco:     'bg-white text-black border border-gray-300',
  amarillo:   'bg-yellow-400 text-black',
  naranja:    'bg-orange-500 text-white',
  verde:      'bg-green-600 text-white',
  azul:       'bg-blue-600 text-white',
  violeta:    'bg-purple-700 text-white',
  marron:     'bg-amber-800 text-white',
  rojo:       'bg-red-600 text-white',
  'negro-1dan':'bg-black text-yellow-400 border border-yellow-500/40',
  'negro-2dan':'bg-black text-yellow-400 border border-yellow-500/40',
  'negro-3dan':'bg-black text-yellow-400 border border-yellow-500/40',
  'negro-4dan':'bg-black text-yellow-400 border border-yellow-500/40',
  'negro-5dan':'bg-black text-yellow-400 border border-yellow-500/40',
  'negro-6dan':'bg-black text-yellow-400 border border-yellow-500/40',
}

export function getBeltBadge(cinturon) {
  return BELT_CSS[cinturon] || 'bg-dojo-muted text-dojo-text'
}

// ─── MARTIAL ARTS ─────────────────────────────────────────────────────────────
export const MARTIAL_ARTS = [
  { value: 'taekwondo', label: 'Taekwondo' },
  { value: 'hapkido',   label: 'Hapkido'   },
  { value: 'muay-thai', label: 'Muay Thai' },
]

export const MARTIAL_ARTS_ALL = [
  { value: 'all',       label: 'Todas las disciplinas' },
  ...MARTIAL_ARTS,
]

export const CATEGORIES = [
  { value: 'infantil', label: 'Infantil' },
  { value: 'juvenil',  label: 'Juvenil'  },
  { value: 'cadete',   label: 'Cadete'   },
  { value: 'adulto',   label: 'Adulto'   },
]

export const EVENT_TYPES = [
  { value: 'competición',    label: 'Competición'    },
  { value: 'examen',         label: 'Examen'         },
  { value: 'entrenamiento',  label: 'Entrenamiento'  },
  { value: 'general',        label: 'General'        },
]

export const EVENT_TYPE_CSS = {
  'competición':   'badge-red',
  'examen':        'badge-gold',
  'entrenamiento': 'badge-green',
  'general':       'badge-gray',
}

// ─── DATES ────────────────────────────────────────────────────────────────────
export function fmtDate(date, fmt = 'dd MMM yyyy') {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, fmt, { locale: es })
  } catch { return '—' }
}

export function fmtDateTime(date) {
  return fmtDate(date, "dd MMM yyyy · HH:mm")
}

export function fmtRelative(date) {
  if (!date) return '—'
  try {
    const d = typeof date === 'string' ? parseISO(date) : date
    if (isToday(d))    return 'Hoy'
    if (isTomorrow(d)) return 'Mañana'
    return formatDistanceToNow(d, { locale: es, addSuffix: true })
  } catch { return '—' }
}

export function fmtMonth(monthStr) {
  // "2024-06" → "Junio 2024"
  if (!monthStr) return '—'
  try {
    const [year, month] = monthStr.split('-')
    const d = new Date(parseInt(year), parseInt(month) - 1, 1)
    return format(d, 'MMMM yyyy', { locale: es })
  } catch { return monthStr }
}

export function isOverdue(dueDate) {
  if (!dueDate) return false
  try {
    const d = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate
    return isPast(d) && !isToday(d)
  } catch { return false }
}

// ─── CURRENCY ─────────────────────────────────────────────────────────────────
export function fmtCurrency(amount) {
  if (amount == null) return '—'
  return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)
}

// ─── MISC ─────────────────────────────────────────────────────────────────────
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function getMartialArtLabel(value) {
  return MARTIAL_ARTS.find((m) => m.value === value)?.label ?? value
}
