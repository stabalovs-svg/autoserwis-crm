<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import logo from './assets/logo/ikars-logo.svg'
import { clients, initialOrders, inventory } from './demo-data'
import VehicleSection from './components/VehicleSection.vue'
import VehicleDrawer from './components/VehicleDrawer.vue'
import PhotoStrip from './components/PhotoStrip.vue'
import { groupVehicles, decodeVin, vehicleKey } from './lib/vehicles'
import { makePhotoSet } from './lib/image'
import { allPhotos, photosForVehicle, photosForVisit, savePhoto, deletePhoto, clearPhotos } from './lib/photos'

const q = new URLSearchParams(window.location.search)
const savedLang = localStorage.getItem('autoserwis-lang')
const initialLang = ['en', 'lv', 'ru'].includes(q.get('lang')) ? q.get('lang') : (['en', 'lv', 'ru'].includes(savedLang) ? savedLang : 'lv')
const lang = ref(initialLang)
const section = ref(['dashboard', 'vehicles', 'orders', 'clients', 'stock', 'reports', 'log'].includes(q.get('section')) ? q.get('section') : 'dashboard')
const orders = ref(loadState() || structuredClone(initialOrders))
const selected = ref(null)
const selectedClient = ref(null)
const draftClient = ref(null)
const toast = ref('')
const showNewOrder = ref(false)

