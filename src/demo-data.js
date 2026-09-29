export const initialOrders = [
  { id: 'WO-1048', date: '30.09.2026', time: '09:00', client: 'Mārtiņš Ozols', phone: '+371 2000 1842', car: 'Volvo XC60', plate: 'MO-1842', vin: 'YV1DZARC1F1234567', mileage: 214500, service: 'Bremžu diagnostika', master: 'Jānis', status: 'work', labor: 85, parts: 124, paid: false },
  { id: 'WO-1047', date: '30.09.2026', time: '10:30', client: 'Анна Крузите', phone: '+371 2540 4040', car: 'Toyota Auris', plate: 'AK-7788', vin: 'SB1KD3LE20E123456', mileage: 168900, service: 'Eļļas un filtru maiņa', master: 'Aleksandrs', status: 'ready', labor: 45, parts: 68, paid: false },
  { id: 'WO-1046', date: '30.09.2026', time: '12:00', client: 'Ivars Kalniņš', phone: '+371 2911 5200', car: 'VW Passat', plate: 'IK-5200', vin: 'WVWZZZ3CZFE123456', mileage: 302100, service: 'Piekare · priekšējā ass', master: 'Jānis', status: 'waiting', labor: 110, parts: 236, paid: false },
  { id: 'WO-1045', date: '29.09.2026', time: '15:30', client: 'Laura Bērziņa', phone: '+371 2677 1901', car: 'Škoda Octavia', plate: 'LB-1901', vin: 'TMBJF7NE0F0123456', mileage: 121400, service: 'Kondicioniera apkope', master: 'Aleksandrs', status: 'done', labor: 55, parts: 24, paid: true },

  // History of the same cars — so the vehicle card shows a real timeline.
  { id: 'WO-1041', date: '12.05.2026', time: '09:30', client: 'Mārtiņš Ozols', phone: '+371 2000 1842', car: 'Volvo XC60', plate: 'MO-1842', vin: 'YV1DZARC1F1234567', mileage: 208300, service: 'Eļļas un filtru maiņa', master: 'Aleksandrs', status: 'done', labor: 45, parts: 73, paid: true },
  { id: 'WO-1033', date: '03.02.2026', time: '14:00', client: 'Mārtiņš Ozols', phone: '+371 2000 1842', car: 'Volvo XC60', plate: 'MO-1842', vin: 'YV1DZARC1F1234567', mileage: 199800, service: 'Riepu montāža · ziemas komplekts', master: 'Jānis', status: 'done', labor: 40, parts: 24, paid: true },
  { id: 'WO-1039', date: '18.06.2026', time: '11:00', client: 'Анна Крузите', phone: '+371 2540 4040', car: 'Toyota Auris', plate: 'AK-7788', vin: 'SB1KD3LE20E123456', mileage: 164200, service: 'Bremžu kluči · priekšā', master: 'Jānis', status: 'done', labor: 70, parts: 166, paid: true },
  { id: 'WO-1031', date: '21.03.2026', time: '10:00', client: 'Анна Крузите', phone: '+371 2540 4040', car: 'Toyota Auris', plate: 'AK-7788', vin: 'SB1KD3LE20E123456', mileage: 158000, service: 'Dzinēja diagnostika', master: 'Aleksandrs', status: 'done', labor: 45, parts: 0, paid: true },
  { id: 'WO-1037', date: '09.04.2026', time: '08:30', client: 'Ivars Kalniņš', phone: '+371 2911 5200', car: 'VW Passat', plate: 'IK-5200', vin: 'WVWZZZ3CZFE123456', mileage: 294700, service: 'Zobsiksnas maiņa', master: 'Jānis', status: 'done', labor: 180, parts: 222, paid: true },
  { id: 'WO-1029', date: '17.01.2026', time: '13:00', client: 'Ivars Kalniņš', phone: '+371 2911 5200', car: 'VW Passat', plate: 'IK-5200', vin: 'WVWZZZ3CZFE123456', mileage: 288900, service: 'Vispārējā diagnostika', master: 'Aleksandrs', status: 'done', labor: 45, parts: 0, paid: true },
  { id: 'WO-1043', date: '07.07.2026', time: '16:00', client: 'Laura Bērziņa', phone: '+371 2677 1901', car: 'Škoda Octavia', plate: 'LB-1901', vin: 'TMBJF7NE0F0123456', mileage: 117900, service: 'Eļļas un filtru maiņa', master: 'Aleksandrs', status: 'done', labor: 45, parts: 81, paid: true },
]

