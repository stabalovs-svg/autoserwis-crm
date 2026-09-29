<script setup>
import { computed, ref } from 'vue'
import {
  ACTIVE_STATUSES, DEFAULT_SHOP, STATUSES, addMinutes, conflicts, dayLoad, daySlots, endTime,
  freeSlots, groupByDay, nextBookingId, normalizeBooking, periodDays as periodDaysOf, resourceLoad,
  sortByStart, toIcs, toMinutes, toTime, waitlist as waitlistOf,
} from '../lib/calendar'
import { addDays, formatDate, formatLong, parseDate } from '../lib/dates'

const props = defineProps({
  bookings: { type: Array, default: () => [] },
  shop: { type: Object, default: () => DEFAULT_SHOP },
  masters: { type: Array, default: () => [] },
  vehicles: { type: Array, default: () => [] },
  t: { type: Function, required: true },
  locale: { type: String, default: 'bg-BG' },
  today: { type: String, default: '' },
  view: { type: String, default: 'week' },
  anchor: { type: String, default: '' },
})
const emit = defineEmits(['create', 'update', 'remove', 'order', 'view', 'anchor', 'notify'])

const form = ref(null)
const selected = ref(null)
const conflictWarning = ref('')
// Фокус дня в недельном виде: по умолчанию линия ГТП, '' = все посты.
const dayFilters = ref({})

const anchorDate = computed(() => props.anchor || props.today)
const days = computed(() => periodDaysOf(anchorDate.value, props.view))
const grid = computed(() => groupByDay(props.bookings, days.value))
const waiting = computed(() => sortByStart(waitlistOf(props.bookings)))
const slots = computed(() => daySlots(days.value[0] || anchorDate.value, props.shop))
const resources = computed(() => props.shop.resources || DEFAULT_SHOP.resources)
const workshopLoad = computed(() => resourceLoad(props.bookings, days.value, props.shop))
const anchorLoad = computed(() => dayLoad(props.bookings, anchorDate.value, props.shop))

const hoursLabel = (day) => {
  const hours = daySlots(day, props.shop)
  if (!hours.length) return props.t('calClosed')
  return `${hours[0]} – ${addMinutes(hours[hours.length - 1], props.shop.slotMinutes || 30)}`
}

const typeLabel = (type) => props.t('type' + type.charAt(0).toUpperCase() + type.slice(1))
const resourceLabel = (resource) => props.t('res' + resource.charAt(0).toUpperCase() + resource.slice(1))
const statusLabel = (status) => props.t('st' + status.charAt(0).toUpperCase() + status.slice(1))

const bookingsAt = (day, resource, start) => (grid.value[day] || []).filter((item) => item.resource === resource
  && item.start === start)

// «Г», «1», «2», «🛞» — короткие метки постов для квадратиков в шапке дня.
const chipKeys = { gti: 'chipGti', bay1: 'chipBay1', bay2: 'chipBay2', tyres: 'chipTyres' }
const chipLabel = (resource) => props.t(chipKeys[resource] || 'chipBay1')

const dayFilter = (day) => (day in dayFilters.value ? dayFilters.value[day] : 'gti')
function toggleDayFilter(day, resource) {
  const current = dayFilter(day)
  dayFilters.value = { ...dayFilters.value, [day]: current === resource ? '' : resource }
}
function showAllDays() {
  const next = {}
  days.value.forEach((day) => { next[day] = '' })
  dayFilters.value = next
}
const visibleFor = (day) => {
  const filter = dayFilter(day)
  return (grid.value[day] || []).filter((item) => !filter || item.resource === filter)
}

// Загрузка дня считается по выбранному посту, а не по всему сервису.
function dayPercent(day) {
  const filter = dayFilter(day)
  const slots = daySlots(day, props.shop)
  const step = props.shop.slotMinutes || 30
  const resources = filter ? [filter] : resources.value
  const capacity = slots.length * step * resources.length
  if (!capacity) return 0
  const booked = (grid.value[day] || [])
    .filter((item) => (filter ? item.resource === filter : true)
      && ACTIVE_STATUSES.includes(item.status || 'confirmed'))
    .reduce((sum, item) => sum + (Number(item.minutes) || step), 0)
  return Math.round((booked / capacity) * 100)
}