const copy = {
  lv: { demo: 'DEMONSTRĀCIJAS REŽĪMS', demoNote: 'Droši izmēģiniet — dati tiks atjaunoti pēc lapas pārlādes.', dashboard: 'Vadības panelis', orders: 'Darba uzdevumi', clients: 'Klienti', stock: 'Noliktava', reports: 'Pārskati', log: 'Darbību žurnāls', today: 'Šodien servisā', revenue: 'Šodienas apgrozījums', ready: 'Gatavi izsniegšanai', low: 'Jāpapildina noliktavā', recent: 'Aktuālie darba uzdevumi', newOrder: 'Jauns pieraksts', order: 'Darba uzdevums', client: 'Klients', car: 'Automobilis', service: 'Darbs', master: 'Meistars', total: 'Kopā', payment: 'Apmaksa', unpaid: 'Nav apmaksāts', paid: 'Apmaksāts', next: 'Mainīt statusu', markPaid: 'Atzīmēt kā apmaksātu', close: 'Aizvērt', allClients: 'Klienti un automobiļi', visits: 'Vizītes', parts: 'Rezerves daļas', quantity: 'Atlikums', purchase: 'Iepirkums', sale: 'Pārdošana', analytics: 'Servisa rezultāti', reset: 'Atjaunot demo datus', contact: 'Uzzināt par IKARS', created: 'Jauns darba uzdevums izveidots', saved: 'Izmaiņas saglabātas demonstrācijā', name: 'Vārds, uzvārds', plate: 'Valsts numurs', create: 'Izveidot pierakstu', vehicles: 'Automobiļi', vehiclesTitle: 'Automobiļi un to vēsture', vehiclesSearch: 'Meklēt numuru, VIN, klientu vai tālruni', vehiclesHint: 'Ievadiet valsts numuru vai VIN — atvērsies visa vizīšu vēsture.', vehiclesVinFound: 'VIN atpazīts — meklējam vēsturi…', vehiclesNothing: 'Nekas nav atrasts', vehiclesEmpty: 'Vēl nav neviena automobiļa', vehicleCard: 'Automobiļa kartīte', carUnknown: 'Automobilis nav norādīts', vin: 'VIN', vinInvalid: 'VIN jābūt 17 rakstzīmēm (bez I, O, Q)', vinDecode: 'Noteikt marku pēc VIN', vinDecoding: 'Noskaidrojam…', vinAgain: 'Meklēt vēlreiz', vinNothing: 'Pēc VIN dati nav atrasti', mileage: 'Nobraukums', sinceLastVisit: 'kopš pēdējās vizītes', spentAll: 'Kopā par remontiem', debt: 'Parāds', photos: 'Fotogrāfijas', addPhoto: 'Pievienot foto', photoSaving: 'Saglabājam…', photoView: 'Atvērt foto', deletePhoto: 'Dzēst foto', photoSaved: 'Foto pievienots automobiļa vēsturei', photoFailed: 'Fotogrāfiju neizdevās saglabāt', tagGeneral: 'Vispārīgi', tagBefore: 'Pirms', tagAfter: 'Pēc', tagDamage: 'Bojājums', tagPart: 'Detaļa', vehicleHistory: 'Remontu vēsture', historyEmpty: 'Vēstures vēl nav', openVehicle: 'Atvērt automobili', openOrder: 'Atvērt darba uzdevumu', currentRepair: 'Aktuālais remonts', callClient: 'Zvanīt klientam', inWork: 'darbā' },
  ru: { demo: 'ДЕМОНСТРАЦИОННЫЙ РЕЖИМ', demoNote: 'Пробуйте свободно — данные восстановятся после обновления страницы.', dashboard: 'Панель управления', orders: 'Заказ-наряды', clients: 'Клиенты', stock: 'Склад', reports: 'Отчёты', log: 'Журнал действий', today: 'Сегодня в сервисе', revenue: 'Выручка сегодня', ready: 'Готовы к выдаче', low: 'Нужно пополнить', recent: 'Текущие заказ-наряды', newOrder: 'Новая запись', order: 'Заказ-наряд', client: 'Клиент', car: 'Автомобиль', service: 'Работы', master: 'Мастер', total: 'Итого', payment: 'Оплата', unpaid: 'Не оплачено', paid: 'Оплачено', next: 'Изменить статус', markPaid: 'Отметить оплаченным', close: 'Закрыть', allClients: 'Клиенты и автомобили', visits: 'Визиты', parts: 'Запасные части', quantity: 'Остаток', purchase: 'Закупка', sale: 'Продажа', analytics: 'Результаты сервиса', reset: 'Восстановить демо-данные', contact: 'Узнать об IKARS', created: 'Новый заказ-наряд создан', saved: 'Изменения сохранены в демоверсии', name: 'Имя и фамилия', plate: 'Госномер', create: 'Создать запись', vehicles: 'Автомобили', vehiclesTitle: 'Автомобили и их история', vehiclesSearch: 'Поиск по номеру, VIN, клиенту или телефону', vehiclesHint: 'Введите госномер или VIN — откроется вся история визитов.', vehiclesVinFound: 'VIN распознан — ищем историю…', vehiclesNothing: 'Ничего не найдено', vehiclesEmpty: 'Пока нет ни одного автомобиля', vehicleCard: 'Карточка автомобиля', carUnknown: 'Автомобиль не указан', vin: 'VIN', vinInvalid: 'В VIN должно быть 17 символов (без I, O, Q)', vinDecode: 'Определить марку по VIN', vinDecoding: 'Определяем…', vinAgain: 'Найти ещё раз', vinNothing: 'По этому VIN данных не нашли', mileage: 'Пробег', sinceLastVisit: 'с прошлого визита', spentAll: 'Всего за ремонты', debt: 'Задолженность', photos: 'Фотографии', addPhoto: 'Добавить фото', photoSaving: 'Сохраняем…', photoView: 'Открыть фото', deletePhoto: 'Удалить фото', photoSaved: 'Фото добавлено в историю автомобиля', photoFailed: 'Не удалось сохранить фото', tagGeneral: 'Общее', tagBefore: 'До', tagAfter: 'После', tagDamage: 'Повреждение', tagPart: 'Запчасть', vehicleHistory: 'История ремонтов', historyEmpty: 'Истории пока нет', openVehicle: 'Открыть автомобиль', openOrder: 'Открыть заказ-наряд', currentRepair: 'Текущий ремонт', callClient: 'Позвонить клиенту', inWork: 'в работе' },
  en: { demo: 'DEMONSTRATION MODE', demoNote: 'Explore freely — data resets when the page is refreshed.', dashboard: 'Dashboard', orders: 'Work orders', clients: 'Clients', stock: 'Inventory', reports: 'Reports', log: 'Activity log', today: 'In service today', revenue: 'Revenue today', ready: 'Ready for pickup', low: 'Low stock items', recent: 'Current work orders', newOrder: 'New booking', order: 'Work order', client: 'Client', car: 'Vehicle', service: 'Service', master: 'Technician', total: 'Total', payment: 'Payment', unpaid: 'Unpaid', paid: 'Paid', next: 'Change status', markPaid: 'Mark as paid', close: 'Close', allClients: 'Clients and vehicles', visits: 'Visits', parts: 'Spare parts', quantity: 'Stock', purchase: 'Purchase', sale: 'Sale', analytics: 'Service performance', reset: 'Reset demo data', contact: 'Learn about IKARS', created: 'New work order created', saved: 'Changes saved in the demo', name: 'Full name', plate: 'Registration', create: 'Create booking', vehicles: 'Vehicles', vehiclesTitle: 'Vehicles and their history', vehiclesSearch: 'Search by plate, VIN, client or phone', vehiclesHint: 'Type a plate or VIN — the whole visit history opens.', vehiclesVinFound: 'VIN detected — looking up the history…', vehiclesNothing: 'Nothing found', vehiclesEmpty: 'No vehicles yet', vehicleCard: 'Vehicle card', carUnknown: 'Vehicle not specified', vin: 'VIN', vinInvalid: 'VIN must be 17 characters (no I, O, Q)', vinDecode: 'Identify model by VIN', vinDecoding: 'Looking up…', vinAgain: 'Look up again', vinNothing: 'No data found for this VIN', mileage: 'Mileage', sinceLastVisit: 'since the last visit', spentAll: 'Total for repairs', debt: 'Outstanding', photos: 'Photos', addPhoto: 'Add photo', photoSaving: 'Saving…', photoView: 'Open photo', deletePhoto: 'Delete photo', photoSaved: 'Photo added to the vehicle history', photoFailed: 'Could not save the photo', tagGeneral: 'General', tagBefore: 'Before', tagAfter: 'After', tagDamage: 'Damage', tagPart: 'Part', vehicleHistory: 'Service history', historyEmpty: 'No history yet', openVehicle: 'Open vehicle', openOrder: 'Open work order', currentRepair: 'Current repair', callClient: 'Call client', inWork: 'in work' },
}

