// Photo recognition for the intake desk. Everything runs in the browser (Tesseract OCR +
// barcode reader), so the demo needs no API key and works offline after the first load.
// A paid engine can be switched on with VITE_ANPR_PROVIDER / VITE_ANPR_KEY, see scanPlateApi.
import { plateCandidates, vinCandidates, fixVinChars, matchKnownPlate } from './plates'

const PLATE_WHITELIST = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-'
const VIN_WHITELIST = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789'

const provider = String(import.meta.env?.VITE_ANPR_PROVIDER || 'local').toLowerCase()
const apiKey = String(import.meta.env?.VITE_ANPR_KEY || '')

let workerPromise = null
let logger = null

function ocrWorker(onProgress) {
  logger = onProgress || null
  if (!workerPromise) {
    workerPromise = import('tesseract.js').then(({ createWorker }) =>
      createWorker('eng', 1, {
        logger: (message) => {
          if (logger && message.status === 'recognizing text') logger(Math.round((message.progress || 0) * 100))
        },
      }),
    )
  }
  return workerPromise
}

export function engineName() {
  return provider !== 'local' && apiKey ? provider : 'local'
}

// Called when the intake screen opens: the OCR model (a few MB) is cached by the browser,
// so the first real scan of the day is much faster.
export function warmUp() {
  return ocrWorker(null).catch(() => null)
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable image')) }
    image.src = url
  })
}

// Перед OCR фото нужно подготовить: взять нужную часть кадра, дать мелкому тексту больше
// пикселей и мягко растянуть контраст. Жёсткая бинаризация ломает формы букв — убрана.
function softContrast(canvas) {
  const context = canvas.getContext('2d')
  const frame = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = frame.data
  const histogram = new Array(256).fill(0)
  for (let index = 0; index < pixels.length; index += 4) {
    const value = (0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2]) | 0
    pixels[index] = pixels[index + 1] = pixels[index + 2] = value
    histogram[value] += 1
  }
  // Границы берём по 2% и 98% перцентилю: тени и блики перестают «съедать» буквы.
  const total = pixels.length / 4
  const cut = Math.max(1, Math.round(total * 0.02))
  let acc = 0
  let low = 0
  let high = 255
  for (let value = 0; value < 256; value += 1) { acc += histogram[value]; if (acc >= cut) { low = value; break } }
  acc = 0
  for (let value = 255; value >= 0; value -= 1) { acc += histogram[value]; if (acc >= cut) { high = value; break } }
  const span = Math.max(24, high - low)
  const lut = new Uint8Array(256)
  for (let value = 0; value < 256; value += 1) lut[value] = Math.max(0, Math.min(255, Math.round(((value - low) / span) * 255)))
  for (let index = 0; index < pixels.length; index += 4) {
    const out = lut[pixels[index]]
    pixels[index] = pixels[index + 1] = pixels[index + 2] = out
  }
  context.putImageData(frame, 0, 0)
  return canvas
}

// targetSide — желаемый размер длинной стороны: мелкие фрагменты увеличиваем (до ×3),
// большие уменьшаем, чтобы OCR не захлёбывался.
function prepare(image, { targetSide = 1400, crop = [0, 0, 1, 1], contrast = true } = {}) {
  const [x0, y0, x1, y1] = crop
  const source = {
    x: Math.round(image.width * x0),
    y: Math.round(image.height * y0),
    w: Math.max(1, Math.round(image.width * (x1 - x0))),
    h: Math.max(1, Math.round(image.height * (y1 - y0))),
  }
  const longest = Math.max(source.w, source.h)
  const scale = Math.min(3, Math.max(0.15, targetSide / longest))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.w * scale))
  canvas.height = Math.max(1, Math.round(source.h * scale))
  const context = canvas.getContext('2d')
  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.drawImage(image, source.x, source.y, source.w, source.h, 0, 0, canvas.width, canvas.height)
  return contrast ? softContrast(canvas) : canvas
}