const freeAt = (day, resource, minutes) => freeSlots({ date: day, resource, list: props.bookings, shop: props.shop, minutes })

const dayStats = (day) => dayLoad(props.bookings, day, props.shop)

function openForm(preset = {}) {
  conflictWarning.value = ''
  const type = preset.type || 'gti'
  const minutes = Number(preset.minutes) || props.shop.types?.[type] || props.shop.slotMinutes || 30
  form.value = {
    id: preset.id || nextBookingId(props.bookings),
    date: preset.date || anchorDate.value,
    start: preset.start || '',
    minutes,
    resource: preset.resource || resources.value[0],
    type,
    master: preset.master !== undefined ? preset.master : (props.masters[0] || ''),
    plate: preset.plate || '',
    vin: preset.vin || '',
    car: preset.car || '',
    client: preset.client || '',
    phone: preset.phone || '',
    status: preset.status || (preset.start ? 'confirmed' : 'request'),
    note: preset.note || '',
    orderId: preset.orderId || '',
    isNew: !preset.id,
  }
  selected.value = null
}

function changeType() {
  const type = form.value.type
  if (props.shop.types?.[type]) form.value.minutes = props.shop.types[type]
}

// Номер машины уже есть в реестре — подставляем клиента и модель.
function fillFromPlate() {
  const plate = String(form.value.plate || '').toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (!plate) return
  const found = props.vehicles.find((vehicle) => String(vehicle.plate || '').toUpperCase().replace(/[^A-Z0-9]/g, '') === plate)
  if (!found) return
  form.value.car = form.value.car || found.car || ''
  form.value.client = form.value.client || found.client || ''
  form.value.phone = form.value.phone || found.phone || ''
  form.value.vin = form.value.vin || found.vin || ''
}

function saveForm() {
  const booking = normalizeBooking(form.value, props.shop)
  const clash = conflicts(booking, props.bookings)
  if (clash.length) {
    conflictWarning.value = `${props.t('calConflict')}: ${clash.map((item) => `${item.start} ${item.car || item.plate}`).join(', ')}`
    return
  }
  emit(form.value.isNew ? 'create' : 'update', booking)
  form.value = null
  conflictWarning.value = ''
}

const update = (booking, patch) => emit('update', { ...booking, ...patch })
const move = (booking, minutes) => update(booking, { start: addMinutes(booking.start, minutes) })
const toggleStatus = (booking) => {
  const index = STATUSES.indexOf(booking.status)
  update(booking, { status: STATUSES[(index + 1) % STATUSES.length] })
}

function shiftPeriod(step) {
  const next = addDays(anchorDate.value, props.view === 'day' ? step : step * 7)
  emit('anchor', formatDate(next))
}

