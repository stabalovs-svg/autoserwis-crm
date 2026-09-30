<script setup>
import { computed, onMounted, ref } from 'vue'
import { engineName, scanPlate, scanVin, warmUp } from '../lib/recognition'
import { plateKey, vinChecksumOk } from '../lib/plates'
import { decodeVin } from '../lib/vehicles'
import PlateAreaPicker from './PlateAreaPicker.vue'

const props = defineProps({
  vehicles: { type: Array, default: () => [] },
  t: { type: Function, required: true },
})
const emit = defineEmits(['open', 'new-order'])

const busy = ref(false)
const kind = ref('plate')
const progress = ref(0)
const error = ref('')
const preview = ref('')
const result = ref(null)
const manual = ref('')
const pickedFile = ref(null)
const picking = ref(false)
const engine = engineName()

function findVehicle(value) {
  const text = String(value || '').trim()
  if (!text) return null
  const plate = plateKey(text)
  const vin = text.toUpperCase().replace(/[^A-Z0-9]/g, '')
  return props.vehicles.find((vehicle) => (plate && plateKey(vehicle.plate) === plate) || (vehicle.vin && vehicle.vin.toUpperCase() === vin)) || null
}

const found = computed(() => findVehicle(manual.value))
// Номера из базы CRM: по ним OCR-опечатки исправляются на правильный номер машины.
const knownPlates = computed(() => props.vehicles.map((vehicle) => vehicle.plate).filter(Boolean))

onMounted(() => {
  warmUp()
})

async function pick(event, next) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  kind.value = next
  busy.value = true
  error.value = ''
  result.value = null
  manual.value = ''
  progress.value = 3
  if (preview.value) URL.revokeObjectURL(preview.value)
  preview.value = URL.createObjectURL(file)
  pickedFile.value = file
  await scan(file, null)
}

// Общий путь для авто-распознавания и для области, выделенной пальцем.
async function scan(file, rect) {
  busy.value = true
  error.value = ''
  if (rect) progress.value = 5
  try {
    const next = kind.value
    const read = next === 'plate' ? scanPlate : scanVin
    const output = next === 'plate'
      ? await read(file, (value) => { progress.value = value }, { knownPlates: knownPlates.value, rect })
      : await read(file, (value) => { progress.value = value })
    result.value = output
    const sure = output.source === 'barcode' || output.known || (output.kind === 'vin' ? vinChecksumOk(output.value) : output.confidence >= 60)
    manual.value = sure ? output.value || '' : ''
    if (!output.value) error.value = props.t('scanNothing')
    else if (!sure) error.value = props.t('scanLowConfidence')
    // Не получилось с первого раза — предлагаем оградить номер вручную.
    if (next === 'plate' && !output.known && (output.confidence || 0) < 60) picking.value = true
  } catch {
    error.value = props.t('scanFailed')
  } finally {
    busy.value = false
    progress.value = 0
  }
}

async function useArea(rect) {
  picking.value = false
  if (pickedFile.value) await scan(pickedFile.value, rect)
}

async function createOrder() {
  const value = manual.value.trim()
  if (!value) return
  const isVin = result.value?.kind === 'vin' && /^[A-HJ-NPR-Z0-9]{17}$/i.test(value)
  let car = ''
  let vin = ''
  if (isVin) {
    vin = value.toUpperCase()
    try {
      const decoded = await decodeVin(vin)
      car = decoded?.car || ''
    } catch {
      car = ''
    }
  }
  emit('new-order', { plate: vin ? '' : value.toUpperCase(), vin, car, client: '', phone: '' })
}
</script>

<template>
  <section class="scanner">
    <div class="scanner-head">
      <div>
        <p class="eyebrow">ANPR · {{ t('scanTitle') }}</p>
        <h2>{{ t('scanLead') }}</h2>
      </div>
      <span class="scanner-engine">{{ engine === 'local' ? t('scanEngineLocal') : engine }}</span>
    </div>

    <div class="scanner-actions">
      <label class="primary file-button">📷 {{ t('scanPlate') }}
        <input type="file" accept="image/*" capture="environment" @change="pick($event, 'plate')">
      </label>
      <label class="secondary file-button">🔖 {{ t('scanVin') }}
        <input type="file" accept="image/*" capture="environment" @change="pick($event, 'vin')">
      </label>
      <small class="scanner-hint">{{ t('scanHint') }}</small>
    </div>
    <button v-if="preview && pickedFile" type="button" class="secondary full" @click="picking = true">✂ {{ t('scanAreaPick') }}</button>
    <small class="scanner-tips">{{ t('scanTips') }}</small>

    <div v-if="busy" class="scanner-busy">
      <span class="scanner-bar"><i :style="{ width: Math.max(progress, 4) + '%' }"></i></span>
      <small>{{ t('scanBusy') }} {{ progress }}%</small>
    </div>

    <p v-if="error" class="scanner-error">{{ error }}</p>

    <div v-if="preview" class="scanner-result">
      <img :src="preview" alt="">
      <div class="scanner-fields">
        <p class="eyebrow">
          {{ kind === 'vin' ? t('vin') : t('plate') }}
          <template v-if="result"> · {{ t('scanConfidence') }} {{ result.confidence }}%</template>
          <template v-if="result && result.source === 'barcode'"> · {{ t('scanBarcode') }}</template>
        </p>
        <p v-if="result && result.known" class="scanner-known">✓ {{ t('scanKnownBase') }} · {{ result.known }}</p>
        <p v-if="result && result.raw" class="scanner-raw">{{ t('scanRaw') }}: {{ result.raw }}</p>
        <label class="scanner-input">
          <input v-model="manual" :placeholder="kind === 'vin' ? 'WVWZZZ1JZ…' : 'AB-1234'">
        </label>
        <div v-if="result && result.candidates.length > 1" class="scanner-candidates">
          <button v-for="item in result.candidates" :key="item.value" type="button" @click="manual = item.value">{{ item.value }}</button>
        </div>

        <div v-if="found" class="scanner-found">
          <div>
            <strong>{{ found.plate || found.vin }}</strong>
            <span>{{ found.car || t('carUnknown') }} · {{ found.visits.length }} {{ t('visits').toLowerCase() }}</span>
          </div>
          <button type="button" class="primary" @click="emit('open', found)">{{ t('openVehicle') }} →</button>
        </div>

        <div v-else-if="manual" class="scanner-new">
          <span>{{ t('scanNotFound') }}</span>
          <button type="button" class="primary" @click="createOrder">＋ {{ t('newOrder') }}</button>
        </div>
      </div>
    </div>
      <PlateAreaPicker
      v-if="picking && preview"
      :image-url="preview"
      :t="t"
      @select="useArea"
      @cancel="picking = false"
    />

</section>
</template>
