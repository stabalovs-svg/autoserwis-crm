// Bulgarian demo set: the same story as the Latvian one, told for a Bulgarian workshop
// (Sofia / Plovdiv / Varna plates, local client names, prices in euro, VINs that real cars carry).
// Work and part names stay as catalogue keys (see lib/catalog.js) so they show in the UI language.
import { inventory } from './demo-data'

export const initialOrders = [
  { id: 'WO-2048', date: '30.09.2026', time: '09:00', client: 'Димитър Петров', phone: '+359 88 642 1180', car: 'Škoda Octavia', plate: 'CA 1842 AB', vin: 'TMBJF7NE0F0123456', mileage: 214500, service: 'Bremžu diagnostika', master: 'Николай', status: 'work', labor: 85, parts: 124, paid: false },
  { id: 'WO-2047', date: '30.09.2026', time: '10:30', client: 'Мария Георгиева', phone: '+359 87 315 4477', car: 'Toyota Corolla', plate: 'CB 7788 MT', vin: 'SB1KD3LE20E123456', mileage: 168900, service: 'Eļļas un filtru maiņa', master: 'Стоян', status: 'ready', labor: 45, parts: 68, paid: false },
  { id: 'WO-2046', date: '30.09.2026', time: '12:00', client: 'Георги Иванов', phone: '+359 88 903 2210', car: 'VW Passat', plate: 'PB 5200 XA', vin: 'WVWZZZ3CZFE123456', mileage: 302100, service: 'Piekare · priekšējā ass', master: 'Николай', status: 'waiting', labor: 110, parts: 236, paid: false },
  { id: 'WO-2045', date: '29.09.2026', time: '15:30', client: 'Елена Тодорова', phone: '+359 89 744 5120', car: 'Dacia Duster', plate: 'B 1901 CH', vin: 'UU1HSDCEG12345678', mileage: 121400, service: 'Kondicioniera apkope', master: 'Стоян', status: 'done', labor: 55, parts: 24, paid: true },

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
  { name: 'Елена Тодорова', phone: '+359 89 744 5120', car: 'Dacia Duster', plate: 'B 1901 CH', vin: 'UU1HSDCEG12345678', visits: 5, spent: 935, debt: 0, history: ['29.09.2026 · Kondicioniera apkope · €79', '07.07.2026 · Eļļas maiņa · €126'] },
]

export { inventory }

