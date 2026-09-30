<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  imageUrl: { type: String, required: true },
  t: { type: Function, required: true },
})
const emit = defineEmits(['select', 'cancel'])

const box = ref(null)
const area = ref(null)
const dragging = ref(false)
const anchor = ref({ x: 0, y: 0 })

function point(event) {
  const rect = box.value.getBoundingClientRect()
  return {
    x: Math.min(Math.max(event.clientX - rect.left, 0), rect.width),
    y: Math.min(Math.max(event.clientY - rect.top, 0), rect.height),
  }
}
function down(event) {
  dragging.value = true
  anchor.value = point(event)
  area.value = { x: anchor.value.x, y: anchor.value.y, w: 0, h: 0 }
  event.target.setPointerCapture?.(event.pointerId)
}
function move(event) {
  if (!dragging.value) return
  const now = point(event)
  area.value = {
    x: Math.min(anchor.value.x, now.x),
    y: Math.min(anchor.value.y, now.y),
    w: Math.abs(now.x - anchor.value.x),
    h: Math.abs(now.y - anchor.value.y),
  }
}
function up() {
  dragging.value = false
  // Слишком маленькая рамка — считаем, что это случайное касание.
  if (area.value && (area.value.w < 24 || area.value.h < 10)) area.value = null
}
function confirm() {
  const rect = box.value.getBoundingClientRect()
  if (!area.value || !rect.width || !rect.height) return
  emit('select', {
    x: area.value.x / rect.width,
    y: area.value.y / rect.height,
    w: area.value.w / rect.width,
    h: area.value.h / rect.height,
  })
}
const boxStyle = computed(() => (area.value
  ? { left: area.value.x + 'px', top: area.value.y + 'px', width: area.value.w + 'px', height: area.value.h + 'px' }
  : { display: 'none' }))
</script>

<template>
  <div class="overlay area-picker" @click.self="emit('cancel')">
    <div class="area-modal">
      <p class="eyebrow">IKARS · ANPR</p>
      <h2>{{ t('scanAreaTitle') }}</h2>
      <p class="area-lead">{{ t('scanAreaLead') }}</p>
      <div
        ref="box"
        class="area-box"
        @pointerdown.prevent="down"
        @pointermove.prevent="move"
        @pointerup="up"
        @pointercancel="up"
        @pointerleave="up"
      >
        <img :src="imageUrl" alt="" draggable="false">
        <span class="area-rect" :style="boxStyle"></span>
      </div>
      <p class="area-hint">{{ t('scanAreaHint') }}</p>
      <div class="area-actions">
        <button type="button" class="primary" :disabled="!area" @click="confirm">{{ t('scanAreaRun') }}</button>
        <button type="button" class="secondary" @click="emit('cancel')">{{ t('maintCancel') }}</button>
      </div>
    </div>
  </div>
</template>
