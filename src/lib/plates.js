// Pure helpers for photo recognition: they turn noisy OCR output into a plate or a VIN.
// No DOM here on purpose, so the logic stays unit-testable outside the browser.

// Что OCR реально путает на номерах (и в какую сторону это исправляется).
const DIGIT_OF = { O: '0', Q: '0', I: '1', L: '1', Z: '2', S: '5', B: '8' }
const LETTER_OF = { 0: 'O', 1: 'I', 2: 'Z', 5: 'S', 8: 'B' }

export function normalizePlate(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

// Keeps the human shape of the plate so a card found by OCR matches the stored one.
export function plateKey(value) {
  return normalizePlate(value)
}

const BG_LETTERS = 'ABCEHKMOPTX'
const BG_LETTER_FIX = { R: 'B', D: 'O', U: 'O', Q: 'O', V: 'X', W: 'X', Y: 'X', Z: 'X', F: 'E', G: 'C', I: 'H', J: 'H', L: 'E', N: 'H', S: 'B' }

// Приводим прочитанное к маске: L = буква, d = цифра. strict = без подмен символов.
function toMask(clean, mask, letters) {
  if (clean.length !== mask.length) return null
  let out = ''
  let strict = true
  for (let index = 0; index < mask.length; index += 1) {
    const char = clean[index]
    if (mask[index] === 'L') {
      if (/[A-Z]/.test(char)) {
        if (letters && !letters.includes(char)) {
          const fixed = BG_LETTER_FIX[char]
          if (!fixed) return null
          out += fixed
          strict = false
          continue
        }
        out += char
      } else if (LETTER_OF[char]) { out += LETTER_OF[char]; strict = false }
      else return null
    } else if (/[0-9]/.test(char)) out += char
    else if (DIGIT_OF[char]) { out += DIGIT_OF[char]; strict = false }
    else return null
  }
  return { value: out, strict }
}

// Болгарские номера: CA 1842 AB (1–2 буквы, 4 цифры, 2 буквы), латвийские: AB-1842.
const MASKS = [
  { mask: 'LLddddLL', country: 'BG', letters: BG_LETTERS, format: (value) => `${value.slice(0, 2)} ${value.slice(2, 6)} ${value.slice(6)}` },
  { mask: 'LddddLL', country: 'BG', letters: BG_LETTERS, format: (value) => `${value[0]} ${value.slice(1, 5)} ${value.slice(5)}` },
  { mask: 'LLdddd', country: 'LV', format: (value) => `${value.slice(0, 2)}-${value.slice(2)}` },
  { mask: 'LLLdddd', country: 'LV', format: (value) => `${value.slice(0, 3)}-${value.slice(3)}` },
]

// Ищем номера в «склеенном» тексте: окно длиной с маску скользит по строке,
// поэтому лишний символ рядом («CA184248») больше не ломает распознавание.
export function plateCandidates(raw) {
  const text = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
  const hits = []
  MASKS.forEach(({ mask, country, format, letters }) => {
    for (let start = 0; start + mask.length <= text.length; start += 1) {
      const shaped = toMask(text.slice(start, start + mask.length), mask, letters)
      if (!shaped) continue
      hits.push({
        value: format(shaped.value),
        country,
        start,
        end: start + mask.length,
        length: mask.length,
        strict: shaped.strict,
      })
    }
  })
  // Сначала совпадения без подмен (они надёжнее), затем более длинные; перекрывающиеся
  // отбрасываем, чтобы «CA1842AB» не превращался ещё и в «CA-1842».
  // Сначала самые длинные совпадения: полный болгарский номер важнее его усечённого начала.
  hits.sort((a, b) => b.length - a.length || Number(b.strict) - Number(a.strict) || a.start - b.start)
  const found = []
  hits.forEach((hit) => {
    if (found.some((item) => hit.start < item.end && item.start < hit.end)) return
    if (found.some((item) => item.value === hit.value)) return
    found.push(hit)
  })
  return found.map((hit) => ({ value: hit.value, country: hit.country, strict: hit.strict }))
}

function distance(a, b) {
  const left = String(a || '')
  const right = String(b || '')
  const cols = right.length + 1
  let previous = Array.from({ length: cols }, (_, index) => index)
  for (let row = 1; row <= left.length; row += 1) {
    const current = [row]
    for (let col = 1; col < cols; col += 1) {
      const cost = left[row - 1] === right[col - 1] ? 0 : 1
      current[col] = Math.min(previous[col] + 1, current[col - 1] + 1, previous[col - 1] + cost)
    }
    previous = current
  }
  return previous[cols - 1]
}

// Самое полезное для мастера: если в базе есть похожий номер, предлагаем именно его.
export function matchKnownPlate(value, knownPlates = []) {
  const clean = normalizePlate(value)
  if (!clean) return null
  let best = null
  let tie = false
  knownPlates.forEach((plate) => {
    const candidate = normalizePlate(plate)
    if (!candidate) return
    const delta = distance(clean, candidate)
    if (!best || delta < best.distance) {
      best = { plate, distance: delta, exact: delta === 0 }
      tie = false
    } else if (delta === best.distance) {
      tie = true
    }
  })
  if (!best) return null
  // При нескольких одинаково похожих номерах лучше промолчать, чем предложить не тот.
  if (tie && best.distance > 0) return null
  const allowed = Math.max(1, Math.min(2, Math.round(normalizePlate(best.plate).length / 5)))
  return best.distance <= allowed ? best : null
}

const VIN_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2]
const VIN_VALUES = { A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, J: 1, K: 2, L: 3, M: 4, N: 5, P: 7, R: 9, S: 2, T: 3, U: 4, V: 5, W: 6, X: 7, Y: 8, Z: 9 }

export function vinChecksumOk(vin) {
  const value = String(vin || '').toUpperCase()
  if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(value)) return false
  let sum = 0
  for (let index = 0; index < 17; index += 1) {
    const char = value[index]
    const number = /\d/.test(char) ? Number(char) : VIN_VALUES[char]
    if (number === undefined) return false
    sum += number * VIN_WEIGHTS[index]
  }
  const rest = sum % 11
  return value[8] === (rest === 10 ? 'X' : String(rest))
}

// OCR mixes up letters and digits on a VIN plate: I is never used, O and Q are not used either.
export function fixVinChars(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/[IOQ]/g, (char) => (char === 'I' ? '1' : '0'))
}

export function vinCandidates(raw) {
  const cleaned = fixVinChars(raw)
  const exact = []
  const loose = []
  for (let index = 0; index + 17 <= cleaned.length; index += 1) {
    const window = cleaned.slice(index, index + 17)
    if (!/^[A-HJ-NPR-Z0-9]{17}$/.test(window)) continue
    if (loose.includes(window)) continue
    if (vinChecksumOk(window)) exact.push(window)
    else loose.push(window)
  }
  return [...exact, ...loose]
}