const t = (key) => copy[lang.value][key] || key
const clientText = computed(() => ({
  profile: lang.value === 'lv' ? 'Klienta kartīte' : lang.value === 'ru' ? 'Карточка клиента' : 'Client profile',
  current: lang.value === 'lv' ? 'Aktuālais remonts' : lang.value === 'ru' ? 'Текущий ремонт' : 'Current repair',
  history: lang.value === 'lv' ? 'Remontu vēsture' : lang.value === 'ru' ? 'История ремонтов' : 'Service history',
  spent: lang.value === 'lv' ? 'Kopā samaksāts' : lang.value === 'ru' ? 'Оплачено всего' : 'Total paid',
  debt: lang.value === 'lv' ? 'Neapmaksāts' : lang.value === 'ru' ? 'Задолженность' : 'Outstanding',
  noDebt: lang.value === 'lv' ? 'Parādu nav' : lang.value === 'ru' ? 'Задолженности нет' : 'No outstanding balance',
  call: lang.value === 'lv' ? 'Zvanīt klientam' : lang.value === 'ru' ? 'Позвонить клиенту' : 'Call client',
  openRepair: lang.value === 'lv' ? 'Atvērt darba uzdevumu' : lang.value === 'ru' ? 'Открыть заказ-наряд' : 'Open work order',
}))
const statuses = ['waiting', 'work', 'ready', 'done']
const statusText = computed(() => ({
  waiting: lang.value === 'lv' ? 'Gaida' : lang.value === 'ru' ? 'Ожидает' : 'Waiting',
  work: lang.value === 'lv' ? 'Darbā' : lang.value === 'ru' ? 'В работе' : 'In progress',
  ready: lang.value === 'lv' ? 'Gatavs' : lang.value === 'ru' ? 'Готов' : 'Ready',
  done: lang.value === 'lv' ? 'Pabeigts' : lang.value === 'ru' ? 'Завершён' : 'Completed',
}))
const todayOrders = computed(() => orders.value.filter((item) => item.date === '30.08.2026'))
const revenue = computed(() => orders.value.filter((item) => item.paid).reduce((sum, item) => sum + item.labor + item.parts, 0))
const readyCount = computed(() => orders.value.filter((item) => item.status === 'ready').length)
const lowStock = computed(() => inventory.filter((item) => item.qty <= item.min).length)
const totalOpen = computed(() => orders.value.filter((item) => item.status !== 'done').reduce((sum, item) => sum + item.labor + item.parts, 0))
const logs = ref([
  { time: '10:18', type: 'status', id: 'WO-1047', status: 'ready' },
  { time: '09:42', type: 'diagnostic', id: 'WO-1048' },
  { time: '09:05', type: 'created', id: 'WO-1046' },
  { time: '08:51', type: 'reserved', id: 'BP-881', quantity: 1 },
])