async function readText(worker, canvas, whitelist, psm) {
  await worker.setParameters({
    tessedit_char_whitelist: whitelist,
    tessedit_pageseg_mode: psm,
    // Без этого Tesseract сам угадывает разрешение («Estimating resolution as 147…»)
    // и портит сегментацию строк.
    user_defined_dpi: '300',
  })
  const { data } = await worker.recognize(canvas)
  return { text: String(data.text || '').trim(), confidence: Math.round(data.confidence || 0) }
}

// Штрихкод на VIN-наклейке — самый надёжный путь, поэтому перебираем масштабы,
// повороты и инверсию: снимок часто повёрнут или сделан на тёмной наклейке.
function rotateCanvas(source, degrees) {
  const canvas = document.createElement('canvas')
  const swap = degrees % 180 !== 0
  canvas.width = swap ? source.height : source.width
  canvas.height = swap ? source.width : source.height
  const context = canvas.getContext('2d')
  context.translate(canvas.width / 2, canvas.height / 2)
  context.rotate((degrees * Math.PI) / 180)
  context.drawImage(source, -source.width / 2, -source.height / 2)
  return canvas
}

function invertCanvas(source) {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  const context = canvas.getContext('2d')
  context.drawImage(source, 0, 0)
  const frame = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = frame.data
  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = 255 - pixels[index]
    pixels[index + 1] = 255 - pixels[index + 1]
    pixels[index + 2] = 255 - pixels[index + 2]
  }
  context.putImageData(frame, 0, 0)
  return canvas
}

async function readBarcode(file) {
  try {
    const [browser, zxing] = await Promise.all([
      import('@zxing/browser'),
      import('@zxing/library').catch(() => ({})),
    ])
    const hints = new Map()
    if (zxing.DecodeHintType && zxing.BarcodeFormat) {
      hints.set(zxing.DecodeHintType.TRY_HARDER, true)
      hints.set(zxing.DecodeHintType.POSSIBLE_FORMATS, [
        zxing.BarcodeFormat.CODE_39,
        zxing.BarcodeFormat.CODE_128,
        zxing.BarcodeFormat.QR_CODE,
        zxing.BarcodeFormat.DATA_MATRIX,
      ])
    }
    const reader = new browser.BrowserMultiFormatReader(hints)
    const image = await loadImage(file)
    const variants = []
    ;[1600, 2400].forEach((targetSide) => {
      const canvas = prepare(image, { targetSide, contrast: false })
      ;[0, 90, 180, 270].forEach((angle) => {
        const turned = angle ? rotateCanvas(canvas, angle) : canvas
        variants.push(turned, invertCanvas(turned))
      })
    })
    for (const variant of variants) {
      try {
        const result = reader.decodeFromCanvas(variant)
        const text = String(result?.getText?.() || '').trim()
        if (text) return text
      } catch { /* nothing found in this variant */ }
    }
    return ''
  } catch {
    return ''
  }
}

// Plate Recognizer style endpoint: switched on only when a key is provided.
async function scanPlateApi(file, onProgress) {
  const body = new FormData()
  body.append('upload', file)
  if (onProgress) onProgress(30)
  const response = await fetch('https://api.platerecognizer.com/v1/plate-reader/', {
    method: 'POST',
    headers: { Authorization: `Token ${apiKey}` },
    body,
  })
  if (onProgress) onProgress(100)
  if (!response.ok) return null
  const data = await response.json().catch(() => null)
  return (data?.results || []).map((row) => ({
    value: String(row.plate || '').toUpperCase(),
    country: String(row.region?.code || '').toUpperCase(),
    score: Number(row.score || 0),
  })).filter((item) => item.value)
}