export const clients = [
  { name: 'Mārtiņš Ozols', phone: '+371 2000 1842', car: 'Volvo XC60', plate: 'MO-1842', vin: 'YV1DZARC1F1234567', visits: 4, spent: 746, debt: 209, history: ['12.05.2026 · Eļļas maiņa · €118', '03.02.2026 · Riepu montāža · €64'] },
  { name: 'Анна Крузите', phone: '+371 2540 4040', car: 'Toyota Auris', plate: 'AK-7788', vin: 'SB1KD3LE20E123456', visits: 7, spent: 1284, debt: 113, history: ['18.06.2026 · Bremžu kluči · €236', '21.03.2026 · Diagnostika · €45'] },
  { name: 'Ivars Kalniņš', phone: '+371 2911 5200', car: 'VW Passat', plate: 'IK-5200', vin: 'WVWZZZ3CZFE123456', visits: 3, spent: 512, debt: 346, history: ['09.04.2026 · Zobsiksnas maiņa · €402', '17.01.2026 · Diagnostika · €45'] },
  { name: 'Laura Bērziņa', phone: '+371 2677 1901', car: 'Škoda Octavia', plate: 'LB-1901', vin: 'TMBJF7NE0F0123456', visits: 5, spent: 935, debt: 0, history: ['29.09.2026 · Kondicioniera apkope · €79', '07.07.2026 · Eļļas maiņa · €126'] },
]

export const inventory = [
  { article: 'OF-204', name: 'Eļļas filtrs MANN', qty: 8, min: 4, buy: 7.4, sell: 12 },
  { article: 'BP-881', name: 'Bremžu kluči Brembo', qty: 3, min: 4, buy: 54, sell: 82 },
  { article: 'OL-5W30', name: 'Motoreļļa 5W-30 · 1L', qty: 24, min: 10, buy: 8.2, sell: 14 },
  { article: 'AF-115', name: 'Gaisa filtrs Bosch', qty: 2, min: 3, buy: 11, sell: 19 },
]

