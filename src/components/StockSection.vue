<script setup>
import { computed, ref } from 'vue'
import { lowStockItems, movesForArticle, nextMoveId, normalizeMove, stockValue, validateMove } from '../lib/stock'

const props = defineProps({
  items: { type: Array, default: () => [] },
  moves: { type: Array, default: () => [] },
  orders: { type: Array, default: () => [] },
  masters: { type: Array, default: () => [] },
  t: { type: Function, required: true },
  locale: { type: String, default: 'bg-BG' },
  today: { type: String, default: '' },
})
const emit = defineEmits(['move'])

const query = ref('')
const onlyLow = ref(false)
const form = ref(null)
const historyFor = ref(null)
const error = ref('')

const value = computed(() => stockValue(props.items))
const low = computed(() => lowStockItems(props.items))
const rows = computed(() => {
  const needle = query.value.trim().toUpperCase()
  return props.items
    .filter((item) => !onlyLow.value || Number(item.qty) <= Number(item.min))
    .filter((item) => !needle || `${item.article} ${item.name}`.toUpperCase().includes(needle))
})

const sortKey = (move) => String(move.date || '').split('.').reverse().join('') + String(move.id || '')
const recent = computed(() => [...props.moves].sort((a, b) => sortKey(b).localeCompare(sortKey(a))).slice(0, 8))
const articleHistory = computed(() => (historyFor.value ? movesForArticle(props.moves, historyFor.value.article) : []))

const kindKeys = { in: 'stkKindIn', out: 'stkKindOut', return: 'stkKindReturn', adjust: 'stkKindAdjust' }
const kindLabel = (kind) => props.t(kindKeys[kind] || 'stkKindIn')
const money = (amount) => '€' + (Number(amount) || 0).toFixed(2)
const marginOf = (item) => {
  const buy = Number(item.buy) || 0
  const sell = Number(item.sell) || 0
  return { amount: sell - buy, percent: sell ? Math.round(((sell - buy) / sell) * 100) : 0 }
}

function openForm(preset = {}) {
  error.value = ''
  const first = props.items[0] || {}
  form.value = {
    id: nextMoveId(props.moves),
    article: preset.article || first.article || '',
    kind: preset.kind || 'in',
    qty: preset.qty || 1,
    buyPrice: preset.buyPrice !== undefined ? preset.buyPrice : (first.buy || ''),
    supplier: preset.supplier || '',
    orderId: preset.orderId || '',
    master: preset.master || props.masters[0] || '',
    note: '',
    date: props.today,
  }
}
function changeArticle() {
  const item = props.items.find((row) => row.article === form.value.article)
  if (item) form.value.buyPrice = item.buy
}
function save() {
  const move = normalizeMove(form.value)
  const check = validateMove(move, props.items)
  if (!check.ok) {
    error.value = check.error === 'shortage'
      ? `${props.t('stkShortage')}: ${props.t('quantity')} ${check.available}`
      : props.t('stkBadMove')
    return
  }
  emit('move', move)
  form.value = null
}
</script>

