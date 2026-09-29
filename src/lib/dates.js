// The CRM keeps dates as "DD.MM.YYYY" strings (that is what the workshop types),
// so every parse and format goes through this module.
const pad = (value) => String(value).padStart(2, '0')

export function parseDate(value) {
  if (!value) return null
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : new Date(value.getTime())
  const text = String(value).trim()
  const dotted = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})/)
  if (dotted) return new Date(Number(dotted[3]), Number(dotted[2]) - 1, Number(dotted[1]), 12)
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]), 12)
  const parsed = new Date(text)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

// "30.08.2026" — the storage format used by orders, visits and bookings.
export function formatDate(value) {
  const date = parseDate(value)
  if (!date) return ''
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
}

// "2026-08-30" — the format used in URLs and query strings.
export function toIso(value) {
  const date = parseDate(value)
  if (!date) return ''
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// Long local date for headings: "неделя, 30 август 2026 г."
export function formatLong(value, locale = 'bg-BG') {
  const date = parseDate(value)
  if (!date) return ''
  return date.toLocaleDateString(locale, { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export function addDays(value, days) {
  const date = parseDate(value)
  if (!date) return null
  date.setDate(date.getDate() + Number(days || 0))
  return date
}

// Whole days from `from` to `to` (negative when `to` is earlier).
export function daysBetween(from, to) {
  const start = parseDate(from)
  const end = parseDate(to)
  if (!start || !end) return null
  const dayStart = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime()
  const dayEnd = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime()
  return Math.round((dayEnd - dayStart) / 86400000)
}

// Monday-based week start, used by the booking calendar.
export function startOfWeek(value, mondayFirst = true) {
  const date = parseDate(value)
  if (!date) return null
  const day = date.getDay()
  return addDays(date, mondayFirst ? (day === 0 ? -6 : 1 - day) : -day)
}
