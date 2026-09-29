// Склад: приход, списание по наряду, история движений, себестоимость и маржа.
// Чистые функции — правила проверяются в Node.
export const MOVE_KINDS = ['in', 'out', 'return', 'adjust']

// Деньги округляем до копеек, иначе 0.1 + 0.2 «плывёт» в отчётах.
const round2 = (value) => Math.round((Number(value) || 0) * 100) / 100

// Остаток живёт в самом товаре (qty), а движения — это журнал: что пришло и куда ушло.
export function stockItem(items = [], article) {
  return items.find((item) => item.article === article) || null
}

export function stockValue(items = []) {
  const sum = items.reduce((acc, item) => ({
    buy: acc.buy + (Number(item.qty) || 0) * (Number(item.buy) || 0),
    sell: acc.sell + (Number(item.qty) || 0) * (Number(item.sell) || 0),
    units: acc.units + (Number(item.qty) || 0),
  }), { buy: 0, sell: 0, units: 0 })
  return { buy: round2(sum.buy), sell: round2(sum.sell), units: sum.units }
}

export function lowStockItems(items = []) {
  return items.filter((item) => Number(item.qty) <= Number(item.min))
}

export function nextMoveId(moves = []) {
  const highest = moves.reduce((max, move) => {
    const number = Number(String(move.id || '').replace(/[^0-9]/g, ''))
    return Number.isFinite(number) && number > max ? number : max
  }, 3000)
  return `SM-${highest + 1}`
}

// Перед списанием проверяем, что деталь есть в нужном количестве.
export function validateMove({ article, qty, kind } = {}, items = []) {
  const item = stockItem(items, article)
  if (!item) return { ok: false, error: 'unknownItem' }
  const amount = Number(qty) || 0
  if (amount <= 0) return { ok: false, error: 'badQty' }
  const outgoing = kind === 'out' || kind === 'return'
  if (outgoing && amount > (Number(item.qty) || 0)) {
    return { ok: false, error: 'shortage', available: Number(item.qty) || 0 }
  }
  return { ok: true, item }
}

// Новый остаток после движения: приход и возврат добавляют, списание вычитает,
// корректировка ставит фактическое количество.
export function nextQty(item = {}, move = {}) {
  const current = Number(item.qty) || 0
  const amount = Number(move.qty) || 0
  if (move.kind === 'in' || move.kind === 'return') return current + amount
  if (move.kind === 'out') return Math.max(0, current - amount)
  if (move.kind === 'adjust') return Math.max(0, amount)
  return current
}

export function applyMove(items = [], move = {}) {
  return items.map((item) => (item.article === move.article ? { ...item, qty: nextQty(item, move) } : item))
}

export function normalizeMove(input = {}) {
  const text = (value) => String(value === null || value === undefined ? '' : value).trim()
  const number = (value) => {
    const raw = String(value === null || value === undefined ? '' : value).replace(',', '.').replace(/[^0-9.-]/g, '')
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  const kind = MOVE_KINDS.includes(text(input.kind)) ? text(input.kind) : 'in'
  return {
    id: text(input.id),
    article: text(input.article).toUpperCase(),
    kind,
    qty: Math.abs(number(input.qty)),
    buyPrice: number(input.buyPrice),
    supplier: text(input.supplier),
    orderId: text(input.orderId),
    master: text(input.master),
    note: text(input.note),
    date: text(input.date),
  }
}

export function movesForArticle(moves = [], article) {
  return moves.filter((move) => move.article === article)
}

export function movesForOrder(moves = [], orderId) {
  return moves.filter((move) => move.orderId && move.orderId === orderId)
}

// Себестоимость запчастей, списанных на конкретный наряд.
export function orderCost(moves = [], orderId) {
  const sum = moves
    .filter((move) => move.orderId === orderId && move.kind === 'out')
    .reduce((total, move) => total + (Number(move.qty) || 0) * (Number(move.buyPrice) || 0), 0)
  return round2(sum)
}

// Сколько денег принёс и оставил наряд.
export function orderMargin(order = {}, moves = []) {
  const revenue = round2((Number(order.labor) || 0) + (Number(order.parts) || 0))
  const cost = orderCost(moves, order.id)
  const margin = round2(revenue - cost)
  return { revenue, cost, margin, percent: revenue ? Math.round((margin / revenue) * 100) : 0 }
}

// Маржа по машине: суммируем все её визиты и все списания на них.
export function vehicleMargin(visits = [], moves = []) {
  const ids = new Set(visits.map((visit) => visit.id))
  const revenue = round2(visits.reduce((total, visit) => total + (Number(visit.labor) || 0) + (Number(visit.parts) || 0), 0))
  const cost = round2(moves
    .filter((move) => move.kind === 'out' && ids.has(move.orderId))
    .reduce((total, move) => total + (Number(move.qty) || 0) * (Number(move.buyPrice) || 0), 0))
  const margin = round2(revenue - cost)
  return { revenue, cost, margin, percent: revenue ? Math.round((margin / revenue) * 100) : 0 }
}