<template>
  <div class="stk">
    <div class="stk-metrics">
      <article><span>{{ t('stkPositions') }}</span><strong>{{ items.length }}</strong><em>{{ value.units }} {{ t('stkUnits') }}</em></article>
      <article><span>{{ t('stkValueBuy') }}</span><strong>{{ money(value.buy) }}</strong><em>{{ t('purchase') }}</em></article>
      <article><span>{{ t('stkValueSell') }}</span><strong>{{ money(value.sell) }}</strong><em>{{ t('sale') }}</em></article>
      <article><span>{{ t('stkLow') }}</span><strong>{{ low.length }}</strong><em>{{ t('low') }}</em></article>
      <article><span>{{ t('stkMoves') }}</span><strong>{{ moves.length }}</strong><em>{{ t('stkHistory') }}</em></article>
    </div>

    <div class="stk-bar">
      <label class="stk-search"><span>⌕</span><input v-model="query" :placeholder="t('stkSearch')"></label>
      <label class="stk-toggle"><input type="checkbox" v-model="onlyLow"> {{ t('stkOnlyLow') }}</label>
      <button type="button" class="primary" @click="openForm({ kind: 'in' })">＋ {{ t('stkIncome') }}</button>
    </div>

    <div class="panel table-panel">
      <table>
        <thead><tr>
          <th>{{ t('parts') }}</th><th>{{ t('quantity') }}</th><th>{{ t('purchase') }}</th><th>{{ t('sale') }}</th><th>{{ t('stkMargin') }}</th><th></th>
        </tr></thead>
        <tbody>
          <tr v-for="item in rows" :key="item.article" :class="{ 'stk-row-low': Number(item.qty) <= Number(item.min) }">
            <td><strong>{{ item.name }}</strong><small>{{ item.article }}</small></td>
            <td>
              <span :class="['stock-pill', { danger: Number(item.qty) <= Number(item.min) }]">{{ item.qty }}</span>
              <small>{{ t('stkMin') }} {{ item.min }}</small>
            </td>
            <td>{{ money(item.buy) }}</td>
            <td>{{ money(item.sell) }}</td>
            <td>{{ money(marginOf(item).amount) }} <small>{{ marginOf(item).percent }}%</small></td>
            <td class="stk-actions">
              <button type="button" :title="t('stkIncome')" @click="openForm({ kind: 'in', article: item.article })">＋</button>
              <button type="button" :title="t('stkWriteOff')" @click="openForm({ kind: 'out', article: item.article })">−</button>
              <button type="button" :title="t('stkHistory')" @click="historyFor = item">⟲</button>
            </td>
          </tr>
          <tr v-if="!rows.length"><td colspan="6" class="stk-none">{{ t('stkNone') }}</td></tr>
        </tbody>
      </table>
    </div>
    <section class="stk-journal">
      <h3>{{ t('stkHistory') }}</h3>
      <p v-if="!recent.length" class="stk-none">{{ t('stkNoMoves') }}</p>
      <p v-for="move in recent" :key="move.id" class="stk-log">
        <b>{{ move.date }}</b> · {{ kindLabel(move.kind) }} · {{ move.article }} ·
        <em :class="['stk-qty', move.kind === 'out' ? 'minus' : 'plus']">{{ move.kind === 'out' ? '−' : '+' }}{{ move.qty }}</em>
        <span v-if="move.orderId"> · {{ move.orderId }}</span>
        <span v-if="move.master"> · {{ move.master }}</span>
        <span v-if="move.supplier"> · {{ move.supplier }}</span>
        <span v-if="move.note"> · {{ move.note }}</span>
      </p>
    </section>

    <div v-if="historyFor" class="overlay" @click.self="historyFor = null">
      <aside class="drawer">
        <button class="x" type="button" @click="historyFor = null">×</button>
        <p class="eyebrow">{{ t('stkHistory') }}</p>
        <h2>{{ historyFor.name }}</h2>
        <div class="detail-grid">
          <div><span>{{ t('quantity') }}</span><strong>{{ historyFor.qty }}</strong><small>{{ t('stkMin') }} {{ historyFor.min }}</small></div>
          <div><span>{{ t('stkMargin') }}</span><strong>{{ money(marginOf(historyFor).amount) }}</strong><small>{{ marginOf(historyFor).percent }}%</small></div>
        </div>
        <p v-if="!articleHistory.length" class="stk-none">{{ t('stkNoMoves') }}</p>
        <p v-for="move in articleHistory" :key="move.id" class="stk-log">
          <b>{{ move.date }}</b> · {{ kindLabel(move.kind) }} ·
          <em :class="['stk-qty', move.kind === 'out' ? 'minus' : 'plus']">{{ move.kind === 'out' ? '−' : '+' }}{{ move.qty }}</em>
          <span v-if="move.orderId"> · {{ move.orderId }}</span>
          <span v-if="move.supplier"> · {{ move.supplier }}</span>
        </p>
        <div class="drawer-actions">
          <button type="button" class="primary" @click="openForm({ kind: 'in', article: historyFor.article }); historyFor = null">＋ {{ t('stkIncome') }}</button>
          <button type="button" class="secondary" @click="openForm({ kind: 'out', article: historyFor.article }); historyFor = null">− {{ t('stkWriteOff') }}</button>
        </div>
      </aside>
    </div>
    <div v-if="form" class="overlay" @click.self="form = null">
      <form class="modal stk-form" @submit.prevent="save">
        <button type="button" class="x" @click="form = null">×</button>
        <p class="eyebrow">IKARS · {{ kindLabel(form.kind) }}</p>
        <h2>{{ form.kind === 'in' ? t('stkIncome') : t('stkWriteOff') }}</h2>
        <label>{{ t('parts') }}
          <select v-model="form.article" @change="changeArticle">
            <option v-for="item in items" :key="item.article" :value="item.article">{{ item.name }} ({{ item.article }})</option>
          </select>
        </label>
        <label>{{ t('stkKind') }}
          <select v-model="form.kind">
            <option value="in">{{ t('stkKindIn') }}</option>
            <option value="out">{{ t('stkKindOut') }}</option>
            <option value="return">{{ t('stkKindReturn') }}</option>
            <option value="adjust">{{ t('stkKindAdjust') }}</option>
          </select>
        </label>
        <label>{{ t('quantity') }}<input v-model.number="form.qty" type="number" min="1" step="1"></label>
        <label>{{ t('stkBuyPrice') }}<input v-model="form.buyPrice" inputmode="decimal"></label>
        <label v-if="form.kind === 'in' || form.kind === 'return'">{{ t('stkSupplier') }}<input v-model="form.supplier" placeholder="Inter Cars"></label>
        <label v-if="form.kind === 'out'">{{ t('order') }}
          <select v-model="form.orderId">
            <option value="">{{ t('stkNoOrder') }}</option>
            <option v-for="order in orders" :key="order.id" :value="order.id">{{ order.id }} · {{ order.plate }}</option>
          </select>
        </label>
        <label>{{ t('master') }}
          <select v-model="form.master">
            <option value="">—</option>
            <option v-for="name in masters" :key="name" :value="name">{{ name }}</option>
          </select>
        </label>
        <label>{{ t('date') }}<input v-model="form.date" :placeholder="today"></label>
        <label class="wide">{{ t('calNote') }}<input v-model="form.note"></label>
        <p v-if="error" class="stk-error">⚠ {{ error }}</p>
        <div class="stk-form-actions">
          <button type="submit" class="primary">{{ t('maintSave') }}</button>
          <button type="button" class="secondary" @click="form = null">{{ t('maintCancel') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>
