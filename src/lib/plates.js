// Pure helpers for photo recognition: they turn noisy OCR output into a plate or a VIN.
// No DOM here on purpose, so the logic stays unit-testable outside the browser.

// Bulgarian plates look like CA1234AB, Latvian ones like AB-1234.
const BG_PLATE = /\b([A-Z]{1,2})[- ]?(\d{4})[- ]?([A-Z]{2})\b/g
const LV_PLATE = /\b([A-Z]{2})[- ]?(\d{4})\b/g

export function normalizePlate(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

// Keeps the human shape of the plate so a card found by OCR matches the stored one.
export function plateKey(value) {
  return normalizePlate(value)
}

export function plateCandidates(raw) {
  const text = String(raw || '')
    .toUpperCase()
    .replace(/[^A-Z0-9-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const found = []
  const push = (value, country, digits) => {
    if (!found.some((item) => item.value === value)) found.push({ value, country, digits })
  }
  for (const match of text.matchAll(BG_PLATE)) push(`${match[1]}${match[2]}${match[3]}`, 'BG', 8)
  for (const match of text.matchAll(LV_PLATE)) push(`${match[1]}-${match[2]}`, 'LV', 7)
  return found
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
