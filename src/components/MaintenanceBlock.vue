<script setup>
import { computed, ref } from 'vue'
import { CATEGORY_CODES, emptyRecord, maintenanceSummary, normalizeRecord, suggestNextInspection } from '../lib/maintenance'

const props = defineProps({
  vehicle: { type: Object, required: true },
  record: { type: Object, default: null },
  t: { type: Function, required: true },
  locale: { type: String, default: 'bg-BG' },
  today: { type: String, default: '' },
})
const emit = defineEmits(['save'])

const editing = ref(false)
const form = ref(emptyRecord())

const summary = computed(() => maintenanceSummary({
  record: props.record || {},
  mileage: props.vehicle.mileage || 0,
  visits: props.vehicle.visits || [],
  today: props.today,
}))

// Подсказка за следващия преглед по Наредба Н-32 (от последния преглед и категорията).
const nextInspection = computed(() => (props.record
  ? suggestNextInspection({ lastInspection: props.record.gtiDue, category: props.record.category, firstRegistration: props.record.firstRegistration }, props.today)
  : ''))

function startEdit() {
  form.value = { ...emptyRecord(), ...(props.record || {}) }
  editing.value = true
}
function save() {
  emit('save', normalizeRecord(form.value))
  editing.value = false
}

const titles = { gti: 'maintGti', insurance: 'maintInsurance', vignette: 'maintVignette', service: 'maintService' }
const states = { overdue: 'maintOverdueState', urgent: 'maintUrgent', soon: 'maintSoon', ok: 'maintOk' }
const titleFor = (row) => props.t(titles[row.key] || 'maintService')
const stateFor = (row) => props.t(states[row.state] || 'maintOk')
const whenFor = (row) => {
  if (row.state === 'unknown' || row.daysLeft === null || row.daysLeft === undefined) return ''
  if (row.state === 'overdue') return props.t('maintOverdue') + ' ' + Math.abs(row.daysLeft) + ' ' + props.t('maintDaysUnit')
  return props.t('maintLeft') + ' ' + row.daysLeft + ' ' + props.t('maintDaysUnit')
}
const serviceExtra = (row) => {
  const parts = []
  if (row.kmLeft !== null && row.kmLeft !== undefined) parts.push(props.t('maintLeft') + ' ~' + Number(row.kmLeft).toLocaleString(props.locale) + ' km')
  if (row.date) parts.push(props.t('maintForecast') + ' ' + row.date)
  return parts.join(' · ')
}
</script>

<template>
  <section class="maintenance">
    <header class="maintenance-head">
      <h3>{{ t('maintenanceTitle') }}</h3>
      <button v-if="!editing" type="button" class="link" @click="startEdit">{{ record ? t('maintEdit') : t('maintFill') }}</button>
    </header>

    <p v-if="!record && !editing" class="maintenance-empty">{{ t('maintenanceEmpty') }}</p>

    <div v-if="record && !editing" class="maintenance-rows">
      <div v-for="row in summary" :key="row.key" :class="['maintenance-row', row.state]">
        <span>{{ titleFor(row) }}</span>
        <strong>{{ row.date || '—' }}</strong>
        <em v-if="row.state !== 'unknown'">{{ stateFor(row) }}</em>
        <small>{{ row.key === 'service' ? serviceExtra(row) : whenFor(row) }}</small>
      </div>
      <p v-if="nextInspection" class="maintenance-next">{{ t('maintNextInspection') }} · {{ nextInspection }}</p>
    </div>

    <form v-if="editing" class="maintenance-form" @submit.prevent="save">
      <label>{{ t('maintCategory') }}
        <select v-model="form.category"><option v-for="code in CATEGORY_CODES" :key="code" :value="code">{{ code }}</option></select>
      </label>
      <label>{{ t('maintFirstReg') }}<input v-model="form.firstRegistration" placeholder="15.03.2018"></label>
      <label>{{ t('maintGti') }}<input v-model="form.gtiDue" placeholder="05.10.2026"></label>
      <label>{{ t('maintInsurance') }}<input v-model="form.insuranceDue" placeholder="27.09.2026"></label>
      <label>{{ t('maintVignette') }}<input v-model="form.vignetteDue" placeholder="30.11.2026"></label>
      <label>{{ t('maintIntervalKm') }}<input v-model="form.serviceIntervalKm" inputmode="numeric" placeholder="15000"></label>
      <label>{{ t('maintIntervalMonths') }}<input v-model="form.serviceIntervalMonths" inputmode="numeric" placeholder="12"></label>
      <label>{{ t('maintLastServiceKm') }}<input v-model="form.lastServiceKm" inputmode="numeric" placeholder="199800"></label>
      <label>{{ t('maintLastServiceDate') }}<input v-model="form.lastServiceDate" placeholder="03.02.2026"></label>
      <div class="maintenance-actions">
        <button type="submit" class="primary">{{ t('maintSave') }}</button>
        <button type="button" class="secondary" @click="editing = false">{{ t('maintCancel') }}</button>
      </div>
    </form>
  </section>
</template>