const logText = (entry) => {
  const translations = {
    lv: {
      status: `${entry.id} · statuss mainīts uz “${statusText.value[entry.status]}”`,
      diagnostic: `${entry.id} · pievienota diagnostika`,
      created: `${entry.id} · izveidots darba uzdevums`,
      reserved: `${entry.id} · rezervēta ${entry.quantity} detaļa`,
      payment: `${entry.id} · saņemta apmaksa`,
    },
    ru: {
      status: `${entry.id} · статус изменён на «${statusText.value[entry.status]}»`,
      diagnostic: `${entry.id} · добавлена диагностика`,
      created: `${entry.id} · создан заказ-наряд`,
      reserved: `${entry.id} · зарезервирована ${entry.quantity} деталь`,
      payment: `${entry.id} · получена оплата`,
    },
    en: {
      status: `${entry.id} · status changed to “${statusText.value[entry.status]}”`,
      diagnostic: `${entry.id} · diagnostic added`,
      created: `${entry.id} · work order created`,
      reserved: `${entry.id} · ${entry.quantity} item reserved`,
      payment: `${entry.id} · payment received`,
    },
  }
  return translations[lang.value][entry.type]
}

// ---- vehicles, history and photos (prototype: everything stays in the browser) ----
const STORAGE_KEY = 'autoserwis-demo-v1'
const vehicles = computed(() => groupVehicles(orders.value))
const selectedVehicle = ref(null)
const vehiclePhotos = ref([])
const visitPhotos = ref([])
const photoTag = ref('general')
const photoBusy = ref(false)
const vinInfo = ref(null)
const vinBusy = ref(false)
const lightbox = ref(null)
const photoCounts = ref({})
const orderVehicle = computed(() => (selected.value ? vehicles.value.find((vehicle) => vehicle.key === vehicleKey(selected.value)) : null))

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    return Array.isArray(parsed?.orders) && parsed.orders.length ? parsed.orders : null
  } catch { return null }
}

watch(orders, (value) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ orders: value })) } catch { /* storage full */ }
}, { deep: true })