// Latvian demo set: people, plates, phone numbers and the activity log of a Riga workshop.
export const dataset = {
  code: 'lv',
  initialOrders,
  clients,
  inventory,
  // Pieņemšanas grafiks: tehniskās apskates līnija, divi kanāli, riepu montāža.
  shop: {
    openHours: { weekday: ['08:00', '18:00'], saturday: ['08:00', '14:00'] },
    slotMinutes: 30,
    resources: ['gti', 'bay1', 'bay2', 'tyres'],
    types: { gti: 30, service: 90, diagnostics: 45, repair: 120, tyres: 60 },
  },
  bookings: [
    // Trešdiena, 30.09.2026 — šodienas grafiks.
    { id: 'BK-1041', date: '30.09.2026', start: '08:00', minutes: 60, resource: 'tyres', type: 'tyres', master: 'Aleksandrs', plate: 'IK-5200', car: 'VW Passat', client: 'Ivars Kalniņš', phone: '+371 2911 5200', vin: 'WVWZZZ3CZFE123456', status: 'done', note: 'Vasaras riepas' },
    { id: 'BK-1042', date: '30.09.2026', start: '08:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Jānis', plate: 'MO-1842', car: 'Volvo XC60', client: 'Mārtiņš Ozols', phone: '+371 2000 1842', vin: 'YV1DZARC1F1234567', status: 'arrived', note: 'Apdrošināšana beigusies — jāsamaksā pirms apskates' },
    { id: 'BK-1043', date: '30.09.2026', start: '09:00', minutes: 90, resource: 'bay2', type: 'service', master: 'Aleksandrs', plate: 'AK-7788', car: 'Toyota Auris', client: 'Анна Крузите', phone: '+371 2540 4040', vin: 'SB1KD3LE20E123456', status: 'inWork', note: 'Eļļa + filtri' },
    { id: 'BK-1044', date: '30.09.2026', start: '09:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Jānis', plate: 'HK-4471', car: 'Peugeot 308', client: 'Sanita Liepa', phone: '+371 2600 7712', status: 'confirmed', note: 'Jauns klients, jautā par cenu' },
    { id: 'BK-1045', date: '30.09.2026', start: '10:00', minutes: 120, resource: 'bay1', type: 'repair', master: 'Jānis', plate: 'LM-3310', car: 'Ford Focus', client: 'Raimonds Bērziņš', phone: '+371 2911 8845', status: 'confirmed', note: 'Bremzes, detaļas ir noliktavā' },
    { id: 'BK-1046', date: '30.09.2026', start: '11:00', minutes: 30, resource: 'gti', type: 'gti', master: 'Aleksandrs', plate: 'EB-9022', car: 'Opel Astra', client: 'Inese Ozola', phone: '+371 2677 3391', status: 'confirmed' },
    { id: 'BK-1047', date: '30.09.2026', start: '13:00', minutes: 45, resource: 'bay1', type: 'diagnostics', master: 'Jānis', plate: 'LB-1901', car: 'Škoda Octavia', client: 'Laura Bērziņa', phone: '+371 2677 1901', vin: 'TMBJF7NE0F0123456', status: 'confirmed', note: 'Tehniskā apskate beigusies — jāpārrunā' },
    { id: 'BK-1048', date: '30.09.2026', start: '14:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Aleksandrs', plate: 'MO-1842', car: 'Volvo XC60', client: 'Mārtiņš Ozols', phone: '+371 2000 1842', status: 'confirmed' },
    { id: 'BK-1049', date: '30.09.2026', start: '15:00', minutes: 90, resource: 'bay2', type: 'service', master: 'Jānis', plate: 'AK-7788', car: 'Toyota Auris', client: 'Анна Крузите', phone: '+371 2540 4040', status: 'confirmed', note: 'Apkope pirms ziemas' },
    { id: 'BK-1050', date: '30.09.2026', start: '16:00', minutes: 30, resource: 'gti', type: 'gti', master: 'Jānis', plate: 'IK-5200', car: 'VW Passat', client: 'Ivars Kalniņš', phone: '+371 2911 5200', status: 'confirmed' },
    // Pārējās nedēļas dienas — lai redzētu noslodzi un brīvos logus.
    { id: 'BK-1031', date: '28.09.2026', start: '09:00', minutes: 30, resource: 'gti', type: 'gti', master: 'Jānis', plate: 'GK-2210', car: 'Seat Ibiza', client: 'Uldis Kalns', phone: '+371 2633 9021', status: 'done' },
    { id: 'BK-1032', date: '28.09.2026', start: '10:30', minutes: 120, resource: 'bay1', type: 'repair', master: 'Aleksandrs', plate: 'JK-8890', car: 'BMW 320d', client: 'Artis Ozoliņš', phone: '+371 2911 4477', status: 'done' },
    { id: 'BK-1033', date: '29.09.2026', start: '08:30', minutes: 30, resource: 'gti', type: 'gti', master: 'Jānis', plate: 'FH-6655', car: 'Honda Civic', client: 'Dace Priede', phone: '+371 2677 5521', status: 'noShow', note: 'Neieradās, jāpiezvana' },
    { id: 'BK-1034', date: '29.09.2026', start: '10:00', minutes: 90, resource: 'bay2', type: 'service', master: 'Aleksandrs', plate: 'KL-7712', car: 'Škoda Superb', client: 'Antons Vītols', phone: '+371 2540 8890', status: 'done' },
    { id: 'BK-1035', date: '29.09.2026', start: '13:00', minutes: 60, resource: 'tyres', type: 'tyres', master: 'Aleksandrs', plate: 'MN-8890', car: 'Dacia Sandero', client: 'Rita Toma', phone: '+371 2911 6633', status: 'cancelled', note: 'Atcēla, piezvanīs' },
    { id: 'BK-1036', date: '01.10.2026', start: '09:00', minutes: 30, resource: 'gti', type: 'gti', master: 'Jānis', plate: 'OP-2201', car: 'Fiat Tipo', client: 'Gunta Strazda', phone: '+371 2677 1187', status: 'confirmed' },
    { id: 'BK-1037', date: '01.10.2026', start: '11:00', minutes: 120, resource: 'bay1', type: 'repair', master: 'Aleksandrs', plate: 'QR-3390', car: 'Mercedes C220', client: 'Viesturs Gailis', phone: '+371 2911 4478', status: 'confirmed' },
    { id: 'BK-1038', date: '02.10.2026', start: '10:00', minutes: 90, resource: 'bay2', type: 'service', master: 'Jānis', plate: 'ST-1122', car: 'Nissan Qashqai', client: 'Vija Ozoliņa', phone: '+371 2633 9022', status: 'confirmed' },
    { id: 'BK-1039', date: '03.10.2026', start: '09:00', minutes: 60, resource: 'tyres', type: 'tyres', master: 'Aleksandrs', plate: 'UV-4402', car: 'Renault Megane', client: 'Ivo Pētersons', phone: '+371 2911 6620', status: 'confirmed', note: 'Riepu maiņa' },
    // Gaidāmie: pieteikumi bez noteikta laika.
    { id: 'BK-1055', date: '30.09.2026', start: '', minutes: 30, resource: 'gti', type: 'gti', master: '', plate: 'WX-8899', car: 'Citroën C4', client: 'Līga Ivanova', phone: '+371 2677 3344', status: 'request', note: 'Grib apskati šonedēļ' },
    { id: 'BK-1056', date: '30.09.2026', start: '', minutes: 90, resource: 'bay1', type: 'service', master: '', plate: '', car: 'VW Golf', client: 'Niklāvs Spāris', phone: '+371 2911 7788', status: 'request', note: 'Jautā, kad ir brīva vieta' },
  ],
  // Regulārais plāns: tehniskā apskate, civiltiesiskā apdrošināšana, vinjete un apkopes intervāls.
  maintenance: {
    'vin:YV1DZARC1F1234567': { category: 'M1', firstRegistration: '10.02.2017', gtiDue: '20.10.2026', insuranceDue: '27.09.2026', vignetteDue: '30.11.2026', serviceIntervalKm: 15000, lastServiceKm: 208300, lastServiceDate: '12.05.2026' },
    'vin:SB1KD3LE20E123456': { category: 'M1', firstRegistration: '05.08.2016', gtiDue: '30.09.2026', insuranceDue: '15.10.2026', vignetteDue: '15.01.2027', serviceIntervalKm: 15000, lastServiceKm: 164200, lastServiceDate: '18.06.2026' },
    'vin:WVWZZZ3CZFE123456': { category: 'M1', firstRegistration: '22.04.2014', gtiDue: '09.04.2027', insuranceDue: '12.10.2026', vignetteDue: '15.12.2026', serviceIntervalKm: 15000, lastServiceKm: 294700, lastServiceDate: '09.04.2026' },
    'vin:TMBJF7NE0F0123456': { category: 'M1', firstRegistration: '12.09.2019', gtiDue: '26.09.2026', insuranceDue: '20.10.2026', vignetteDue: '31.10.2026', serviceIntervalKm: 20000, lastServiceKm: 117900, lastServiceDate: '07.07.2026' },
  },
  masters: ['Jānis', 'Aleksandrs'],
  newClient: { name: 'Roberts Liepa', car: 'Audi A4', plate: 'RL-2026' },
  newPhone: '+371 2000 0000',
  orderBase: 1048,
  logs: [
    { time: '10:18', type: 'status', id: 'WO-1047', status: 'ready' },
    { time: '09:42', type: 'diagnostic', id: 'WO-1048' },
    { time: '09:05', type: 'created', id: 'WO-1046' },
    { time: '08:51', type: 'reserved', id: 'BP-881', quantity: 1 },
  ],
}