export const dataset = {
  code: 'bg',
  shopLine: 'София · Демо автосервис',
  initialOrders,
  clients,
  inventory,
  // График приёма: линия ГТП, два канала, шиномонтаж. Меняется одной строкой.
  shop: {
    openHours: { weekday: ['08:00', '18:00'], saturday: ['08:00', '14:00'] },
    slotMinutes: 30,
    resources: ['gti', 'bay1', 'bay2', 'tyres'],
    types: { gti: 30, service: 90, diagnostics: 45, repair: 120, tyres: 60 },
  },
  bookings: [
    // Сряда, 30.09.2026 — днешният график.
    { id: 'BK-3041', date: '30.09.2026', start: '08:00', minutes: 60, resource: 'tyres', type: 'tyres', master: 'Стоян', plate: 'PB 5200 XA', car: 'VW Passat', client: 'Георги Иванов', phone: '+359 88 903 2210', vin: 'WVWZZZ3CZFE123456', status: 'done', note: 'Летни гуми' },
    { id: 'BK-3042', date: '30.09.2026', start: '08:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Николай', plate: 'CA 1842 AB', car: 'Škoda Octavia', client: 'Димитър Петров', phone: '+359 88 642 1180', vin: 'TMBJF7NE0F0123456', status: 'arrived', note: 'ГО е изтекла — да плати преди прегледа', orderId: 'WO-2048' },
    { id: 'BK-3043', date: '30.09.2026', start: '09:00', minutes: 90, resource: 'bay2', type: 'service', master: 'Стоян', plate: 'CB 7788 MT', car: 'Toyota Corolla', client: 'Мария Георгиева', phone: '+359 87 315 4477', vin: 'SB1KD3LE20E123456', status: 'inWork', note: 'ТО + филтри' },
    { id: 'BK-3044', date: '30.09.2026', start: '09:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Николай', plate: 'PB 4412 CA', car: 'Peugeot 308', client: 'Иванка Стоянова', phone: '+359 88 220 7741', status: 'confirmed', note: 'Нов клиент, пита за цена' },
    { id: 'BK-3045', date: '30.09.2026', start: '10:00', minutes: 120, resource: 'bay1', type: 'repair', master: 'Николай', plate: 'B 6620 KH', car: 'Ford Focus', client: 'Румен Динев', phone: '+359 89 115 3390', status: 'confirmed', note: 'Спирачки, частите са налични' },
    { id: 'BK-3046', date: '30.09.2026', start: '10:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Стоян', plate: 'CB 7788 MT', car: 'Toyota Corolla', client: 'Мария Георгиева', phone: '+359 87 315 4477', status: 'confirmed' },
    { id: 'BK-3047', date: '30.09.2026', start: '11:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Николай', plate: 'CA 9081 BT', car: 'Opel Astra', client: 'Петър Маринов', phone: '+359 87 664 2019', status: 'confirmed' },
    { id: 'BK-3048', date: '30.09.2026', start: '13:00', minutes: 45, resource: 'bay1', type: 'diagnostics', master: 'Николай', plate: 'B 1901 CH', car: 'Dacia Duster', client: 'Елена Тодорова', phone: '+359 89 744 5120', vin: 'UU1HSDCEG12345678', status: 'confirmed', note: 'ГТП е изтекъл — да се коментира' },
    { id: 'BK-3049', date: '30.09.2026', start: '13:00', minutes: 30, resource: 'gti', type: 'gti', master: 'Стоян', plate: 'PB 7745 KH', car: 'Renault Clio', client: 'Николай Колев', phone: '+359 88 501 8834', status: 'confirmed' },
    { id: 'BK-3050', date: '30.09.2026', start: '14:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Николай', plate: 'CA 3311 MK', car: 'Hyundai i30', client: 'Светла Димитрова', phone: '+359 87 218 4470', status: 'confirmed' },
    { id: 'BK-3051', date: '30.09.2026', start: '15:00', minutes: 90, resource: 'bay2', type: 'service', master: 'Стоян', plate: 'B 4478 CT', car: 'Kia Sportage', client: 'Тодор Ангелов', phone: '+359 88 776 1122', status: 'confirmed', note: 'ТО преди зимата' },
    { id: 'BK-3052', date: '30.09.2026', start: '16:00', minutes: 30, resource: 'gti', type: 'gti', master: 'Николай', plate: 'CA 1180 TP', car: 'VW Polo', client: 'Яна Кирилова', phone: '+359 89 330 5566', status: 'confirmed' },
    // Останалите дни от седмицата — за да се вижда заетостта и свободните прозорци.
    { id: 'BK-3031', date: '28.09.2026', start: '09:00', minutes: 30, resource: 'gti', type: 'gti', master: 'Николай', plate: 'CA 5540 EA', car: 'Seat Ibiza', client: 'Милен Дяков', phone: '+359 88 401 9932', status: 'done' },
    { id: 'BK-3032', date: '28.09.2026', start: '10:30', minutes: 120, resource: 'bay1', type: 'repair', master: 'Стоян', plate: 'PB 2299 MP', car: 'BMW 320d', client: 'Красимир Илиев', phone: '+359 87 990 2214', status: 'done' },
    { id: 'BK-3033', date: '29.09.2026', start: '08:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Николай', plate: 'CB 6655 HK', car: 'Honda Civic', client: 'Даниела Петкова', phone: '+359 88 512 7744', status: 'noShow', note: 'Не дойде, да се обадим' },
    { id: 'BK-3034', date: '29.09.2026', start: '10:00', minutes: 90, resource: 'bay2', type: 'service', master: 'Стоян', plate: 'CA 7712 CB', car: 'Škoda Superb', client: 'Антон Василев', phone: '+359 89 664 1108', status: 'done' },
    { id: 'BK-3035', date: '29.09.2026', start: '13:00', minutes: 60, resource: 'tyres', type: 'tyres', master: 'Стоян', plate: 'B 8890 PA', car: 'Dacia Sandero', client: 'Радка Тонева', phone: '+359 87 445 3321', status: 'cancelled', note: 'Отмени, ще звънне' },
    { id: 'BK-3036', date: '01.10.2026', start: '09:00', minutes: 30, resource: 'gti', type: 'gti', master: 'Николай', plate: 'CA 2201 AB', car: 'Fiat Tipo', client: 'Габриела Стоилова', phone: '+359 88 903 1187', status: 'confirmed' },
    { id: 'BK-3037', date: '01.10.2026', start: '11:00', minutes: 120, resource: 'bay1', type: 'repair', master: 'Стоян', plate: 'PB 3390 XA', car: 'Mercedes C220', client: 'Стоян Гърков', phone: '+359 89 210 4478', status: 'confirmed' },
    { id: 'BK-3038', date: '02.10.2026', start: '10:00', minutes: 90, resource: 'bay2', type: 'service', master: 'Николай', plate: 'CB 1122 MT', car: 'Nissan Qashqai', client: 'Виолета Илиева', phone: '+359 88 664 9021', status: 'confirmed' },
    { id: 'BK-3039', date: '03.10.2026', start: '09:00', minutes: 60, resource: 'tyres', type: 'tyres', master: 'Стоян', plate: 'CA 4402 TP', car: 'Renault Megane', client: 'Иво Петров', phone: '+359 87 771 6620', status: 'confirmed', note: 'Смяна на гуми' },
    // Лист на изчакване: заявки, на които още не е определен час.
    { id: 'BK-3055', date: '30.09.2026', start: '', minutes: 30, resource: 'gti', type: 'gti', master: '', plate: 'CA 8899 BT', car: 'Citroën C4', client: 'Любка Иванова', phone: '+359 89 550 3344', status: 'request', note: 'Иска преглед тази седмица' },
    { id: 'BK-3056', date: '30.09.2026', start: '', minutes: 90, resource: 'bay1', type: 'service', master: '', plate: '', car: 'VW Golf', client: 'Николай Спасов', phone: '+359 88 212 7788', status: 'request', note: 'Пита кога има място' },
    { id: 'BK-3057', date: '30.09.2026', start: '', minutes: 30, resource: 'gti', type: 'gti', master: '', plate: '', car: 'Toyota Yaris', client: 'Десислава Колева', phone: '+359 87 664 9930', status: 'request', note: 'Изтърва ГТП, иска днес' },
  ],
  // Регламент: ГТП по Наредба Н-32, Гражданска отговорност, винетка и интервал ТО.
  maintenance: {
    'vin:TMBJF7NE0F0123456': { category: 'M1', firstRegistration: '15.03.2018', gtiDue: '05.10.2026', insuranceDue: '27.09.2026', vignetteDue: '30.11.2026', serviceIntervalKm: 15000, lastServiceKm: 199800, lastServiceDate: '03.02.2026' },
    'vin:SB1KD3LE20E123456': { category: 'M1', firstRegistration: '20.09.2015', gtiDue: '14.10.2026', insuranceDue: '30.09.2026', vignetteDue: '15.01.2027', serviceIntervalKm: 15000, lastServiceKm: 164200, lastServiceDate: '18.06.2026' },
    'vin:WVWZZZ3CZFE123456': { category: 'M1', firstRegistration: '10.06.2013', gtiDue: '09.04.2027', insuranceDue: '12.10.2026', vignetteDue: '15.12.2026', serviceIntervalKm: 15000, lastServiceKm: 294700, lastServiceDate: '09.04.2026' },
    'vin:UU1HSDCEG12345678': { category: 'M1', firstRegistration: '05.05.2021', gtiDue: '26.09.2026', insuranceDue: '20.10.2026', vignetteDue: '31.10.2026', serviceIntervalKm: 20000, lastServiceKm: 117900, lastServiceDate: '07.07.2026' },
  },
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