function withUrls(records) {
  return [...records]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map((record) => ({
      ...record,
      time: new Date(record.createdAt).toLocaleString('lv-LV', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      thumbUrl: URL.createObjectURL(record.thumb || record.full),
      fullUrl: URL.createObjectURL(record.full),
    }))
}

async function refreshPhotos() {
  const all = await allPhotos()
  const counts = {}
  all.forEach((record) => { counts[record.vehicleKey] = (counts[record.vehicleKey] || 0) + 1 })
  photoCounts.value = counts
  if (selectedVehicle.value) vehiclePhotos.value = withUrls(await photosForVehicle(selectedVehicle.value.key))
  if (selected.value) visitPhotos.value = withUrls(await photosForVisit(selected.value.id))
}

const countPhotos = (vehicle) => photoCounts.value[vehicle.key] || 0

const openVehicle = async (vehicle) => {
  selected.value = null
  selectedClient.value = null
  vinInfo.value = null
  selectedVehicle.value = vehicle
  vehiclePhotos.value = withUrls(await photosForVehicle(vehicle.key))
}

const closeVehicle = () => { selectedVehicle.value = null; vehiclePhotos.value = []; vinInfo.value = null }
const openPhoto = (photo) => { lightbox.value = photo }
const closePhoto = () => { lightbox.value = null }

async function addPhotos(files, key, visitId) {
  photoBusy.value = true
  try {
    for (const file of files) await savePhoto(await makePhotoSet(file, key, visitId, photoTag.value))
    await refreshPhotos()
    notify(t('photoSaved'))
  } catch {
    notify(t('photoFailed'))
  } finally {
    photoBusy.value = false
  }
}

const addVehiclePhotos = (files) => {
  const vehicle = selectedVehicle.value
  if (!vehicle) return
  const visit = vehicle.visits.find((item) => item.status !== 'done') || vehicle.visits[0]
  addPhotos(files, vehicle.key, visit ? visit.id : 'vehicle')
}

const addVisitPhotos = (files) => {
  if (!selected.value) return
  addPhotos(files, vehicleKey(selected.value), selected.value.id)
}

async function removePhoto(photo) {
  await deletePhoto(photo.id)
  await refreshPhotos()
  notify(t('saved'))
}

async function identifyVehicle(vin) {
  vinBusy.value = true
  try {
    const info = await decodeVin(vin)
    vinInfo.value = info
    if (!info) notify(t('vinNothing'))
  } catch {
    notify(t('vinNothing'))
  } finally {
    vinBusy.value = false
  }
}

const newOrderForVehicle = (vehicle) => {
  closeVehicle()
  openNewOrder({ name: vehicle.client, car: vehicle.car, plate: vehicle.plate, vin: vehicle.vin, phone: vehicle.phone })
}

onMounted(refreshPhotos)

// Deep link for demos and support: ?section=vehicles&vehicle=MO-1842
const preselect = q.get('vehicle')
if (preselect) {
  const found = vehicles.value.find((vehicle) => [vehicle.plate, vehicle.vin]
    .some((value) => String(value || '').toUpperCase() === preselect.trim().toUpperCase()))
  if (found) openVehicle(found)
}

const notify = (message) => {
  toast.value = message
  window.clearTimeout(notify.timer)
  notify.timer = window.setTimeout(() => { toast.value = '' }, 3500)
}
const openOrder = async (order) => {
  selectedClient.value = null
  selectedVehicle.value = null
  selected.value = order
  visitPhotos.value = withUrls(await photosForVisit(order.id))
}
const openClient = (client) => { selected.value = null; selectedClient.value = client }
const openNewOrder = (client = null) => {
  draftClient.value = client
  selectedClient.value = null
  showNewOrder.value = true
}
const advanceStatus = () => {
  if (!selected.value) return
  const index = statuses.indexOf(selected.value.status)
  selected.value.status = statuses[Math.min(index + 1, statuses.length - 1)]
  logs.value.unshift({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'status', id: selected.value.id, status: selected.value.status })
  notify(t('saved'))
}
const markPaid = () => {
  selected.value.paid = true
  logs.value.unshift({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'payment', id: selected.value.id })
  notify(t('saved'))
}
const createOrder = (event) => {
  const form = new FormData(event.currentTarget)
  const next = {
    id: `WO-${1049 + orders.value.length}`,
    date: '30.08.2026', time: '16:00', client: form.get('client'), phone: '+371 2000 0000',
    car: form.get('car'), plate: form.get('plate'), service: form.get('service'), master: 'Jānis',
    vin: String(form.get('vin') || '').trim().toUpperCase(), mileage: Number(form.get('mileage')) || 0,
    status: 'waiting', labor: 45, parts: 0, paid: false,
  }
  orders.value.unshift(next)
  logs.value.unshift({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'created', id: next.id })
  showNewOrder.value = false
  draftClient.value = null
  selected.value = next
  notify(t('created'))
}
const resetDemo = () => {
  orders.value = structuredClone(initialOrders)
  localStorage.removeItem(STORAGE_KEY)
  selectedVehicle.value = null
  vehiclePhotos.value = []
  clearPhotos().then(refreshPhotos)
  selected.value = null
  notify(t('saved'))
}
</script>

<template>
  <div class="demo-shell">
    <aside class="sidebar">
      <a class="brand" href="https://ikars.lv/#solutions"><img :src="logo" alt="IKARS"><span>AUTO SERVICE</span></a>
      <nav>
        <button v-for="item in ['dashboard','vehicles','orders','clients','stock','reports','log']" :key="item" :class="{ active: section === item }" @click="section = item">
          <span>{{ {dashboard:'▦',vehicles:'🚗',orders:'▤',clients:'●',stock:'◇',reports:'↗',log:'≡'}[item] }}</span>{{ t(item) }}
        </button>
      </nav>
      <a class="learn" href="https://ikars.lv/#contact">{{ t('contact') }} →</a>
      <a class="back-home" href="https://ikars.lv/">← ikars.lv</a>
    </aside>

    <main>
      <header class="topbar">
        <div><strong>IKARS Auto Service</strong><small>Rīga · Demo autoserviss</small></div>
        <div class="top-actions"><button v-for="code in ['lv','ru','en']" :key="code" :class="{active:lang===code}" @click="lang=code">{{ code.toUpperCase() }}</button></div>
      </header>
      <div class="demo-banner"><strong>{{ t('demo') }}</strong><span>{{ t('demoNote') }}</span><a class="back-home" href="https://ikars.lv/">← ikars.lv</a><button @click="resetDemo">↻ {{ t('reset') }}</button></div>

      <section class="page">
              <template v-if="section === 'vehicles'">
        <VehicleSection :vehicles="vehicles" :t="t" :status-text="statusText" :photos-count="countPhotos" @open="openVehicle" @new-order="newOrderForVehicle" />
      </template>

<template v-if="section === 'dashboard'">
          <div class="page-title"><div><p>30.08.2026</p><h1>{{ t('dashboard') }}</h1></div><button class="primary" @click="openNewOrder()">＋ {{ t('newOrder') }}</button></div>
          <div class="metrics">
            <article><span>{{ t('today') }}</span><strong>{{ todayOrders.length }}</strong><em>2 {{ statusText.work.toLowerCase() }}</em></article>
            <article><span>{{ t('revenue') }}</span><strong>€{{ revenue }}</strong><em>+12% vs. yesterday</em></article>
            <article><span>{{ t('ready') }}</span><strong>{{ readyCount }}</strong><em>{{ statusText.ready }}</em></article>
            <article><span>{{ t('low') }}</span><strong>{{ lowStock }}</strong><em>BP-881 · AF-115</em></article>
          </div>
          <div class="panel"><div class="panel-head"><h2>{{ t('recent') }}</h2><button @click="section='orders'">{{ t('orders') }} →</button></div><OrderTable :orders="orders.slice(0,4)" :status-text="statusText" @open="openOrder" /></div>
        </template>

        <template v-else-if="section === 'orders'">
          <div class="page-title"><div><p>CRM · WORKFLOW</p><h1>{{ t('orders') }}</h1></div><button class="primary" @click="openNewOrder()">＋ {{ t('newOrder') }}</button></div>
          <div class="kanban">
            <div v-for="status in statuses" :key="status" class="kanban-column"><h3><span :class="['dot',status]"></span>{{ statusText[status] }} <b>{{ orders.filter(o=>o.status===status).length }}</b></h3><button v-for="order in orders.filter(o=>o.status===status)" :key="order.id" class="order-card" @click="openOrder(order)"><small>{{ order.time }} · {{ order.id }}</small><strong>{{ order.car }}</strong><span>{{ order.client }}</span><em>€{{ order.labor + order.parts }}</em></button></div>
          </div>
        </template>

        <template v-else-if="section === 'clients'">
          <div class="page-title"><div><p>CRM · DATABASE</p><h1>{{ t('allClients') }}</h1></div></div>
          <div class="panel table-panel"><table><thead><tr><th>{{ t('client') }}</th><th>{{ t('car') }}</th><th>{{ t('plate') }}</th><th>{{ t('visits') }}</th></tr></thead><tbody><tr v-for="client in clients" :key="client.plate" class="clickable" @click="openClient(client)"><td><strong>{{ client.name }}</strong><small>{{ client.phone }}</small></td><td>{{ client.car }}</td><td><span class="plate">{{ client.plate }}</span></td><td>{{ client.visits }} <b class="row-arrow">›</b></td></tr></tbody></table></div>
        </template>

        <template v-else-if="section === 'stock'">
          <div class="page-title"><div><p>CRM · INVENTORY</p><h1>{{ t('parts') }}</h1></div></div>
          <div class="panel table-panel"><table><thead><tr><th>{{ t('parts') }}</th><th>{{ t('quantity') }}</th><th>{{ t('purchase') }}</th><th>{{ t('sale') }}</th></tr></thead><tbody><tr v-for="part in inventory" :key="part.article"><td><strong>{{ part.name }}</strong><small>{{ part.article }}</small></td><td><span :class="['stock-pill',{danger:part.qty<=part.min}]">{{ part.qty }}</span></td><td>€{{ part.buy.toFixed(2) }}</td><td>€{{ part.sell.toFixed(2) }}</td></tr></tbody></table></div>
        </template>

        <template v-else-if="section === 'reports'">
          <div class="page-title"><div><p>CRM · ANALYTICS</p><h1>{{ t('analytics') }}</h1></div></div>
          <div class="report-grid"><article><span>{{ t('revenue') }}</span><strong>€{{ revenue }}</strong><div class="bars"><i v-for="h in [42,66,54,81,73,92,64]" :key="h" :style="{height:h+'%'}"></i></div></article><article><span>Open work value</span><strong>€{{ totalOpen }}</strong><div class="donut"><b>68%</b></div></article><article class="wide"><span>Popular services</span><div class="service-row"><b>Oil & filters</b><i style="--w:82%"></i><em>34%</em></div><div class="service-row"><b>Diagnostics</b><i style="--w:64%"></i><em>27%</em></div><div class="service-row"><b>Brakes</b><i style="--w:48%"></i><em>20%</em></div></article></div>
        </template>

        <template v-else>
          <div class="page-title"><div><p>CRM · AUDIT</p><h1>{{ t('log') }}</h1></div></div>
          <div class="timeline"><article v-for="entry in logs" :key="entry.time+entry.id+entry.type"><time>{{ entry.time }}</time><span></span><p>{{ logText(entry) }}</p></article></div>
        </template>
      </section>
    </main>

    <div v-if="selected" class="overlay" @click.self="selected=null"><aside class="drawer"><button class="x" @click="selected=null">×</button><p class="eyebrow">{{ t('order') }} · {{ selected.id }}</p><h2>{{ selected.car }} <span class="plate">{{ selected.plate }}</span></h2><div class="detail-grid"><div><span>{{ t('client') }}</span><strong>{{ selected.client }}</strong><small>{{ selected.phone }}</small></div><div><span>{{ t('master') }}</span><strong>{{ selected.master }}</strong></div><div class="wide"><span>{{ t('service') }}</span><strong>{{ selected.service }}</strong></div></div><div class="invoice"><div><span>Darbs / Labor</span><b>€{{ selected.labor }}</b></div><div><span>{{ t('parts') }}</span><b>€{{ selected.parts }}</b></div><div class="sum"><span>{{ t('total') }}</span><b>€{{ selected.labor + selected.parts }}</b></div></div><div v-if="selected.vin || selected.mileage" class="detail-grid order-vehicle"><div v-if="selected.vin"><span>{{ t('vin') }}</span><strong class="mono">{{ selected.vin }}</strong></div><div v-if="selected.mileage"><span>{{ t('mileage') }}</span><strong>{{ selected.mileage.toLocaleString('lv-LV') }} km</strong></div></div><button v-if="orderVehicle" type="button" class="secondary full" @click="openVehicle(orderVehicle)">{{ t('openVehicle') }} →</button><section class="photos order-photos"><h3>{{ t('photos') }}</h3><PhotoStrip :photos="visitPhotos" :t="t" :busy="photoBusy" :tag="photoTag" @add="addVisitPhotos" @remove="removePhoto" @open="openPhoto" @update:tag="photoTag = $event" /></section><div class="drawer-status"><span :class="['status',selected.status]">{{ statusText[selected.status] }}</span><span :class="['payment',{paid:selected.paid}]">{{ selected.paid ? t('paid') : t('unpaid') }}</span></div><button v-if="selected.status!=='done'" class="primary full" @click="advanceStatus">{{ t('next') }} →</button><button v-if="!selected.paid" class="secondary full" @click="markPaid">€ {{ t('markPaid') }}</button></aside></div>

        <div v-if="selectedVehicle" class="overlay" @click.self="closeVehicle"><VehicleDrawer :vehicle="selectedVehicle" :t="t" :status-text="statusText" :photos="vehiclePhotos" :busy="photoBusy" :tag="photoTag" :vin-info="vinInfo" :vin-busy="vinBusy" @close="closeVehicle" @add-photos="addVehiclePhotos" @remove-photo="removePhoto" @open-photo="openPhoto" @open-order="openOrder" @new-order="newOrderForVehicle" @decode-vin="identifyVehicle" @update:tag="photoTag = $event" /></div>

<div v-if="selectedClient" class="overlay" @click.self="selectedClient=null"><aside class="drawer client-drawer"><button class="x" @click="selectedClient=null">×</button><p class="eyebrow">IKARS · {{ clientText.profile }}</p><div class="client-heading"><div class="avatar">{{ selectedClient.name.split(' ').map(word=>word[0]).join('').slice(0,2) }}</div><div><h2>{{ selectedClient.name }}</h2><a :href="`tel:${selectedClient.phone.replaceAll(' ','')}`">{{ selectedClient.phone }}</a></div></div><div class="detail-grid"><div><span>{{ t('car') }}</span><strong>{{ selectedClient.car }}</strong><small><span class="plate">{{ selectedClient.plate }}</span></small></div><div><span>{{ t('visits') }}</span><strong>{{ selectedClient.visits }}</strong></div><div><span>{{ clientText.spent }}</span><strong>€{{ selectedClient.spent }}</strong></div><div><span>{{ clientText.debt }}</span><strong :class="{positive:selectedClient.debt===0}">{{ selectedClient.debt ? `€${selectedClient.debt}` : clientText.noDebt }}</strong></div></div><div v-if="orders.find(order=>order.plate===selectedClient.plate && order.status!=='done')" class="current-repair"><span>{{ clientText.current }}</span><strong>{{ orders.find(order=>order.plate===selectedClient.plate && order.status!=='done').service }}</strong><small>{{ statusText[orders.find(order=>order.plate===selectedClient.plate && order.status!=='done').status] }}</small><button @click="openOrder(orders.find(order=>order.plate===selectedClient.plate && order.status!=='done'))">{{ clientText.openRepair }} →</button></div><div class="history"><h3>{{ clientText.history }}</h3><p v-for="item in selectedClient.history" :key="item">{{ item }}</p></div><a class="secondary full action-link" :href="`tel:${selectedClient.phone.replaceAll(' ','')}`">☎ {{ clientText.call }}</a><button class="primary full" @click="openNewOrder(selectedClient)">＋ {{ t('newOrder') }}</button></aside></div>

    <div v-if="showNewOrder" class="overlay" @click.self="showNewOrder=false"><form class="modal" @submit.prevent="createOrder"><button type="button" class="x" @click="showNewOrder=false">×</button><p class="eyebrow">IKARS · CRM</p><h2>{{ t('newOrder') }}</h2><label>{{ t('name') }}<input name="client" :value="draftClient?.name || 'Roberts Liepa'" required></label><label>{{ t('car') }}<input name="car" :value="draftClient?.car || 'Audi A4'" required></label><label>{{ t('plate') }}<input name="plate" :value="draftClient?.plate || 'RL-2026'" required></label><label>{{ t('vin') }}<input name="vin" :value="draftClient?.vin || ''" placeholder="17"></label><label>{{ t('mileage') }}<input name="mileage" type="number" min="0" :value="draftClient?.mileage || ''"></label><label>{{ t('service') }}<input name="service" value="Diagnostika" required></label><button class="primary full">{{ t('create') }}</button></form></div>
        <div v-if="lightbox" class="overlay lightbox" @click.self="closePhoto"><figure><img :src="lightbox.fullUrl" :alt="t('photoView')"><figcaption>{{ t('tag' + lightbox.tag.charAt(0).toUpperCase() + lightbox.tag.slice(1)) }} · {{ lightbox.time }}</figcaption><button type="button" class="x" @click="closePhoto">×</button></figure></div>

<div v-if="toast" class="toast">✓ {{ toast }}</div>
  </div>
</template>

<script>
const OrderTable = {
  props: ['orders', 'statusText'], emits: ['open'],
  template: `<div class="order-table"><button v-for="order in orders" :key="order.id" @click="$emit('open',order)"><time>{{ order.time }}</time><span><strong>{{ order.car }} · {{ order.plate }}</strong><small>{{ order.client }} · {{ order.service }}</small></span><em :class="['status',order.status]">{{ statusText[order.status] }}</em><b>€{{ order.labor + order.parts }}</b><i>›</i></button></div>`,
}
export default { components: { OrderTable } }
</script>
