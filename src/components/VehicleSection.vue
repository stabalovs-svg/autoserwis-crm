<script setup>
import { computed, ref } from 'vue'
import { formatMileage, searchVehicles } from '../lib/vehicles'
import { maintenanceSummary } from '../lib/maintenance'
import PlateScanner from './PlateScanner.vue'

const props = defineProps({
  vehicles: { type: Array, default: () => [] },
  t: { type: Function, required: true },
  locale: { type: String, default: 'lv-LV' },
  statusText: { type: Object, default: () => ({}) },
  photosCount: { type: Function, default: () => 0 },
  maintenance: { type: Object, default: () => ({}) },
  today: { type: String, default: '' },
})
const emit = defineEmits(['open', 'new-order'])

const query = ref('')
const isVinSearch = computed(() => /^[A-HJ-NPR-Z0-9]{17}$/i.test(query.value.trim()))

// Самое срочное напоминание по автомобилю — маленький бейдж в списке машин.
const rank = { overdue: 0, urgent: 1, soon: 2 }
const shortTitles = { gti: 'maintGtiShort', insurance: 'maintInsuranceShort', service: 'maintServiceShort', vignette: 'maintVignette' }
function dueFor(vehicle) {
  const record = props.maintenance?.[vehicle.key]
  if (!record) return null
  const rows = maintenanceSummary({ record, mileage: vehicle.mileage || 0, visits: vehicle.visits || [], today: props.today })
  const pick = rows.filter((row) => row.state in rank).sort((a, b) => rank[a.state] - rank[b.state])[0]
  if (!pick) return null
  const when = pick.state === 'overdue' ? props.t('maintOverdueState') : `${pick.daysLeft} ${props.t('maintDaysUnit')}`
  return { state: pick.state, label: `${props.t(shortTitles[pick.key] || 'maintServiceShort')} · ${when}` }
}

const found = computed(() => searchVehicles(props.vehicles, query.value).map((vehicle) => ({ ...vehicle, due: dueFor(vehicle) })))
</script>

<template>
  <div class="vehicles">
    <div class="vehicles-head">
      <div>
        <p class="eyebrow">IKARS · {{ t('vehicles') }}</p>
        <h1>{{ t('vehiclesTitle') }}</h1>
      </div>
      <label class="vehicles-search">
        <span>⌕</span>
        <input v-model="query" :placeholder="t('vehiclesSearch')" autocomplete="off">
      </label>
    </div>

    <p class="vehicles-hint">{{ isVinSearch ? t('vehiclesVinFound') : t('vehiclesHint') }}</p>

    <PlateScanner :vehicles="vehicles" :t="t" @open="emit('open', $event)" @new-order="emit('new-order', $event)" />

    <p v-if="!found.length" class="vehicles-empty">{{ query ? t('vehiclesNothing') : t('vehiclesEmpty') }}</p>

    <div class="vehicle-grid">
      <article v-for="vehicle in found" :key="vehicle.key" class="vehicle-card">
        <header>
          <span class="plate">{{ vehicle.plate }}</span>
          <em v-if="vehicle.open" class="open-badge">{{ vehicle.open }} · {{ t('inWork') }}</em>
          <em v-if="vehicle.due" :class="['due-badge', vehicle.due.state]">{{ vehicle.due.label }}</em>
        </header>

        <h2>{{ vehicle.car || t('carUnknown') }}</h2>
        <p class="vin" v-if="vehicle.vin">{{ t('vin') }} · {{ vehicle.vin }}</p>
        <p class="client">{{ vehicle.client }}<span v-if="vehicle.phone"> · {{ vehicle.phone }}</span></p>

        <dl>
          <div><dt>{{ t('visits') }}</dt><dd>{{ vehicle.visits.length }}</dd></div>
          <div><dt>{{ t('mileage') }}</dt><dd>{{ formatMileage(vehicle.mileage, locale) }}</dd></div>
          <div><dt>{{ t('spentAll') }}</dt><dd>€{{ vehicle.total }}</dd></div>
          <div><dt>{{ t('photos') }}</dt><dd>{{ photosCount(vehicle) }}</dd></div>
        </dl>

        <footer>
          <small v-if="vehicle.lastVisit">{{ vehicle.lastVisit.date }} · {{ vehicle.lastVisit.service }}</small>
          <div class="vehicle-actions">
            <button type="button" class="secondary" @click="emit('new-order', vehicle)">＋ {{ t('newOrder') }}</button>
            <button type="button" class="primary" @click="emit('open', vehicle)">{{ t('openVehicle') }} →</button>
          </div>
        </footer>
      </article>
    </div>
  </div>
</template>
