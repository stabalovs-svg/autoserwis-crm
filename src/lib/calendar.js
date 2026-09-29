// Календарь записей: раскладка по слотам, проверка конфликтов, загрузка и экспорт.
// Чистые функции без DOM — чтобы их можно было проверять вне браузера.
import { addDays, daysBetween, formatDate, parseDate, startOfWeek } from './dates.js'

export const STATUSES = ['request', 'confirmed', 'arrived', 'inWork', 'done', 'noShow', 'cancelled']
// Статусы, которые занимают место в календаре.
export const ACTIVE_STATUSES = ['request', 'confirmed', 'arrived', 'inWork']

export const DEFAULT_SHOP = {
  openHours: { weekday: ['08:00', '18:00'], saturday: ['08:00', '14:00'] },
  slotMinutes: 30,
  resources: ['gti', 'bay1', 'bay2', 'tyres'],
  types: { gti: 30, service: 90, diagnostics: 45, repair: 120, tyres: 60 },
}

export function toMinutes(time) {
  const match = String(time || '').match(/^(\d{1,2}):(\d{2})$/)
  if (!match) return null
  const value = Number(match[1]) * 60 + Number(match[2])
  return value >= 0 && value <= 24 * 60 ? value : null
}

export function toTime(minutes) {
  const value = Math.max(0, Math.min(24 * 60, Math.round(Number(minutes) || 0)))
  return String(Math.floor(value / 60)).padStart(2, '0') + ':' + String(value % 60).padStart(2, '0')
}

export function addMinutes(time, minutes) {
  const base = toMinutes(time)
  return base === null ? '' : toTime(base + Number(minutes || 0))
}

export function endTime(booking = {}) {
  return addMinutes(booking.start, booking.minutes || DEFAULT_SHOP.slotMinutes)
}

// Часы работы на конкретную дату: воскресенье закрыто, суббота короче.
export function openHours(date, shop = DEFAULT_SHOP) {
  const parsed = parseDate(date)
  if (!parsed) return null
  const weekday = parsed.getDay()
  if (weekday === 0) return null
  if (weekday === 6) return shop.openHours?.saturday || null
  return shop.openHours?.weekday || null
}

// Сетка слотов дня — из неё строятся пустые ячейки календаря.
export function daySlots(date, shop = DEFAULT_SHOP) {
  const hours = openHours(date, shop)
  if (!hours) return []
  const start = toMinutes(hours[0])
  const end = toMinutes(hours[1])
  const step = shop.slotMinutes || 30
  if (start === null || end === null) return []
  const slots = []
  for (let minute = start; minute + step <= end; minute += step) slots.push(toTime(minute))
  return slots
}

// Дни периода: один день или неделя с понедельника.
export function periodDays(from, mode = 'week') {
  const base = parseDate(from)
  if (!base) return []
  if (mode === 'day') return [formatDate(base)]
  const monday = startOfWeek(base)
  return Array.from({ length: 7 }, (_, index) => formatDate(addDays(monday, index)))
}

export function periodLabel(days = []) {
  if (!days.length) return ''
  return days.length === 1 ? days[0] : `${days[0]} — ${days[days.length - 1]}`
}

export function overlaps(a = {}, b = {}) {
  const start = toMinutes(a.start)
  const other = toMinutes(b.start)
  if (start === null || other === null) return false
  const end = start + (a.minutes || DEFAULT_SHOP.slotMinutes)
  const otherEnd = other + (b.minutes || DEFAULT_SHOP.slotMinutes)
  return start < otherEnd && other < end
}

// Конфликт = та же дата, тот же ресурс и пересечение по времени.
export function conflicts(booking = {}, list = []) {
  return list.filter((item) => item.id !== booking.id
    && item.date === booking.date
    && item.resource === booking.resource
    && ACTIVE_STATUSES.includes(item.status || 'confirmed')
    && overlaps(booking, item))
}

// Свободные окна ресурса на день с учётом длительности записи.
export function freeSlots({ date, resource, list = [], shop = DEFAULT_SHOP, minutes } = {}) {
  const hours = openHours(date, shop)
  if (!hours) return []
  const duration = Number(minutes) || shop.slotMinutes || 30
  const close = toMinutes(hours[1])
  return daySlots(date, shop).filter((start) => {
    if (toMinutes(start) + duration > close) return false
    const probe = { date, resource, start, minutes: duration }
    return !list.some((item) => item.date === date
      && item.resource === resource
      && ACTIVE_STATUSES.includes(item.status || 'confirmed')
      && overlaps(probe, item))
  })
}


export function sortByStart(list = []) {
  return [...list].sort((a, b) => (toMinutes(a.start) ?? 24 * 60) - (toMinutes(b.start) ?? 24 * 60)
    || String(a.resource || '').localeCompare(String(b.resource || '')))
}