// Зоны кадра, где обычно оказывается номер, и масштаб обработки для каждой.
const PLATE_PASSES = [
  { crop: [0.02, 0.55, 0.98, 0.99], psm: '7' },
  { crop: [0.12, 0.42, 0.88, 0.96], psm: '7' },
  { crop: [0.05, 0.30, 0.95, 0.95], psm: '7' },
  { crop: [0, 0, 1, 1], psm: '11' },
  { crop: [0.02, 0.55, 0.98, 0.99], psm: '7', targetSide: 2400 },
  { crop: [0.05, 0.30, 0.95, 0.95], psm: '7', targetSide: 2400 },
]

export async function scanPlate(file, onProgress, { knownPlates = [] } = {}) {
  if (engineName() !== 'local') {
    const rows = await scanPlateApi(file, onProgress)
    if (rows && rows.length) {
      return { kind: 'plate', value: rows[0].value, known: '', candidates: rows, confidence: Math.round((rows[0].score || 0) * 100), raw: '', engine: provider }
    }
  }
  const worker = await ocrWorker(onProgress)
  const image = await loadImage(file)
  const candidates = []
  let raw = ''
  let confidence = 0

  for (const pass of PLATE_PASSES) {
    const canvas = prepare(image, { crop: pass.crop, targetSide: pass.targetSide || 1400 })
    const result = await readText(worker, canvas, PLATE_WHITELIST, pass.psm)
    raw = raw ? raw + ' | ' + result.text : result.text
    if (result.confidence > confidence) confidence = result.confidence
    for (const found of plateCandidates(result.text)) {
      const known = matchKnownPlate(found.value, knownPlates)
      const existing = candidates.find((item) => item.value === found.value)
      if (existing) {
        existing.score = Math.max(existing.score || 0, result.confidence)
        if (known) existing.known = known.plate
      } else {
        candidates.push({ ...found, score: result.confidence, known: known ? known.plate : '' })
      }
    }
    // Хороший результат: номер узнали в базе или прочитали уверенно.
    if (candidates.some((item) => item.known) || candidates.some((item) => (item.score || 0) >= 55)) break
  }

  candidates.sort((a, b) => (b.known ? 1 : 0) - (a.known ? 1 : 0)
    || Number(b.strict) - Number(a.strict)
    || (b.score || 0) - (a.score || 0))
  const top = candidates[0] || null
  return {
    kind: 'plate',
    value: top ? (top.known || top.value) : '',
    rawValue: top ? top.value : '',
    known: top && top.known ? top.known : '',
    candidates,
    confidence,
    raw,
    engine: 'local',
  }
}

export async function scanVin(file, onProgress) {
  const barcode = await readBarcode(file)
  if (barcode) {
    const found = vinCandidates(barcode)
    if (found.length) {
      return { kind: 'vin', value: found[0], candidates: found.map((value) => ({ value })), confidence: 100, raw: barcode, source: 'barcode', engine: 'local' }
    }
  }
  if (onProgress) onProgress(5)
  const worker = await ocrWorker(onProgress)
  const image = await loadImage(file)
  // VIN напечатан мелко: даём ему больше пикселей и пробуем и строку, и разреженный текст.
  const passes = [
    { crop: [0, 0, 1, 1], targetSide: 2000, psm: '7' },
    { crop: [0, 0, 0.62, 1], targetSide: 2400, psm: '7' },
    { crop: [0, 0, 1, 1], targetSide: 2600, psm: '11' },
  ]
  const candidates = []
  let raw = ''
  let confidence = 0
  for (const pass of passes) {
    const canvas = prepare(image, { crop: pass.crop, targetSide: pass.targetSide })
    const result = await readText(worker, canvas, VIN_WHITELIST, pass.psm)
    raw = raw ? raw + ' | ' + result.text : result.text
    if (result.confidence > confidence) confidence = result.confidence
    for (const value of vinCandidates(result.text)) {
      if (!candidates.includes(value)) candidates.push(value)
    }
    if (candidates.length) break
  }
  return {
    kind: 'vin',
    value: candidates[0] || '',
    candidates: candidates.map((value) => ({ value })),
    confidence,
    raw: fixVinChars(raw),
    source: 'ocr',
    engine: 'local',
  }
}
