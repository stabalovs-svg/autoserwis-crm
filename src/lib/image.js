// Client-side photo processing: a phone photo is compressed before it is stored,
// so a workshop with weak Wi-Fi can still upload quickly.
const FULL_SIDE = 1600
const THUMB_SIDE = 360

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => { URL.revokeObjectURL(url); resolve(image) }
    image.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable image')) }
    image.src = url
  })
}

function draw(image, maxSide, quality) {
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d').drawImage(image, 0, 0, width, height)
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality))
}

// Returns one record ready for IndexedDB: full frame + small thumbnail.
export async function makePhotoSet(file, vehicleKey, visitId, tag) {
  const image = await loadImage(file)
  const [full, thumb] = await Promise.all([draw(image, FULL_SIDE, 0.72), draw(image, THUMB_SIDE, 0.7)])
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    vehicleKey,
    visitId,
    tag,
    createdAt: new Date().toISOString(),
    bytes: full.size,
    width: image.width,
    height: image.height,
    full,
    thumb,
  }
}

export function formatBytes(bytes) {
  if (!bytes) return ''
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} kB`
}
