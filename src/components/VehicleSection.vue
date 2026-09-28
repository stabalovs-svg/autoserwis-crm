<script setup>
import { computed, ref } from 'vue'
import { formatMileage, searchVehicles } from '../lib/vehicles'
import PlateScanner from './PlateScanner.vue'

const props = defineProps({
  vehicles: { type: Array, default: () => [] },
  t: { type: Function, required: true },
  locale: { type: String, default: 'lv-LV' },
  statusText: { type: Object, default: () => ({}) },
  photosCount: { type: Function, default: () => 0 },
})
const emit = defineEmits(['open', 'new-order'])

const query = ref('')
const found = computed(() => searchVehicles(props.vehicles, query.value))

const isVinSearch = computed(() => /^[A-HJ-NPR-Z0-9]{17}$/i.test(query.value.trim()))
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