// Записи, разложенные по дням периода — то, что рисует сетка календаря.
// Заявки без времени сюда не попадают: для них есть лист ожидания.
export function groupByDay(list = [], days = []) {
  const map = {}
  days.forEach((day) => { map[day] = [] })
  list.forEach((item) => {
    if (!item.start || !map[item.date]) return
    map[item.date].push(item)
  })
  Object.keys(map).forEach((day) => { map[day] = sortByStart(map[day]) })
  return map
}

// Лист ожидания: заявки без назначенного времени.
export function waitlist(list = []) {
  return list.filter((item) => (item.status || '') === 'request' && !item.start)
}

// Загрузка дня: сколько минут занято из доступных на всех ресурсах.
export function dayLoad(list = [], date, shop = DEFAULT_SHOP) {
  const hours = openHours(date, shop)
  const slots = daySlots(date, shop)
  const resources = shop.resources || []
  if (!hours || !slots.length) return { booked: 0, capacity: 0, percent: 0 }
  const step = shop.slotMinutes || 30
  const capacity = slots.length * step * resources.length
  const booked = list
    .filter((item) => item.date === date && item.start && ACTIVE_STATUSES.includes(item.status || 'confirmed'))
    .reduce((sum, item) => sum + (Number(item.minutes) || DEFAULT_SHOP.slotMinutes), 0)
  return { booked, capacity, percent: capacity ? Math.round((booked / capacity) * 100) : 0 }
}

// Загрузка по ресурсам за период — видно, где есть свободные окна.
export function resourceLoad(list = [], days = [], shop = DEFAULT_SHOP) {
  const resources = shop.resources || []
  const step = shop.slotMinutes || 30
  const openDays = days.filter((day) => openHours(day, shop))
  const sample = openDays[0] || days[0]
  const capacityPerDay = daySlots(sample, shop).length * step
  return resources.map((resource) => {
    const busy = list
      .filter((item) => item.resource === resource
        && item.start
        && days.includes(item.date)
        && ACTIVE_STATUSES.includes(item.status || 'confirmed'))
      .reduce((sum, item) => sum + (Number(item.minutes) || step), 0)
    const capacity = capacityPerDay * openDays.length
    return { resource, minutes: busy, capacity, percent: capacity ? Math.round((busy / capacity) * 100) : 0 }
  })
}

export function nextBookingId(list = [], prefix = 'BK-') {
  const highest = list.reduce((max, item) => {
    const number = Number(String(item.id || '').replace(/[^0-9]/g, ''))
    return Number.isFinite(number) && number > max ? number : max
  }, 3000)
  return `${prefix}${highest + 1}`
}

// Приводим данные формы к тому, что хранится в демо.
export function normalizeBooking(input = {}, shop = DEFAULT_SHOP) {
  const text = (value) => String(value === null || value === undefined ? '' : value).trim()
  const type = shop.types?.[text(input.type)] ? text(input.type) : 'repair'
  const resource = (shop.resources || []).includes(text(input.resource)) ? text(input.resource) : (shop.resources || ['bay1'])[0]
  const minutes = Number(input.minutes) || shop.types?.[type] || shop.slotMinutes || 30
  const start = toMinutes(input.start) === null ? '' : text(input.start)
  const status = STATUSES.includes(text(input.status)) ? text(input.status) : (start ? 'confirmed' : 'request')
  return {
    id: text(input.id),
    date: formatDate(input.date),
    start,
    minutes,
    resource,
    type,
    master: text(input.master),
    plate: text(input.plate).toUpperCase(),
    vin: text(input.vin).toUpperCase(),
    car: text(input.car),
    client: text(input.client),
    phone: text(input.phone),
    status,
    note: text(input.note),
    orderId: text(input.orderId),
  }
}

// Экспорт дня или недели в календарь телефона или Outlook.
export function toIcs(list = [], { shopName = 'IKARS', calendarName = 'IKARS schedule' } = {}) {
  const stamp = (day, time) => {
    const parsed = parseDate(day)
    const minutes = toMinutes(time)
    if (!parsed || minutes === null) return ''
    const date = `${parsed.getFullYear()}${String(parsed.getMonth() + 1).padStart(2, '0')}${String(parsed.getDate()).padStart(2, '0')}`
    return `${date}T${toTime(minutes).replace(':', '')}00`
  }
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IKARS//Auto Service CRM//EN', `X-WR-CALNAME:${calendarName}`]
  list.filter((item) => item.start).forEach((item) => {
    lines.push('BEGIN:VEVENT')
    lines.push(`UID:${item.id || Math.random().toString(36).slice(2)}@ikars.lv`)
    lines.push(`DTSTART:${stamp(item.date, item.start)}`)
    lines.push(`DTEND:${stamp(item.date, endTime(item))}`)
    lines.push(`SUMMARY:${[item.car, item.plate, item.type].filter(Boolean).join(' · ')}`)
    lines.push(`DESCRIPTION:${[item.client, item.phone, item.master, item.note].filter(Boolean).join(' · ')}`)
    lines.push(`LOCATION:${shopName}`)
    lines.push('END:VEVENT')
  })
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}
