// Напоминания клиентам: что показывать мастеру сегодня, каким каналом и с каким текстом.
// Чистые функции без DOM — правила проверяются в Node.
import { daysBetween, formatDate, parseDate } from './dates.js'
import { maintenanceSummary, kmPerDay } from './maintenance.js'
import { daySlots, freeSlots, openHours, toMinutes } from './calendar.js'

// Каденции: за сколько дней до срока напоминаем и что делать, если срок уже прошёл.
export const RULES = {
  gti: { lead: [30, 7], channel: 'sms', urgent: 'call' },
  insurance: { lead: [30, 7], channel: 'sms', urgent: 'call' },
  vignette: { lead: [14], channel: 'sms', urgent: 'sms' },
  service: { leadDays: 30, leadKm: 1000, channel: 'sms', urgent: 'sms' },
  reactivation: { afterDays: 365, channel: 'sms', urgent: 'sms' },
}

// Не чаще одного сообщения в 7 дней одному клиенту и только в рабочие часы.
export const QUIET = { minGapDays: 7, from: 9 * 60, to: 19 * 60 }

export function messageId(kind, vehicleKey, dueDate) {
  return `${kind}|${vehicleKey}|${dueDate || ''}`
}

export function isQuietHour(date = new Date()) {
  const minutes = date.getHours() * 60 + date.getMinutes()
  return minutes < QUIET.from || minutes > QUIET.to
}

// Последний контакт с клиентом: чтобы не спамить.
export function lastContact(phone, messages = []) {
  const clean = String(phone || '').replace(/[^0-9]/g, '')
  const found = messages
    .filter((item) => String(item.phone || '').replace(/[^0-9]/g, '') === clean)
    .map((item) => parseDate(item.sentAt))
    .filter(Boolean)
    .sort((a, b) => b - a)
  return found[0] || null
}

function priorityOf(state) {
  if (state === 'overdue') return 0
  if (state === 'urgent') return 1
  return 2
}

// Собираем список напоминаний на дату `today` из регламента машин, журнала и согласий.
export function buildQueue({ today, vehicles = [], maintenance = {}, messages = [], consents = {}, reminderState = {}, shop }) {
  const rows = []
  const now = parseDate(today)
  if (!now) return rows

  const add = (vehicle, kind, extra) => {
    const id = messageId(kind, vehicle.key, extra.dueDate || '')
    const state = reminderState[id] || {}
    // Отказ клиента уважаем, отложенное показываем только после даты отложения.
    if (state.status === 'declined') return
    if (state.status === 'snoozed' && state.until && daysBetween(today, state.until) > 0) return
    // Не чаще одного сообщения в 7 дней.
    const last = lastContact(vehicle.phone, messages)
    const gap = last ? Math.abs(daysBetween(formatDate(last), today)) : null
    if (state.status !== 'booked' && gap !== null && gap < QUIET.minGapDays) return
    const consent = consents[String(vehicle.phone || '').replace(/[^0-9]/g, '')]
    rows.push({
      id,
      kind,
      vehicleKey: vehicle.key,
      plate: vehicle.plate,
      car: vehicle.car,
      client: vehicle.client,
      phone: vehicle.phone,
      dueDate: extra.dueDate || '',
      daysLeft: extra.daysLeft,
      state: extra.state || 'unknown',
      kmLeft: extra.kmLeft,
      channel: extra.channel || RULES[kind]?.channel || 'sms',
      consent: consent ? consent.allowed !== false : false,
      slot: null,
      priority: priorityOf(extra.state),
    })
  }

  vehicles.forEach((vehicle) => {
    const record = maintenance[vehicle.key]
    if (!record) return
    const summary = maintenanceSummary({
      record,
      mileage: vehicle.mileage || 0,
      visits: vehicle.visits || [],
      today,
    })
    const byKey = {}
    summary.forEach((row) => { byKey[row.key] = row })

    ;['gti', 'insurance', 'vignette'].forEach((kind) => {
      const row = byKey[kind]
      if (!row || row.state === 'unknown') return
      const lead = Math.max(...(RULES[kind]?.lead || [30]))
      if (row.daysLeft > lead) return
      add(vehicle, kind, {
        dueDate: row.date,
        daysLeft: row.daysLeft,
        state: row.state,
        channel: row.state === 'overdue' || row.daysLeft <= 7 ? RULES[kind]?.urgent : RULES[kind]?.channel,
      })
    })

    const service = byKey.service
    if (service && service.state !== 'unknown') {
      const byKm = service.kmLeft !== null && service.kmLeft !== undefined
      const closeByKm = byKm && service.kmLeft <= RULES.service.leadKm
      const closeByDays = service.daysLeft !== null && service.daysLeft <= RULES.service.leadDays
      if (closeByKm || closeByDays) {
        add(vehicle, 'service', {
          dueDate: service.date,
          daysLeft: service.daysLeft,
          state: byKm && service.kmLeft <= 300 ? 'urgent' : service.state,
          kmLeft: service.kmLeft,
          channel: RULES.service.channel,
        })
      }
    }

    // Реактивация: клиент не приезжал больше года.
    const lastVisit = vehicle.lastVisit?.date
    const idle = lastVisit ? daysBetween(lastVisit, today) : null
    if (idle !== null && idle >= RULES.reactivation.afterDays) {
      add(vehicle, 'reactivation', {
        dueDate: lastVisit,
        daysLeft: -idle,
        state: 'soon',
        channel: RULES.reactivation.channel,
      })
    }
  })

  return rows.sort((a, b) => a.priority - b.priority
    || (a.daysLeft ?? 999) - (b.daysLeft ?? 999)
    || String(a.client || '').localeCompare(String(b.client || '')))
}

// Ближайший свободный слот для записи — чтобы сразу предложить клиенту время
// (связка с календарём: «позвонить и предложить 05.10 09:30»).
export function suggestSlot({ bookings = [], shop, today, resource = 'gti', minutes, days = 14 } = {}) {
  const base = parseDate(today)
  if (!base) return null
  const duration = Number(minutes) || shop?.types?.gti || shop?.slotMinutes || 30
  for (let step = 0; step <= days; step += 1) {
    const cursor = parseDate(today)
    cursor.setDate(cursor.getDate() + step)
    const date = formatDate(cursor)
    if (!openHours(date, shop)) continue
    const slot = freeSlots({ date, resource, list: bookings, shop, minutes: duration })[0]
    if (slot) return { date, start: slot, resource, minutes: duration }
  }
  return null
}

export function queueCounts(rows = []) {
  return {
    overdue: rows.filter((row) => row.state === 'overdue').length,
    urgent: rows.filter((row) => row.state === 'urgent').length,
    soon: rows.filter((row) => row.state === 'soon').length,
    call: rows.filter((row) => row.channel === 'call').length,
    total: rows.length,
  }
}

// Сразу видно, кому звонить, а кому писать.
export function splitByChannel(rows = []) {
  return {
    call: rows.filter((row) => row.channel === 'call'),
    write: rows.filter((row) => row.channel !== 'call'),
  }
}

