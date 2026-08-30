export const initialOrders = [
  { id: 'WO-1048', date: '30.08.2026', time: '09:00', client: 'Mārtiņš Ozols', phone: '+371 2000 1842', car: 'Volvo XC60', plate: 'MO-1842', service: 'Bremžu diagnostika', master: 'Jānis', status: 'work', labor: 85, parts: 124, paid: false },
  { id: 'WO-1047', date: '30.08.2026', time: '10:30', client: 'Анна Крузите', phone: '+371 2540 4040', car: 'Toyota Auris', plate: 'AK-7788', service: 'Eļļas un filtru maiņa', master: 'Aleksandrs', status: 'ready', labor: 45, parts: 68, paid: false },
  { id: 'WO-1046', date: '30.08.2026', time: '12:00', client: 'Ivars Kalniņš', phone: '+371 2911 5200', car: 'VW Passat', plate: 'IK-5200', service: 'Piekare · priekšējā ass', master: 'Jānis', status: 'waiting', labor: 110, parts: 236, paid: false },
  { id: 'WO-1045', date: '29.08.2026', time: '15:30', client: 'Laura Bērziņa', phone: '+371 2677 1901', car: 'Škoda Octavia', plate: 'LB-1901', service: 'Kondicioniera apkope', master: 'Aleksandrs', status: 'done', labor: 55, parts: 24, paid: true },
]

export const clients = [
  { name: 'Mārtiņš Ozols', phone: '+371 2000 1842', car: 'Volvo XC60', plate: 'MO-1842', visits: 4, spent: 746, debt: 209, history: ['12.05.2026 · Eļļas maiņa · €118', '03.02.2026 · Riepu montāža · €64'] },
  { name: 'Анна Крузите', phone: '+371 2540 4040', car: 'Toyota Auris', plate: 'AK-7788', visits: 7, spent: 1284, debt: 113, history: ['18.06.2026 · Bremžu kluči · €236', '21.03.2026 · Diagnostika · €45'] },
  { name: 'Ivars Kalniņš', phone: '+371 2911 5200', car: 'VW Passat', plate: 'IK-5200', visits: 3, spent: 512, debt: 346, history: ['09.04.2026 · Zobsiksnas maiņa · €402', '17.01.2026 · Diagnostika · €45'] },
  { name: 'Laura Bērziņa', phone: '+371 2677 1901', car: 'Škoda Octavia', plate: 'LB-1901', visits: 5, spent: 935, debt: 0, history: ['29.08.2026 · Kondicioniera apkope · €79', '07.07.2026 · Eļļas maiņa · €126'] },
]

export const inventory = [
  { article: 'OF-204', name: 'Eļļas filtrs MANN', qty: 8, min: 4, buy: 7.4, sell: 12 },
  { article: 'BP-881', name: 'Bremžu kluči Brembo', qty: 3, min: 4, buy: 54, sell: 82 },
  { article: 'OL-5W30', name: 'Motoreļļa 5W-30 · 1L', qty: 24, min: 10, buy: 8.2, sell: 14 },
  { article: 'AF-115', name: 'Gaisa filtrs Bosch', qty: 2, min: 3, buy: 11, sell: 19 },
]
