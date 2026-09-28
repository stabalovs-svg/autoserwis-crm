// Demo data stays language-neutral: the Latvian name of a work or a part is the key,
// and every UI language gets its own wording. Free text typed by a user is kept as is.
export const works = {
  'Bremžu diagnostika': { lv: 'Bremžu diagnostika', ru: 'Диагностика тормозов', en: 'Brake diagnostics', bg: 'Диагностика на спирачките' },
  'Eļļas un filtru maiņa': { lv: 'Eļļas un filtru maiņa', ru: 'Замена масла и фильтров', en: 'Oil and filter change', bg: 'Смяна на масло и филтри' },
  'Piekare · priekšējā ass': { lv: 'Piekare · priekšējā ass', ru: 'Подвеска · передняя ось', en: 'Suspension · front axle', bg: 'Окачване · преден мост' },
  'Kondicioniera apkope': { lv: 'Kondicioniera apkope', ru: 'Обслуживание кондиционера', en: 'Air conditioning service', bg: 'Обслужване на климатик' },
  'Riepu montāža · ziemas komplekts': { lv: 'Riepu montāža · ziemas komplekts', ru: 'Шиномонтаж · зимний комплект', en: 'Tyre fitting · winter set', bg: 'Монтаж на гуми · зимен комплект' },
  'Bremžu kluči · priekšā': { lv: 'Bremžu kluči · priekšā', ru: 'Тормозные колодки · передние', en: 'Brake pads · front', bg: 'Спирачни накладки · предни' },
  'Dzinēja diagnostika': { lv: 'Dzinēja diagnostika', ru: 'Диагностика двигателя', en: 'Engine diagnostics', bg: 'Диагностика на двигателя' },
  'Zobsiksnas maiņa': { lv: 'Zobsiksnas maiņa', ru: 'Замена ремня ГРМ', en: 'Timing belt replacement', bg: 'Смяна на ангренажен ремък' },
  'Vispārējā diagnostika': { lv: 'Vispārējā diagnostika', ru: 'Общая диагностика', en: 'General diagnostics', bg: 'Обща диагностика' },
  'Diagnostika': { lv: 'Diagnostika', ru: 'Диагностика', en: 'Diagnostics', bg: 'Диагностика' },
  'Eļļas maiņa': { lv: 'Eļļas maiņa', ru: 'Замена масла', en: 'Oil change', bg: 'Смяна на масло' },
  'Riepu montāža': { lv: 'Riepu montāža', ru: 'Шиномонтаж', en: 'Tyre fitting', bg: 'Монтаж на гуми' },
  'Bremžu kluči': { lv: 'Bremžu kluči', ru: 'Тормозные колодки', en: 'Brake pads', bg: 'Спирачни накладки' },
}

export const parts = {
  'Eļļas filtrs MANN': { lv: 'Eļļas filtrs MANN', ru: 'Масляный фильтр MANN', en: 'Oil filter MANN', bg: 'Маслен филтър MANN' },
  'Bremžu kluči Brembo': { lv: 'Bremžu kluči Brembo', ru: 'Тормозные колодки Brembo', en: 'Brake pads Brembo', bg: 'Спирачни накладки Brembo' },
  'Motoreļļa 5W-30 · 1L': { lv: 'Motoreļļa 5W-30 · 1L', ru: 'Моторное масло 5W-30 · 1 л', en: 'Engine oil 5W-30 · 1 L', bg: 'Моторно масло 5W-30 · 1 л' },
  'Gaisa filtrs Bosch': { lv: 'Gaisa filtrs Bosch', ru: 'Воздушный фильтр Bosch', en: 'Air filter Bosch', bg: 'Въздушен филтър Bosch' },
}

export function translateWork(value, lang) {
  return works[value]?.[lang] || value
}

export function translatePart(value, lang) {
  return parts[value]?.[lang] || value
}

// "12.05.2026 · Eļļas maiņa · €118" -> the work name follows the UI language.
export function translateHistoryLine(line, lang) {
  const chunks = String(line).split(' · ')
  if (chunks.length < 2) return translateWork(line, lang)
  return [chunks[0], translateWork(chunks[1], lang), ...chunks.slice(2)].join(' · ')
}

function reverseIndex(map) {
  const index = {}
  Object.entries(map).forEach(([key, variants]) => {
    Object.entries(variants).forEach(([, text]) => { index[text] = key })
  })
  return index
}

const workIndex = reverseIndex(works)
const partIndex = reverseIndex(parts)

// Recognises a work or a part typed in any language and stores the neutral key.
export function canonicalWork(value) {
  const text = String(value || '').trim()
  return workIndex[text] || text
}

export function canonicalPart(value) {
  const text = String(value || '').trim()
  return partIndex[text] || text
}
