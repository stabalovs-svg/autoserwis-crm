// A vehicle is derived from work orders: same VIN (preferred) or same plate = one car.
export function vehicleKey(order) {
  const vin = String(order?.vin || '').trim().toUpperCase()
  if (vin) return `vin:${vin}`
  return `plate:${String(order?.plate || '').trim().toUpperCase()}`
}

export function isValidVin(value) {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(String(value || '').trim().toUpperCase())
}

export function dateValue(date) {
  const parts = String(date || '').split('.')
  if (parts.length !== 3) return 0
  const [day, month, year] = parts
  const time = new Date(`${year}-${month}-${day}T12:00:00`).getTime()
  return Number.isNaN(time) ? 0 : time
}

const money = (order) => Number(order.labor || 0) + Number(order.parts || 0)

export function groupVehicles(orders) {
  const map = new Map()
  for (const order of orders) {
    const key = vehicleKey(order)
    if (!map.has(key)) {
      map.set(key, {
        key,
        vin: '',
        plate: '',
        car: '',
        client: '',
        phone: '',
        visits: [],
      })
    }
    const vehicle = map.get(key)
    vehicle.visits.push(order)
    if (order.vin) vehicle.vin = String(order.vin).toUpperCase()
    if (order.plate) vehicle.plate = order.plate
    if (order.car) vehicle.car = order.car
    if (order.client) vehicle.client = order.client
    if (order.phone) vehicle.phone = order.phone
  }

  const vehicles = [...map.values()].map((vehicle) => {
    const visits = [...vehicle.visits].sort((a, b) => dateValue(b.date) - dateValue(a.date))
    const mileages = visits
      .map((visit) => ({ visit, value: Number(visit.mileage) || 0 }))
      .filter((item) => item.value > 0)
      .sort((a, b) => dateValue(a.visit.date) - dateValue(b.visit.date))
    const last = mileages[mileages.length - 1]
    const previous = mileages[mileages.length - 2]
    const total = visits.reduce((sum, visit) => sum + money(visit), 0)
    const paid = visits.filter((visit) => visit.paid).reduce((sum, visit) => sum + money(visit), 0)

    return {
      ...vehicle,
      visits,
      lastVisit: visits[0] || null,
      total,
      paid,
      debt: total - paid,
      open: visits.filter((visit) => visit.status !== 'done').length,
      mileage: last ? last.value : null,
      mileagePrevious: previous ? previous.value : null,
      mileageDelta: last && previous ? last.value - previous.value : null,
    }
  })

  return vehicles.sort((a, b) => dateValue(b.lastVisit?.date) - dateValue(a.lastVisit?.date))
}

export function searchVehicles(vehicles, query) {
  const needle = String(query || '').trim().toUpperCase()
  if (!needle) return vehicles
  return vehicles.filter((vehicle) =>
    [vehicle.plate, vehicle.vin, vehicle.car, vehicle.client, vehicle.phone]
      .some((value) => String(value || '').toUpperCase().includes(needle)))
}

export function formatMileage(value) {
  if (value === null || value === undefined || value === '') return '—'
  return `${Number(value).toLocaleString('lv-LV')} km`
}

// Free VIN decoder (NHTSA vPIC). Returns null when the VIN is unknown or offline.
export async function decodeVin(vin) {
  if (!isValidVin(vin)) return null
  const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${encodeURIComponent(vin.trim().toUpperCase())}?format=json`)
  if (!response.ok) return null
  const data = await response.json().catch(() => null)
  const row = data?.Results?.[0]
  if (!row || !row.Make) return null
  const title = [row.Make, row.Model, row.ModelYear].filter(Boolean).join(' ')
  return {
    make: row.Make || '',
    model: row.Model || '',
    year: row.ModelYear || '',
    car: title.trim(),
    engine: [row.DisplacementL ? `${Number(row.DisplacementL).toFixed(1)} L` : '', row.FuelTypePrimary || '', row.EngineCylinders ? `${row.EngineCylinders} cyl` : ''].filter(Boolean).join(' · '),
  }
}
