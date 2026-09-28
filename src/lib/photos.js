// Photos live in IndexedDB (not localStorage) — they are binary and can be large.
const DB_NAME = 'ikars-autoservice-demo'
const DB_VERSION = 1
const STORE = 'photos'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'id' })
        store.createIndex('vehicle', 'vehicleKey')
        store.createIndex('visit', 'visitId')
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function toPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function savePhoto(record) {
  const db = await openDb()
  try {
    await toPromise(db.transaction(STORE, 'readwrite').objectStore(STORE).put(record))
  } finally {
    db.close()
  }
  return record
}

export async function photosForVehicle(vehicleKey) {
  const db = await openDb()
  try {
    return await toPromise(db.transaction(STORE, 'readonly').objectStore(STORE).index('vehicle').getAll(vehicleKey))
  } finally {
    db.close()
  }
}

export async function photosForVisit(visitId) {
  const db = await openDb()
  try {
    return await toPromise(db.transaction(STORE, 'readonly').objectStore(STORE).index('visit').getAll(visitId))
  } finally {
    db.close()
  }
}

export async function allPhotos() {
  const db = await openDb()
  try {
    return await toPromise(db.transaction(STORE, 'readonly').objectStore(STORE).getAll())
  } finally {
    db.close()
  }
}

export async function deletePhoto(id) {
  const db = await openDb()
  try {
    await toPromise(db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id))
  } finally {
    db.close()
  }
}

export async function clearPhotos() {
  const db = await openDb()
  try {
    await toPromise(db.transaction(STORE, 'readwrite').objectStore(STORE).clear())
  } finally {
    db.close()
  }
}
