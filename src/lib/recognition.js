// Photo recognition for the intake desk. Everything runs in the browser (Tesseract OCR +
// barcode reader), so the demo needs no API key and works offline after the first load.
// A paid engine can be switched on with VITE_ANPR_PROVIDER / VITE_ANPR_KEY, see scanPlateApi.
import { plateCandidates, vinCandidates, fixVinChars } from './plates'

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

// A phone photo is scaled down, cropped to the interesting part and stretched in contrast,
// which is what makes plain OCR usable on a number plate.
function prepare(image, { maxSide = 1400, crop = [0, 0, 1, 1], gray = true } = {}) {
  const [x0, y0, x1, y1] = crop
  const source = {
    x: Math.round(image.width * x0),
    y: Math.round(image.height * y0),
    w: Math.max(1, Math.round(image.width * (x1 - x0))),
    h: Math.max(1, Math.round(image.height * (y1 - y0))),
  }
  const scale = Math.min(1, maxSide / Math.max(source.w, source.h))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(source.w * scale))
  canvas.height = Math.max(1, Math.round(source.h * scale))
  const context = canvas.getContext('2d')
  context.drawImage(image, source.x, source.y, source.w, source.h, 0, 0, canvas.width, canvas.height)

  if (!gray) return canvas
  const frame = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = frame.data
  let min = 255
  let max = 0
  for (let index = 0; index < pixels.length; index += 4) {
    const value = 0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2]
    pixels[index] = pixels[index + 1] = pixels[index + 2] = value
    if (value < min) min = value
    if (value > max) max = value
  }
  const span = Math.max(1, max - min)
  for (let index = 0; index < pixels.length; index += 4) {
    const stretched = ((pixels[index] - min) / span) * 255
    pixels[index] = pixels[index + 1] = pixels[index + 2] = stretched < 110 ? 0 : stretched > 190 ? 255 : stretched
  }
  context.putImageData(frame, 0, 0)
  return canvas
}

async function readText(worker, canvas, whitelist, psm) {
  await worker.setParameters({ tessedit_char_whitelist: whitelist, tessedit_pageseg_mode: psm })
  const { data } = await worker.recognize(canvas)
  return { text: String(data.text || '').trim(), confidence: Math.round(data.confidence || 0) }
}

async function readBarcode(file) {
  try {
    const { BrowserMultiFormatReader } = await import('@zxing/browser')
    const url = URL.createObjectURL(file)
    try {
      const result = await new BrowserMultiFormatReader().decodeFromImageUrl(url)
      return String(result?.getText?.() || '').trim()
    } finally {
      URL.revokeObjectURL(url)
    }
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

export async function scanPlate(file, onProgress) {
  if (engineName() !== 'local') {
    const rows = await scanPlateApi(file, onProgress)
    if (rows && rows.length) {
      return { kind: 'plate', value: rows[0].value, candidates: rows, confidence: Math.round((rows[0].score || 0) * 100), raw: '', engine: provider }
    }
  }
  const worker = await ocrWorker(onProgress)
  const image = await loadImage(file)
  const passes = [
    { psm: '11', canvas: prepare(image) },
    { psm: '7', canvas: prepare(image, { crop: [0.03, 0.35, 0.97, 0.98] }) },
    { psm: '7', canvas: prepare(image, { crop: [0.1, 0.12, 0.9, 0.88] }) },
  ]
  const candidates = []
  let raw = ''
  let confidence = 0
  for (const pass of passes) {
    const result = await readText(worker, pass.canvas, PLATE_WHITELIST, pass.psm)
    raw = raw ? `${raw} ${result.text}` : result.text
    if (result.confidence > confidence) confidence = result.confidence
    for (const found of plateCandidates(result.text)) {
      if (!candidates.some((item) => item.value === found.value)) candidates.push({ ...found, score: result.confidence })
    }
    if (candidates.length && confidence >= 60) break
  }
  return { kind: 'plate', value: candidates[0]?.value || '', candidates, confidence, raw, engine: 'local' }
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
  const passes = [
    prepare(image, { maxSide: 1500 }),
    prepare(image, { maxSide: 1500, crop: [0, 0, 0.55, 1] }),
  ]
  const candidates = []
  let raw = ''
  let confidence = 0
  for (const pass of passes) {
    const result = await readText(worker, pass, VIN_WHITELIST, '7')
    raw = raw ? `${raw} ${result.text}` : result.text
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
