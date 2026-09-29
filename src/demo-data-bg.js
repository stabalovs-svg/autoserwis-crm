// Bulgarian demo set: the same story as the Latvian one, told for a Bulgarian workshop
// (Sofia / Plovdiv / Varna plates, local client names, prices in euro, VINs that real cars carry).
// Work and part names stay as catalogue keys (see lib/catalog.js) so they show in the UI language.
import { inventory } from './demo-data'

export const initialOrders = [
  { id: 'WO-2048', date: '30.08.2026', time: '09:00', client: 'Димитър Петров', phone: '+359 88 642 1180', car: 'Škoda Octavia', plate: 'CA 1842 AB', vin: 'TMBJF7NE0F0123456', mileage: 214500, service: 'Bremžu diagnostika', master: 'Николай', status: 'work', labor: 85, parts: 124, paid: false },
  { id: 'WO-2047', date: '30.08.2026', time: '10:30', client: 'Мария Георгиева', phone: '+359 87 315 4477', car: 'Toyota Corolla', plate: 'CB 7788 MT', vin: 'SB1KD3LE20E123456', mileage: 168900, service: 'Eļļas un filtru maiņa', master: 'Стоян', status: 'ready', labor: 45, parts: 68, paid: false },
  { id: 'WO-2046', date: '30.08.2026', time: '12:00', client: 'Георги Иванов', phone: '+359 88 903 2210', car: 'VW Passat', plate: 'PB 5200 XA', vin: 'WVWZZZ3CZFE123456', mileage: 302100, service: 'Piekare · priekšējā ass', master: 'Николай', status: 'waiting', labor: 110, parts: 236, paid: false },
  { id: 'WO-2045', date: '29.08.2026', time: '15:30', client: 'Елена Тодорова', phone: '+359 89 744 5120', car: 'Dacia Duster', plate: 'B 1901 CH', vin: 'UU1HSDCEG12345678', mileage: 121400, service: 'Kondicioniera apkope', master: 'Стоян', status: 'done', labor: 55, parts: 24, paid: true },

  // History of the same cars — so the vehicle card shows a real timeline.
  { id: 'WO-2041', date: '12.05.2026', time: '09:30', client: 'Димитър Петров', phone: '+359 88 642 1180', car: 'Škoda Octavia', plate: 'CA 1842 AB', vin: 'TMBJF7NE0F0123456', mileage: 208300, service: 'Eļļas un filtru maiņa', master: 'Стоян', status: 'done', labor: 45, parts: 73, paid: true },
  { id: 'WO-2033', date: '03.02.2026', time: '14:00', client: 'Димитър Петров', phone: '+359 88 642 1180', car: 'Škoda Octavia', plate: 'CA 1842 AB', vin: 'TMBJF7NE0F0123456', mileage: 199800, service: 'Riepu montāža · ziemas komplekts', master: 'Николай', status: 'done', labor: 40, parts: 24, paid: true },
  { id: 'WO-2039', date: '18.06.2026', time: '11:00', client: 'Мария Георгиева', phone: '+359 87 315 4477', car: 'Toyota Corolla', plate: 'CB 7788 MT', vin: 'SB1KD3LE20E123456', mileage: 164200, service: 'Bremžu kluči · priekšā', master: 'Николай', status: 'done', labor: 70, parts: 166, paid: true },
  { id: 'WO-2031', date: '21.03.2026', time: '10:00', client: 'Мария Георгиева', phone: '+359 87 315 4477', car: 'Toyota Corolla', plate: 'CB 7788 MT', vin: 'SB1KD3LE20E123456', mileage: 158000, service: 'Dzinēja diagnostika', master: 'Стоян', status: 'done', labor: 45, parts: 0, paid: true },
  { id: 'WO-2037', date: '09.04.2026', time: '08:30', client: 'Георги Иванов', phone: '+359 88 903 2210', car: 'VW Passat', plate: 'PB 5200 XA', vin: 'WVWZZZ3CZFE123456', mileage: 294700, service: 'Zobsiksnas maiņa', master: 'Николай', status: 'done', labor: 180, parts: 222, paid: true },
  { id: 'WO-2029', date: '17.01.2026', time: '13:00', client: 'Георги Иванов', phone: '+359 88 903 2210', car: 'VW Passat', plate: 'PB 5200 XA', vin: 'WVWZZZ3CZFE123456', mileage: 288900, service: 'Vispārējā diagnostika', master: 'Стоян', status: 'done', labor: 45, parts: 0, paid: true },
  { id: 'WO-2043', date: '07.07.2026', time: '16:00', client: 'Елена Тодорова', phone: '+359 89 744 5120', car: 'Dacia Duster', plate: 'B 1901 CH', vin: 'UU1HSDCEG12345678', mileage: 117900, service: 'Eļļas un filtru maiņa', master: 'Стоян', status: 'done', labor: 45, parts: 81, paid: true },
]

export const clients = [
  { name: 'Димитър Петров', phone: '+359 88 642 1180', car: 'Škoda Octavia', plate: 'CA 1842 AB', vin: 'TMBJF7NE0F0123456', visits: 4, spent: 746, debt: 209, history: ['12.05.2026 · Eļļas maiņa · €118', '03.02.2026 · Riepu montāža · €64'] },
  { name: 'Мария Георгиева', phone: '+359 87 315 4477', car: 'Toyota Corolla', plate: 'CB 7788 MT', vin: 'SB1KD3LE20E123456', visits: 7, spent: 1284, debt: 113, history: ['18.06.2026 · Bremžu kluči · €236', '21.03.2026 · Diagnostika · €45'] },
  { name: 'Георги Иванов', phone: '+359 88 903 2210', car: 'VW Passat', plate: 'PB 5200 XA', vin: 'WVWZZZ3CZFE123456', visits: 3, spent: 512, debt: 346, history: ['09.04.2026 · Zobsiksnas maiņa · €402', '17.01.2026 · Diagnostika · €45'] },
  { name: 'Елена Тодорова', phone: '+359 89 744 5120', car: 'Dacia Duster', plate: 'B 1901 CH', vin: 'UU1HSDCEG12345678', visits: 5, spent: 935, debt: 0, history: ['29.08.2026 · Kondicioniera apkope · €79', '07.07.2026 · Eļļas maiņa · €126'] },
]

export { inventory }

export const dataset = {
  code: 'bg',
  shopLine: 'София · Демо автосервис',
  initialOrders,
  clients,
  inventory,
  masters: ['Николай', 'Стоян'],
  newClient: { name: 'Иван Петров', car: 'Audi A4', plate: 'CA 1234 AB' },
  newPhone: '+359 88 000 0000',
  orderBase: 2048,
  logs: [
    { time: '10:18', type: 'status', id: 'WO-2047', status: 'ready' },
    { time: '09:42', type: 'diagnostic', id: 'WO-2048' },
    { time: '09:05', type: 'created', id: 'WO-2046' },
    { time: '08:51', type: 'reserved', id: 'BP-881', quantity: 1 },
  ],
}
