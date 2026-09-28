<script setup>
import { computed } from 'vue'
import PhotoStrip from './PhotoStrip.vue'
import { formatMileage, isValidVin } from '../lib/vehicles'

const props = defineProps({
  vehicle: { type: Object, required: true },
  t: { type: Function, required: true },
  statusText: { type: Object, default: () => ({}) },
  photos: { type: Array, default: () => [] },
  busy: { type: Boolean, default: false },
  tag: { type: String, default: 'general' },
  vinInfo: { type: Object, default: null },
  vinBusy: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'add-photos', 'remove-photo', 'open-photo', 'open-order', 'new-order', 'decode-vin', 'update:tag'])

const vinValid = computed(() => isValidVin(props.vehicle.vin))
const openVisit = computed(() => props.vehicle.visits.find((visit) => visit.status !== 'done') || null)
</script>

<template>
  <aside class="drawer vehicle-drawer">
    <button class="x" type="button" @click="emit('close')">×</button>

    <p class="eyebrow">IKARS · {{ t('vehicleCard') }}</p>
    <div class="vehicle-heading">
      <span class="plate">{{ vehicle.plate }}</span>
      <div>
        <h2>{{ vehicle.car || t('carUnknown') }}</h2>
        <small>{{ vehicle.client }}<span v-if="vehicle.phone"> · {{ vehicle.phone }}</span></small>
      </div>
    </div>

    <div class="detail-grid">
      <div>
        <span>{{ t('vin') }}</span>
        <strong class="mono">{{ vehicle.vin || '—' }}</strong>
        <small v-if="vehicle.vin && !vinValid" class="warn">{{ t('vinInvalid') }}</small>
        <button v-if="vinValid" type="button" class="link" :disabled="vinBusy" @click="emit('decode-vin', vehicle.vin)">
          {{ vinBusy ? t('vinDecoding') : t('vinDecode') }}
        </button>
      </div>
      <div>
        <span>{{ t('mileage') }}</span>
        <strong>{{ formatMileage(vehicle.mileage) }}</strong>
        <small v-if="vehicle.mileageDelta">+{{ vehicle.mileageDelta.toLocaleString('lv-LV') }} km {{ t('sinceLastVisit') }}</small>
      </div>
      <div><span>{{ t('visits') }}</span><strong>{{ vehicle.visits.length }}</strong></div>
      <div>
        <span>{{ t('spentAll') }}</span>
        <strong>€{{ vehicle.total }}</strong>
        <small v-if="vehicle.debt" class="warn">{{ t('debt') }} €{{ vehicle.debt }}</small>
      </div>
    </div>

    <p v-if="vinInfo" class="vin-decoded">
      <b>{{ vinInfo.car }}</b><span v-if="vinInfo.engine">{{ vinInfo.engine }}</span>
      <button type="button" class="link" @click="emit('decode-vin', vehicle.vin)">{{ t('vinAgain') }}</button>
    </p>

    <div v-if="openVisit" class="current-repair">
      <span>{{ t('currentRepair') }}</span>
      <strong>{{ openVisit.service }}</strong>
      <small>{{ openVisit.id }} · {{ statusText[openVisit.status] }}</small>
      <button type="button" @click="emit('open-order', openVisit)">{{ t('openOrder') }} →</button>
    </div>

    <section class="photos">
      <h3>{{ t('photos') }}</h3>
      <PhotoStrip
        :photos="photos"
        :t="t"
        :busy="busy"
        :tag="tag"
        @add="emit('add-photos', $event)"
        @remove="emit('remove-photo', $event)"
        @open="emit('open-photo', $event)"
        @update:tag="emit('update:tag', $event)"
      />
    </section>

    <section class="history">
      <h3>{{ t('vehicleHistory') }}</h3>
      <p v-if="!vehicle.visits.length">{{ t('historyEmpty') }}</p>
      <button v-for="visit in vehicle.visits" :key="visit.id" type="button" class="history-row" @click="emit('open-order', visit)">
        <time>{{ visit.date }}<small>{{ visit.time }}</small></time>
        <span>
          <strong>{{ visit.service }}</strong>
          <small>{{ visit.id }} · {{ visit.master }}<template v-if="visit.mileage"> · {{ visit.mileage.toLocaleString('lv-LV') }} km</template></small>
        </span>
        <em :class="['status', visit.status]">{{ statusText[visit.status] }}</em>
        <b>€{{ visit.labor + visit.parts }}</b>
      </button>
    </section>

    <div class="drawer-actions">
      <a v-if="vehicle.phone" class="secondary action-link" :href="`tel:${vehicle.phone.replaceAll(' ', '')}`">☎ {{ t('callClient') }}</a>
      <button type="button" class="primary" @click="emit('new-order', vehicle)">＋ {{ t('newOrder') }}</button>
      <button type="button" class="secondary" @click="emit('close')">{{ t('close') }}</button>
    </div>
  </aside>
</template>
