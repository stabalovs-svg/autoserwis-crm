// Тексты напоминаний. У SMS лимит 70 знаков на кирилица, поэтому есть короткая версия,
// а для Viber / WhatsApp / e-mail — полная.
const TEMPLATES = {
  bg: {
    when: 'изтича {date}',
    whenOverdue: 'изтече на {date}',
    whenService: 'остават ~{km} km',
    slot: 'Час: {date} {time}',
    signature: '{workshop}, тел. {phone}',
    gti: 'ГТП {plate} {when}.',
    insurance: 'ГО {plate} {when}.',
    vignette: 'Винетка {plate} {when}.',
    service: 'ТО {plate}: {when}.',
    reactivation: 'Не сте идвали от {date}.',
    callNote: 'Обадете се предварително',
  },
  lv: {
    when: 'beidzas {date}',
    whenOverdue: 'beidzās {date}',
    whenService: '~{km} km',
    slot: 'Laiks: {date} {time}',
    signature: '{workshop}, tālr. {phone}',
    gti: 'TA {plate} {when}.',
    insurance: 'CTO {plate} {when}.',
    vignette: 'Vinjete {plate} {when}.',
    service: 'Apkope {plate}: {when}.',
    reactivation: 'Neesat bijis kopš {date}.',
    callNote: 'Piezvaniet iepriekš',
  },
  ru: {
    when: 'истекает {date}',
    whenOverdue: 'истёк {date}',
    whenService: 'осталось ~{km} км',
    slot: 'Час: {date} {time}',
    signature: '{workshop}, тел. {phone}',
    gti: 'Техосмотр {plate} {when}.',
    insurance: 'Страховка {plate} {when}.',
    vignette: 'Винетка {plate} {when}.',
    service: 'ТО {plate}: {when}.',
    reactivation: 'Вы не были у нас с {date}.',
    callNote: 'Позвонить заранее',
  },
  en: {
    when: 'expires {date}',
    whenOverdue: 'expired {date}',
    whenService: '~{km} km left',
    slot: 'Slot: {date} {time}',
    signature: '{workshop}, tel. {phone}',
    gti: 'Inspection {plate} {when}.',
    insurance: 'Insurance {plate} {when}.',
    vignette: 'Vignette {plate} {when}.',
    service: 'Service {plate}: {when}.',
    reactivation: 'No visit since {date}.',
    callNote: 'Call first',
  },
}

function fill(template, values) {
  return String(template || '').replace(/\{(\w+)\}/g, (match, key) => (values[key] === undefined ? '' : String(values[key])))
}

function shortDate(value) {
  const parts = String(value || '').split('.')
  return parts.length === 3 ? `${parts[0]}.${parts[1]}` : String(value || '')
}

// Собираем сообщение для конкретного напоминания.
export function buildMessage(row = {}, { lang = 'bg', workshop = '', workshopPhone = '', slot } = {}) {
  const pack = TEMPLATES[lang] || TEMPLATES.bg
  const when = row.state === 'overdue'
    ? fill(pack.whenOverdue, { date: shortDate(row.dueDate) })
    : row.kind === 'service'
      ? fill(pack.whenService, { km: row.kmLeft ?? 0 })
      : fill(pack.when, { date: shortDate(row.dueDate) })
  const place = row.plate || row.car || ''
  const line = fill(pack[row.kind] || pack.gti, { plate: place, when, date: row.dueDate })
  const slotLine = slot ? ` ${fill(pack.slot, { date: shortDate(slot.date), time: slot.start })}.` : ''
  const signature = fill(pack.signature, { workshop, phone: workshopPhone })
  return {
    short: `${line}${slotLine} ${workshopPhone}`.replace(/\s+/g, ' ').trim(),
    full: `${line}${slotLine} ${signature}`.replace(/\s+/g, ' ').trim(),
  }
}

export function templatePack(lang = 'bg') {
  return TEMPLATES[lang] || TEMPLATES.bg
}
