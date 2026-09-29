<script setup>
import { computed } from 'vue'
import { buildMessage } from '../lib/reminder-templates'
import { suggestSlot } from '../lib/reminders'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  counts: { type: Object, default: () => ({}) },
  consents: { type: Object, default: () => ({}) },
  messages: { type: Array, default: () => [] },
  bookings: { type: Array, default: () => [] },
  shop: { type: Object, default: () => ({}) },
  t: { type: Function, required: true },
  locale: { type: String, default: 'bg-BG' },
  lang: { type: String, default: 'bg' },
  today: { type: String, default: '' },
  workshop: { type: String, default: 'IKARS' },
  workshopPhone: { type: String, default: '' },
})
const emit = defineEmits(['send', 'snooze', 'decline', 'book', 'consent'])

const kindKeys = {
  gti: 'remReasonGti',
  insurance: 'remReasonInsurance',
  vignette: 'remReasonVignette',
  service: 'remReasonService',
  reactivation: 'remReasonReactivation',
}
const stateKeys = { overdue: 'maintOverdueState', urgent: 'maintUrgent', soon: 'maintSoon', ok: 'maintOk' }

const kindLabel = (kind) => props.t(kindKeys[kind] || 'remReasonGti')
const stateLabel = (state) => props.t(stateKeys[state] || 'maintSoon')

// Для каждой строки: сообщение и ближайший свободный слот на линии ГТП.
const items = computed(() => props.rows.map((row) => {
  const slot = row.kind === 'reactivation' || row.kind === 'service'
    ? suggestSlot({ bookings: props.bookings, shop: props.shop, today: props.today, resource: 'gti' })
    : suggestSlot({ bookings: props.bookings, shop: props.shop, today: props.today, resource: 'gti' })
  const message = buildMessage(row, {
    lang: props.lang,
    workshop: props.workshop,
    workshopPhone: props.workshopPhone,
    slot,
  })
  return { ...row, slot, message }
}))

const journal = computed(() => props.messages.slice(0, 6))

const hasConsent = (row) => {
  const key = String(row.phone || '').replace(/[^0-9]/g, '')
  const record = props.consents[key]
  return record ? record.allowed !== false : false
}

const whenText = (row) => {
  if (row.daysLeft === null || row.daysLeft === undefined) return ''
  const days = Math.abs(row.daysLeft)
  return row.daysLeft < 0
    ? `${props.t('remDaysOverdue')} ${days} ${props.t('remDays')}`
    : `${props.t('remDaysLeft')} ${days} ${props.t('remDays')}`
}

const smsHref = (item) => `sms:${String(item.phone || '').replace(/[^\d+]/g, '')}?body=${encodeURIComponent(item.message.short)}`
const viberHref = (item) => `viber://chat?number=${encodeURIComponent(String(item.phone || '').replace(/[^\d+]/g, ''))}`
const waHref = (item) => `https://wa.me/${String(item.phone || '').replace(/\D/g, '')}?text=${encodeURIComponent(item.message.short)}`
const telHref = (item) => `tel:${String(item.phone || '').replace(/[^\d+]/g, '')}`
</script>

<template>
  <div class="rem">
    <div class="rem-metrics">
      <article><span>{{ t('remTotal') }}</span><strong>{{ counts.total || 0 }}</strong><em>{{ t('remToday') }}</em></article>
      <article><span>{{ t('remOverdue') }}</span><strong>{{ counts.overdue || 0 }}</strong><em>⚠</em></article>
      <article><span>{{ t('remUrgent') }}</span><strong>{{ counts.urgent || 0 }}</strong><em>!</em></article>
      <article><span>{{ t('remSoon') }}</span><strong>{{ counts.soon || 0 }}</strong><em>→</em></article>
      <article><span>{{ t('remCall') }}</span><strong>{{ counts.call || 0 }}</strong><em>☎</em></article>
    </div>
    <p class="rem-quiet">ℹ {{ t('remQuiet') }}</p>
    <p v-if="!items.length" class="rem-empty">{{ t('remEmpty') }}</p>

    <div v-for="item in items" :key="item.id" :class="['rem-row', item.state]">
      <div class="rem-main">
        <div class="rem-who">
          <strong>{{ item.client || item.phone }}</strong>
          <a v-if="item.phone" :href="telHref(item)">{{ item.phone }}</a>
          <span class="rem-due">
            {{ kindLabel(item.kind) }} · {{ item.dueDate }}
            <em>{{ stateLabel(item.state) }}</em>
            <i v-if="whenText(item)">{{ whenText(item) }}</i>
            <i v-if="item.kmLeft !== null && item.kmLeft !== undefined"> · ~{{ item.kmLeft }} km</i>
          </span>
          <span class="rem-car">{{ item.car }} <b class="plate">{{ item.plate }}</b></span>
        </div>
        <div class="rem-actions">
          <a :href="smsHref(item)" class="primary rem-btn" @click="emit('send', item, 'sms')">✉ SMS</a>
          <a :href="viberHref(item)" class="secondary rem-btn" @click="emit('send', item, 'viber')">Viber</a>
          <a :href="waHref(item)" class="secondary rem-btn" target="_blank" rel="noopener" @click="emit('send', item, 'whatsapp')">WhatsApp</a>
          <a :href="telHref(item)" class="secondary rem-btn" @click="emit('send', item, 'call')">☎ {{ t('remCall') }}</a>
        </div>
      </div>

      <p v-if="item.slot" class="rem-slot">
        {{ t('remSlot') }}: <b>{{ item.slot.date }} {{ item.slot.start }}</b>
        <button type="button" class="secondary rem-btn" @click="emit('book', item, item.slot)">＋ {{ t('remBook') }}</button>
      </p>
      <p v-else class="rem-slot">{{ t('remNoTime') }}</p>

      <p class="rem-text">{{ item.message.short }}</p>

      <div class="rem-foot">
        <span v-if="hasConsent(item)" class="rem-consent ok">✓ {{ t('remConsentYes') }}</span>
        <span v-else class="rem-consent warn">⚠ {{ t('remConsentNo') }}
          <button type="button" class="link" @click="emit('consent', item.phone, true)">{{ t('remGiveConsent') }}</button>
        </span>
        <span class="rem-foot-actions">
          <button type="button" class="link" @click="emit('snooze', item, 7)">{{ t('remSnooze') }}</button>
          <button type="button" class="link" @click="emit('decline', item)">{{ t('remDecline') }}</button>
        </span>
      </div>
    </div>

    <section class="rem-journal">
      <h3>{{ t('remJournal') }}</h3>
      <p v-if="!journal.length" class="rem-empty">{{ t('remJournalEmpty') }}</p>
      <p v-for="row in journal" :key="row.id" class="rem-log">
        <b>{{ row.sentAt }}</b> · {{ row.client || row.phone }} · {{ row.channel }} · <span>{{ row.text }}</span>
      </p>
    </section>
  </div>
</template>

