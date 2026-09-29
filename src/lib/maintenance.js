// Maintenance schedule of a vehicle: ГТП (Наредба Н-32), Гражданска отговорност,
// винетка and the regular service interval with a mileage based forecast.
// Pure functions on purpose — they are unit tested outside the browser.
import { addDays, daysBetween, formatDate, parseDate } from './dates.js'

export const CATEGORY_CODES = ['M1', 'N1', 'M2', 'M3', 'N2', 'N3', 'L', 'O1', 'O2', 'O3', 'O4']

// Категории, за които прегледът е на 6 месеца.
const HALF_YEAR = ['M2', 'M3']

export function ageInYears(date, at = new Date()) {
  const start = parseDate(date)
  const now = parseDate(at)
  if (!start || !now) return null
  let years = now.getFullYear() - start.getFullYear()
  const beforeBirthday = now.getMonth() < start.getMonth() ||
    (now.getMonth() === start.getMonth() && now.getDate() < start.getDate())
  if (beforeBirthday) years -= 1
  return years
}

// Н-32 чл. 29: M1/N1/O1/O2 — първи преглед на 3-та година, втори на 5-та, после всяка година;
// мотоциклети — на 4-та година, после на всеки 2 години; таксита и автобуси — на 6 месеца.
export function inspectionPeriodMonths(category = 'M1', firstRegistration, at = new Date()) {
  const code = CATEGORY_CODES.includes(category) ? category : 'M1'
  if (HALF_YEAR.includes(code)) return 6
  if (code === 'L') {
    const age = ageInYears(firstRegistration, at)
    return age !== null && age < 4 ? null : 24
  }
  if (code === 'N2' || code === 'N3' || code === 'O3' || code === 'O4') return 12
  const age = ageInYears(firstRegistration, at)
  if (age === null) return 12
  if (age < 3) return null
  if (age < 5) return 24
  return 12
}

export function addMonths(value, months) {
  const date = parseDate(value)
  if (!date || !months) return null
  const day = date.getDate()
  const next = new Date(date.getFullYear(), date.getMonth() + Number(months), 1, 12)
  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  next.setDate(Math.min(day, lastDay))
  return next
}

// Следващият преглед се брои от последния преглед, а ако няма такъв — от първата регистрация.
export function suggestNextInspection({ lastInspection, category = 'M1', firstRegistration }, at = new Date()) {
  const base = parseDate(lastInspection) || parseDate(firstRegistration)
  if (!base) return ''
  const months = inspectionPeriodMonths(category, firstRegistration, at)
  const next = addMonths(base, months || 36)
  return next ? formatDate(next) : ''
}

// Среден пробег на ден по историята от посещения (за прогноза кога идва следващото ТО).
export function kmPerDay(visits = [], min = 5, max = 250) {
  const points = visits
    .map((visit) => ({ date: parseDate(visit.date), km: Number(visit.mileage) || 0 }))
    .filter((point) => point.date && point.km > 0)
    .sort((a, b) => a.date - b.date)
  if (points.length < 2) return null
  const first = points[0]
  const last = points[points.length - 1]
  const days = daysBetween(first.date, last.date)
  const km = last.km - first.km
  if (!days || days < 14 || km <= 0) return null
  const perDay = km / days
  return Math.min(max, Math.max(min, Math.round(perDay * 10) / 10))
}

// Срокът: няма дата -> unknown, минал -> overdue, до 14 дни -> urgent, до 30 -> soon, иначе ok.
export function dueState(daysLeft, urgentDays = 14, soonDays = 30) {
  if (daysLeft === null || daysLeft === undefined) return 'unknown'
  if (daysLeft < 0) return 'overdue'
  if (daysLeft <= urgentDays) return 'urgent'
  if (daysLeft <= soonDays) return 'soon'
  return 'ok'
}

// Оставащ пробег до следващото ТО.
export function serviceKmLeft(record = {}, mileage = 0) {
  const interval = Number(record.serviceIntervalKm) || 0
  const lastKm = Number(record.lastServiceKm) || 0
  const current = Number(mileage) || 0
  if (!interval || !lastKm || !current) return null
  return lastKm + interval - current
}

// Едно място, където се смята целият регламент на автомобила.
export function maintenanceSummary({ record = {}, mileage = 0, visits = [], today, urgentDays = 14, soonDays = 30 }) {
  const now = parseDate(today) || new Date()
  const rows = []
  const push = (key, date, extra = {}) => {
    const daysLeft = date ? daysBetween(now, date) : null
    rows.push({ key, date: date ? formatDate(date) : '', daysLeft, state: dueState(daysLeft, urgentDays, soonDays), ...extra })
  }

  push('gti', parseDate(record.gtiDue))
  push('insurance', parseDate(record.insuranceDue))
  push('vignette', parseDate(record.vignetteDue))

  const perDay = kmPerDay(visits)
  const kmLeft = serviceKmLeft(record, mileage)
  const months = Number(record.serviceIntervalMonths) || 0
  if (record.serviceIntervalKm && kmLeft !== null) {
    const daysLeft = perDay ? Math.round(kmLeft / perDay) : null
    const date = daysLeft !== null && daysLeft >= 0 ? addDays(now, daysLeft) : null
    push('service', date, { kmLeft, kmPerDay: perDay })
  } else if (months && record.lastServiceDate) {
    push('service', addMonths(record.lastServiceDate, months), { months })
  } else {
    rows.push({ key: 'service', date: '', daysLeft: null, state: 'unknown' })
  }

  return rows
}

export function emptyRecord() {
  return {
    category: 'M1',
    firstRegistration: '',
    gtiDue: '',
    insuranceDue: '',
    vignetteDue: '',
    serviceIntervalKm: '',
    serviceIntervalMonths: '',
    lastServiceKm: '',
    lastServiceDate: '',
  }
}

// Привежда стойностите от формата към това, което се пази.
export function normalizeRecord(input = {}) {
  const text = (value) => String(value === null || value === undefined ? '' : value).trim()
  const number = (value) => {
    const parsed = Number(String(value || '').replace(/[^0-9]/g, ''))
    return Number.isFinite(parsed) && parsed > 0 ? parsed : ''
  }
  const date = (value) => formatDate(parseDate(value))
  return {
    category: CATEGORY_CODES.includes(text(input.category)) ? text(input.category) : 'M1',
    firstRegistration: date(input.firstRegistration),
    gtiDue: date(input.gtiDue),
    insuranceDue: date(input.insuranceDue),
    vignetteDue: date(input.vignetteDue),
    serviceIntervalKm: number(input.serviceIntervalKm),
    serviceIntervalMonths: number(input.serviceIntervalMonths),
    lastServiceKm: number(input.lastServiceKm),
    lastServiceDate: date(input.lastServiceDate),
  }
}