function exportIcs() {
  const list = props.bookings.filter((item) => days.value.includes(item.date))
  const blob = new Blob([toIcs(list, { calendarName: props.t('calendar') })], { type: 'text/calendar' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `ikars-${days.value[0]}.ics`
  link.click()
  URL.revokeObjectURL(url)
  emit('notify', props.t('calExported'))
}
</script>

<template>
  <div class="cal">
    <div class="cal-bar">
      <div class="cal-nav">
        <button type="button" @click="shiftPeriod(-1)">‹</button>
        <button type="button" @click="emit('anchor', today)">{{ t('calToday') }}</button>
        <button type="button" @click="shiftPeriod(1)">›</button>
        <strong>{{ view === 'day' ? formatLong(anchorDate, locale) : days[0] + ' — ' + days[6] }}</strong>
      </div>
      <div class="cal-views">
        <button type="button" :class="{ active: view === 'day' }" @click="emit('view', 'day')">{{ t('calDay') }}</button>
        <button type="button" :class="{ active: view === 'week' }" @click="emit('view', 'week')">{{ t('calWeek') }}</button>
      </div>
      <div class="cal-tools">
        <button type="button" class="primary" @click="openForm({ date: today })">＋ {{ t('calNew') }}</button>
        <button type="button" class="secondary" @click="exportIcs">⤓ .ics</button>
        <button v-if="view === 'week'" type="button" class="secondary" @click="showAllDays">{{ t('chipAll') }}</button>
        <button type="button" class="secondary" @click="emit('print')">🖨</button>
      </div>
    </div>

    <div class="cal-metrics">
      <article>
        <span>{{ t('calLoadDay') }}</span>
        <strong>{{ anchorLoad.percent }}%</strong>
        <em>{{ anchorLoad.booked }} / {{ anchorLoad.capacity }} {{ t('calMinutesShort') }}</em>
      </article>
      <article v-for="row in workshopLoad" :key="row.resource">
        <span>{{ resourceLabel(row.resource) }}</span>
        <strong>{{ row.percent }}%</strong>
        <em>{{ t('calWeek') }}</em>
      </article>
    </div>

    <div v-if="view === 'day'" class="cal-day">
      <div class="cal-day-head">
        <div class="cal-day-col">{{ t('calTime') }}</div>
        <div v-for="resource in resources" :key="resource" :class="['cal-day-col', resource]">{{ resourceLabel(resource) }}</div>
      </div>
      <div class="cal-day-body">
        <div v-for="slot in slots" :key="slot" class="cal-row">
          <div class="cal-time">{{ slot }}</div>
          <div v-for="resource in resources" :key="resource" class="cal-cell">
            <button
              v-for="item in bookingsAt(anchorDate, resource, slot)"
              :key="item.id"
              type="button"
              :class="['cal-block', item.status, item.resource]"
              @click="selected = item"
            >
              <strong>{{ item.car || item.plate || item.client }}</strong>
              <small>{{ item.start }}–{{ endTime(item) }} · {{ typeLabel(item.type) }}</small>
            </button>
            <button
              v-if="!bookingsAt(anchorDate, resource, slot).length"
              type="button"
              class="cal-empty"
              @click="openForm({ date: anchorDate, start: slot, resource })"
            >＋</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="cal-week">
      <div
        v-for="day in days"
        :key="day"
        :class="['cal-daycol', { closed: !daySlots(day, shop).length, today: day === today }]"
      >
        <header>
          <strong>{{ formatLong(day, locale).split(',')[0] }}</strong>
          <small>{{ day.slice(0, 5) }}</small>
          <em>{{ dayPercent(day) }}%</em>
        </header>
        <div v-if="daySlots(day, shop).length" class="cal-chips">
          <button
            v-for="resource in resources"
            :key="resource"
            type="button"
            :class="['cal-chip', resource, { active: dayFilter(day) === resource }]"
            :title="resourceLabel(resource)"
            @click="toggleDayFilter(day, resource)"
          >{{ chipLabel(resource) }}</button>
          <button type="button" class="cal-add" @click="openForm({ date: day })">＋</button>
        </div>
        <div
          v-for="item in visibleFor(day)"
          :key="item.id"
          :class="['cal-card', item.status, item.resource]"
          @click="selected = item"
        >
          <b>{{ item.start }}</b>
          <span>{{ item.car || item.plate || item.client }}</span>
          <small>{{ item.resource === 'gti' ? typeLabel(item.type) : resourceLabel(item.resource) }}</small>
        </div>
        <p v-if="!visibleFor(day).length" class="cal-none">{{ daySlots(day, shop).length ? t('calEmpty') : t('calClosed') }}</p>
      </div>
    </div>

    <section class="cal-waitlist">
      <h3>{{ t('calWaitlist') }} <b>{{ waiting.length }}</b></h3>
      <p v-if="!waiting.length" class="cal-none">{{ t('calWaitlistEmpty') }}</p>
      <button v-for="item in waiting" :key="item.id" type="button" class="cal-wait" @click="openForm(item)">
        <strong>{{ item.client }}</strong>
        <small>{{ item.car || item.plate }} · {{ typeLabel(item.type) }} · {{ item.phone }}</small>
      </button>
    </section>
    <div v-if="selected" class="overlay" @click.self="selected = null">
      <aside class="drawer cal-drawer">
        <button class="x" type="button" @click="selected = null">×</button>
        <p class="eyebrow">{{ t('calBooking') }} · {{ selected.id }}</p>
        <h2>{{ selected.car || selected.plate || selected.client }}</h2>
        <div class="detail-grid">
          <div><span>{{ t('calStart') }}</span><strong>{{ selected.start }} – {{ endTime(selected) }}</strong><small>{{ selected.date }}</small></div>
          <div><span>{{ t('calType') }}</span><strong>{{ typeLabel(selected.type) }}</strong><small>{{ resourceLabel(selected.resource) }}</small></div>
          <div><span>{{ t('master') }}</span><strong>{{ selected.master || '—' }}</strong></div>
          <div><span>{{ t('calStatus') }}</span><strong>{{ statusLabel(selected.status) }}</strong></div>
          <div class="wide"><span>{{ t('client') }}</span><strong>{{ selected.client || '—' }}</strong><small>{{ selected.phone }}</small></div>
          <div v-if="selected.note" class="wide"><span>{{ t('calNote') }}</span><strong>{{ selected.note }}</strong></div>
        </div>
        <div class="cal-shift">
          <button type="button" :disabled="!selected.start" @click="move(selected, -30)">−30</button>
          <button type="button" :disabled="!selected.start" @click="move(selected, 30)">+30</button>
          <button type="button" @click="toggleStatus(selected)">{{ t('next') }}</button>
        </div>
        <div class="drawer-actions">
          <a v-if="selected.phone" class="secondary action-link" :href="`tel:${selected.phone.replaceAll(' ', '')}`">☎ {{ t('callClient') }}</a>
          <button type="button" class="primary" @click="emit('order', selected)">＋ {{ t('calToOrder') }}</button>
          <button type="button" class="secondary" @click="openForm(selected)">{{ t('calEdit') }}</button>
        </div>
      </aside>
    </div>
    <div v-if="form" class="overlay" @click.self="form = null">
      <form class="modal cal-form" @submit.prevent="saveForm">
        <button type="button" class="x" @click="form = null">×</button>
        <p class="eyebrow">IKARS · {{ form.isNew ? t('calNew') : t('calEdit') }}</p>
        <h2>{{ form.car || form.client || t('calBooking') }}</h2>
        <label>{{ t('calDate') }}<input v-model="form.date" placeholder="30.09.2026"></label>
        <label>{{ t('calStart') }}
          <select v-model="form.start">
            <option value="">{{ t('calNoTime') }}</option>
            <option v-for="slot in slots" :key="slot" :value="slot">{{ slot }}</option>
          </select>
        </label>
        <label>{{ t('calType') }}
          <select v-model="form.type" @change="changeType">
            <option v-for="code in Object.keys(shop.types || {})" :key="code" :value="code">{{ typeLabel(code) }}</option>
          </select>
        </label>
        <label>{{ t('calResource') }}
          <select v-model="form.resource">
            <option v-for="resource in resources" :key="resource" :value="resource">{{ resourceLabel(resource) }}</option>
          </select>
        </label>
        <label>{{ t('master') }}
          <select v-model="form.master">
            <option value="">—</option>
            <option v-for="name in masters" :key="name" :value="name">{{ name }}</option>
          </select>
        </label>
        <label>{{ t('calMinutes') }}<input v-model.number="form.minutes" type="number" min="15" step="15"></label>
        <label>{{ t('plate') }}<input v-model="form.plate" list="cal-plates" placeholder="CA 1842 AB" @change="fillFromPlate"></label>
        <datalist id="cal-plates">
          <option v-for="vehicle in vehicles" :key="vehicle.plate" :value="vehicle.plate">{{ vehicle.car }}</option>
        </datalist>
        <label>{{ t('car') }}<input v-model="form.car"></label>
        <label>{{ t('name') }}<input v-model="form.client"></label>
        <label>{{ t('calPhone') }}<input v-model="form.phone"></label>
        <label class="wide">{{ t('calNote') }}<input v-model="form.note"></label>
        <p v-if="conflictWarning" class="cal-conflict">⚠ {{ conflictWarning }}</p>
        <div class="cal-form-actions">
          <button type="submit" class="primary">{{ t('maintSave') }}</button>
          <button v-if="!form.isNew" type="button" class="secondary" @click="emit('remove', form.id); form = null">{{ t('calDelete') }}</button>
          <button type="button" class="secondary" @click="form = null">{{ t('maintCancel') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
