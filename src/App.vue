<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import logo from './assets/logo/ikars-logo.svg'
import { dataset as lvSet } from './demo-data'
import { dataset as bgSet } from './demo-data-bg'
import VehicleSection from './components/VehicleSection.vue'
import VehicleDrawer from './components/VehicleDrawer.vue'
import BookingCalendar from './components/BookingCalendar.vue'
import OrderTable from './components/OrderTable.vue'
import PhotoStrip from './components/PhotoStrip.vue'
import { groupVehicles, decodeVin, vehicleKey } from './lib/vehicles'
import { translateWork, translatePart, translateHistoryLine, canonicalWork } from './lib/catalog'
import { makePhotoSet } from './lib/image'
import { allPhotos, photosForVehicle, photosForVisit, savePhoto, deletePhoto, clearPhotos } from './lib/photos'
import { addDays, formatDate, formatLong, parseDate, toIso } from './lib/dates'

const q = new URLSearchParams(window.location.search)
const savedLang = localStorage.getItem('autoserwis-lang')
const initialLang = ['en', 'lv', 'ru', 'bg'].includes(q.get('lang')) ? q.get('lang') : (['en', 'lv', 'ru', 'bg'].includes(savedLang) ? savedLang : 'lv')
const lang = ref(initialLang)
// Demo data follows the language: a Bulgarian visitor sees a workshop in Sofia.
const SETS = { lv: lvSet, bg: bgSet }
const setKey = (language) => (language === 'bg' ? 'bg' : 'lv')
const activeSet = ref(setKey(initialLang))
const demo = computed(() => SETS[activeSet.value])
const section = ref(['dashboard', 'calendar', 'vehicles', 'orders', 'clients', 'stock', 'reports', 'log'].includes(q.get('section')) ? q.get('section') : 'dashboard')
const STORAGE_KEY = 'autoserwis-demo-v1'
const savedState = loadState(activeSet.value)
const orders = ref(savedState?.orders?.length ? savedState.orders : structuredClone(demo.value.initialOrders))
// Bookings, the per-vehicle maintenance schedule and the message log live next to the orders.
const bookings = ref(savedState?.bookings || structuredClone(demo.value.bookings || []))
const maintenance = ref(savedState?.maintenance || structuredClone(demo.value.maintenance || {}))
const messages = ref(savedState?.messages || [])
const selected = ref(null)
const selectedClient = ref(null)
const draftClient = ref(null)
const toast = ref('')
const showNewOrder = ref(false)

const copy = {
  lv: { demo: 'DEMONSTRĀCIJAS REŽĪMS', shopLine: 'Rīga · Demo autoserviss', scanTitle: 'Foto uzņemšana', scanLead: 'Nofotografējiet numurzīmi vai VIN uzlīmi', scanPlate: 'Numurzīme', scanVin: 'VIN uzlīme', scanHint: 'Atpazīšana notiek pārlūkā — attēls netiek sūtīts uz serveri.', scanBusy: 'Atpazīstam', scanConfidence: 'ticamība', scanBarcode: 'svītrkods', scanNothing: 'Neizdevās nolasīt — ievadiet manuāli.', scanFailed: 'Attēlu neizdevās apstrādāt.', scanNotFound: 'Automašīna nav datubāzē', scanEngineLocal: 'atpazīšana pārlūkā · bez maksas', scanLowConfidence: 'Nolasīts nedroši — pārbaudiet vai izvēlieties variantu', clockLabel: 'Demos datums', clockHint: 'Laika pārbīde demonstrācijai — redzams, kam tuvākajās nedēļās beidzas tehniskā apskate', clockBack: 'Atpakaļ laikā', clockForward: 'Uz priekšu laikā', clockToday: 'Atgriezt demonstrācijas sākumu', maintenanceTitle: 'Regulārais plāns', maintenanceEmpty: 'Regulārais plāns vēl nav aizpildīts', maintFill: 'Aizpildīt', maintEdit: 'Mainīt', maintSave: 'Saglabāt', maintCancel: 'Atcelt', maintGti: 'Tehniskā apskate', maintGtiShort: 'TA', maintInsurance: 'Civiltiesiskā apdrošināšana', maintInsuranceShort: 'CTO', maintVignette: 'Vinjete', maintService: 'Regulārā apkope', maintServiceShort: 'Apkope', maintCategory: 'Kategorija', maintFirstReg: 'Pirmā reģistrācija', maintIntervalKm: 'Apkopes intervāls, km', maintIntervalMonths: 'Intervāls, mēneši', maintLastServiceKm: 'Pēdējā apkope, km', maintLastServiceDate: 'Pēdējās apkopes datums', maintNextInspection: 'Nākamā tehniskā apskate', maintLeft: 'Atlicis', maintOverdue: 'Nokavēts par', maintOverdueState: 'Nokavēts', maintDaysUnit: 'd.', maintForecast: 'prognoze', maintSoon: 'Drīz', maintUrgent: 'Steidzami', maintOk: 'Kārtībā', scanKnownBase: 'Atrasts datubāzē', scanRaw: 'Nolasīts', scanTips: 'Fotografējiet no 1–2 m — numuram jāaizņem trešdaļa kadra, taisni un dienas gaismā. VIN — svītrkods uz uzlīmes.', calendar: 'Grafiks', calTitle: 'Pieņemšanas grafiks', calToday: 'Šodien', calDay: 'Diena', calWeek: 'Nedēļa', calTime: 'Laiks', calNew: 'Jauns pieraksts', calEdit: 'Labot', calBooking: 'Pieraksts', calDate: 'Datums', calStart: 'Sākums', calMinutes: 'Minūtes', calType: 'Darba veids', calResource: 'Postenis', calStatus: 'Statuss', calPhone: 'Tālrunis', calNote: 'Piezīme', calDelete: 'Dzēst', calEmpty: 'Brīvs', calClosed: 'Slēgts', calWaitlist: 'Gaida rindu', calWaitlistEmpty: 'Nav pieteikumu', calNoTime: 'Bez laika', calConflict: 'Postenis ir aizņemts', calLoadDay: 'Noslodze (diena)', calMinutesShort: 'min', calToOrder: 'Izveidot darba uzdevumu', calExported: 'Fails lejupielādēts', typeGti: 'Tehniskā apskate', typeService: 'Apkope', typeDiagnostics: 'Diagnostika', typeRepair: 'Remonts', typeTyres: 'Riepas', resGti: 'TA līnija', resBay1: 'Kanāls 1', resBay2: 'Kanāls 2', resTyres: 'Riepas', stRequest: 'Pieteikums', stConfirmed: 'Apstiprināts', stArrived: 'Ieradies', stInWork: 'Darbā', stDone: 'Gatavs', stNoShow: 'Neieradās', stCancelled: 'Atcelts', chipGti: 'TA', chipBay1: '1', chipBay2: '2', chipTyres: '🛞', chipAll: 'Visi posteņi', demoNote: 'Droši izmēģiniet — izmaiņas paliek šajā pārlūkā.', dashboard: 'Vadības panelis', orders: 'Darba uzdevumi', clients: 'Klienti', stock: 'Noliktava', reports: 'Pārskati', log: 'Darbību žurnāls', today: 'Šodien servisā', revenue: 'Šodienas apgrozījums', ready: 'Gatavi izsniegšanai', low: 'Jāpapildina noliktavā', recent: 'Aktuālie darba uzdevumi', newOrder: 'Jauns pieraksts', order: 'Darba uzdevums', client: 'Klients', car: 'Automobilis', service: 'Darbs', master: 'Meistars', total: 'Kopā', payment: 'Apmaksa', unpaid: 'Nav apmaksāts', paid: 'Apmaksāts', next: 'Mainīt statusu', markPaid: 'Atzīmēt kā apmaksātu', close: 'Aizvērt', allClients: 'Klienti un automobiļi', visits: 'Vizītes', parts: 'Rezerves daļas', quantity: 'Atlikums', purchase: 'Iepirkums', sale: 'Pārdošana', analytics: 'Servisa rezultāti', reset: 'Atjaunot demo datus', contact: 'Uzzināt par IKARS', created: 'Jauns darba uzdevums izveidots', saved: 'Izmaiņas saglabātas demonstrācijā', name: 'Vārds, uzvārds', plate: 'Valsts numurs', create: 'Izveidot pierakstu', vehicles: 'Automobiļi', vehiclesTitle: 'Automobiļi un to vēsture', vehiclesSearch: 'Meklēt numuru, VIN, klientu vai tālruni', vehiclesHint: 'Ievadiet valsts numuru vai VIN — atvērsies visa vizīšu vēsture.', vehiclesVinFound: 'VIN atpazīts — meklējam vēsturi…', vehiclesNothing: 'Nekas nav atrasts', vehiclesEmpty: 'Vēl nav neviena automobiļa', vehicleCard: 'Automobiļa kartīte', carUnknown: 'Automobilis nav norādīts', vin: 'VIN', vinInvalid: 'VIN jābūt 17 rakstzīmēm (bez I, O, Q)', vinDecode: 'Noteikt marku pēc VIN', vinDecoding: 'Noskaidrojam…', vinAgain: 'Meklēt vēlreiz', vinNothing: 'Pēc VIN dati nav atrasti', mileage: 'Nobraukums', sinceLastVisit: 'kopš pēdējās vizītes', spentAll: 'Kopā par remontiem', debt: 'Parāds', photos: 'Fotogrāfijas', addPhoto: 'Pievienot foto', photoSaving: 'Saglabājam…', photoView: 'Atvērt foto', deletePhoto: 'Dzēst foto', photoSaved: 'Foto pievienots automobiļa vēsturei', photoFailed: 'Fotogrāfiju neizdevās saglabāt', tagGeneral: 'Vispārīgi', tagBefore: 'Pirms', tagAfter: 'Pēc', tagDamage: 'Bojājums', tagPart: 'Detaļa', vehicleHistory: 'Remontu vēsture', historyEmpty: 'Vēstures vēl nav', openVehicle: 'Atvērt automobili', openOrder: 'Atvērt darba uzdevumu', currentRepair: 'Aktuālais remonts', callClient: 'Zvanīt klientam', inWork: 'darbā' },
  ru: { demo: 'ДЕМОНСТРАЦИОННЫЙ РЕЖИМ', shopLine: 'Рига · Демо автосервис', scanTitle: 'Фото-приём', scanLead: 'Сфотографируйте номер или VIN-наклейку', scanPlate: 'Номер авто', scanVin: 'VIN-наклейка', scanHint: 'Распознавание идёт в браузере — снимок не уходит на сервер.', scanBusy: 'Распознаём', scanConfidence: 'уверенность', scanBarcode: 'штрихкод', scanNothing: 'Не удалось прочитать — введите вручную.', scanFailed: 'Не удалось обработать снимок.', scanNotFound: 'Машины нет в базе', scanEngineLocal: 'распознавание в браузере · бесплатно', scanLowConfidence: 'Прочитано неуверенно — проверьте или выберите вариант', clockLabel: 'Демо-дата', clockHint: 'Перемотка времени в демо — видно, у кого в ближайшие недели заканчивается техосмотр', clockBack: 'Назад во времени', clockForward: 'Вперёд во времени', clockToday: 'Вернуть начало демо', maintenanceTitle: 'Регламент', maintenanceEmpty: 'Регламент ещё не заполнен', maintFill: 'Заполнить', maintEdit: 'Изменить', maintSave: 'Сохранить', maintCancel: 'Отмена', maintGti: 'Техосмотр', maintGtiShort: 'ГТП', maintInsurance: 'Гражданская ответственность', maintInsuranceShort: 'Страховка', maintVignette: 'Винетка', maintService: 'Регламентное ТО', maintServiceShort: 'ТО', maintCategory: 'Категория', maintFirstReg: 'Первая регистрация', maintIntervalKm: 'Интервал ТО, км', maintIntervalMonths: 'Интервал, месяцев', maintLastServiceKm: 'Последнее ТО, км', maintLastServiceDate: 'Дата последнего ТО', maintNextInspection: 'Следующий техосмотр', maintLeft: 'Осталось', maintOverdue: 'Просрочено на', maintOverdueState: 'Просрочено', maintDaysUnit: 'дн.', maintForecast: 'прогноз', maintSoon: 'Скоро', maintUrgent: 'Срочно', maintOk: 'В порядке', scanKnownBase: 'Найдено в базе', scanRaw: 'Прочитано', scanTips: 'Снимайте с 1–2 м: номер должен занимать треть кадра, ровно и при свете. VIN — штрихкод на наклейке.', calendar: 'График', calTitle: 'График приёма', calToday: 'Сегодня', calDay: 'День', calWeek: 'Неделя', calTime: 'Время', calNew: 'Новая запись', calEdit: 'Изменить', calBooking: 'Запись', calDate: 'Дата', calStart: 'Начало', calMinutes: 'Минуты', calType: 'Вид работ', calResource: 'Пост', calStatus: 'Статус', calPhone: 'Телефон', calNote: 'Заметка', calDelete: 'Удалить', calEmpty: 'Свободно', calClosed: 'Закрыто', calWaitlist: 'Ожидают', calWaitlistEmpty: 'Заявок нет', calNoTime: 'Без времени', calConflict: 'Пост занят', calLoadDay: 'Загрузка (день)', calMinutesShort: 'мин', calToOrder: 'Создать наряд', calExported: 'Файл скачан', typeGti: 'Техосмотр', typeService: 'ТО', typeDiagnostics: 'Диагностика', typeRepair: 'Ремонт', typeTyres: 'Шины', resGti: 'Линия ГТП', resBay1: 'Канал 1', resBay2: 'Канал 2', resTyres: 'Шины', stRequest: 'Заявка', stConfirmed: 'Подтверждён', stArrived: 'Приехал', stInWork: 'В работе', stDone: 'Готов', stNoShow: 'Не приехал', stCancelled: 'Отменён', chipGti: 'Г', chipBay1: '1', chipBay2: '2', chipTyres: '🛞', chipAll: 'Все посты', demoNote: 'Пробуйте свободно — изменения сохраняются в этом браузере.', dashboard: 'Панель управления', orders: 'Заказ-наряды', clients: 'Клиенты', stock: 'Склад', reports: 'Отчёты', log: 'Журнал действий', today: 'Сегодня в сервисе', revenue: 'Выручка сегодня', ready: 'Готовы к выдаче', low: 'Нужно пополнить', recent: 'Текущие заказ-наряды', newOrder: 'Новая запись', order: 'Заказ-наряд', client: 'Клиент', car: 'Автомобиль', service: 'Работы', master: 'Мастер', total: 'Итого', payment: 'Оплата', unpaid: 'Не оплачено', paid: 'Оплачено', next: 'Изменить статус', markPaid: 'Отметить оплаченным', close: 'Закрыть', allClients: 'Клиенты и автомобили', visits: 'Визиты', parts: 'Запасные части', quantity: 'Остаток', purchase: 'Закупка', sale: 'Продажа', analytics: 'Результаты сервиса', reset: 'Восстановить демо-данные', contact: 'Узнать об IKARS', created: 'Новый заказ-наряд создан', saved: 'Изменения сохранены в демоверсии', name: 'Имя и фамилия', plate: 'Госномер', create: 'Создать запись', vehicles: 'Автомобили', vehiclesTitle: 'Автомобили и их история', vehiclesSearch: 'Поиск по номеру, VIN, клиенту или телефону', vehiclesHint: 'Введите госномер или VIN — откроется вся история визитов.', vehiclesVinFound: 'VIN распознан — ищем историю…', vehiclesNothing: 'Ничего не найдено', vehiclesEmpty: 'Пока нет ни одного автомобиля', vehicleCard: 'Карточка автомобиля', carUnknown: 'Автомобиль не указан', vin: 'VIN', vinInvalid: 'В VIN должно быть 17 символов (без I, O, Q)', vinDecode: 'Определить марку по VIN', vinDecoding: 'Определяем…', vinAgain: 'Найти ещё раз', vinNothing: 'По этому VIN данных не нашли', mileage: 'Пробег', sinceLastVisit: 'с прошлого визита', spentAll: 'Всего за ремонты', debt: 'Задолженность', photos: 'Фотографии', addPhoto: 'Добавить фото', photoSaving: 'Сохраняем…', photoView: 'Открыть фото', deletePhoto: 'Удалить фото', photoSaved: 'Фото добавлено в историю автомобиля', photoFailed: 'Не удалось сохранить фото', tagGeneral: 'Общее', tagBefore: 'До', tagAfter: 'После', tagDamage: 'Повреждение', tagPart: 'Запчасть', vehicleHistory: 'История ремонтов', historyEmpty: 'Истории пока нет', openVehicle: 'Открыть автомобиль', openOrder: 'Открыть заказ-наряд', currentRepair: 'Текущий ремонт', callClient: 'Позвонить клиенту', inWork: 'в работе' },
  en: { demo: 'DEMONSTRATION MODE', shopLine: 'Riga · Demo workshop', scanTitle: 'Photo intake', scanLead: 'Take a photo of the plate or the VIN sticker', scanPlate: 'Number plate', scanVin: 'VIN sticker', scanHint: 'Recognition runs in the browser — the photo is never uploaded.', scanBusy: 'Reading', scanConfidence: 'confidence', scanBarcode: 'barcode', scanNothing: 'Nothing readable — type it in.', scanFailed: 'The photo could not be processed.', scanNotFound: 'No such car in the database', scanEngineLocal: 'in-browser recognition · free', scanLowConfidence: 'Read with low confidence — check it or pick a suggestion', clockLabel: 'Demo date', clockHint: 'Time travel in the demo — see whose inspection runs out in the coming weeks', clockBack: 'Back in time', clockForward: 'Forward in time', clockToday: 'Back to the demo start', maintenanceTitle: 'Maintenance schedule', maintenanceEmpty: 'The maintenance schedule is not filled in yet', maintFill: 'Fill in', maintEdit: 'Edit', maintSave: 'Save', maintCancel: 'Cancel', maintGti: 'Technical inspection', maintGtiShort: 'Inspection', maintInsurance: 'Liability insurance', maintInsuranceShort: 'Insurance', maintVignette: 'Vignette', maintService: 'Regular service', maintServiceShort: 'Service', maintCategory: 'Category', maintFirstReg: 'First registration', maintIntervalKm: 'Service interval, km', maintIntervalMonths: 'Interval, months', maintLastServiceKm: 'Last service, km', maintLastServiceDate: 'Last service date', maintNextInspection: 'Next inspection', maintLeft: 'Left', maintOverdue: 'Overdue by', maintOverdueState: 'Overdue', maintDaysUnit: 'days', maintForecast: 'forecast', maintSoon: 'Soon', maintUrgent: 'Urgent', maintOk: 'OK', scanKnownBase: 'Matched in the database', scanRaw: 'Read as', scanTips: 'Shoot from 1–2 m: the plate should fill a third of the frame, straight and in daylight. VIN — the barcode on the sticker.', calendar: 'Schedule', calTitle: 'Intake schedule', calToday: 'Today', calDay: 'Day', calWeek: 'Week', calTime: 'Time', calNew: 'New booking', calEdit: 'Edit', calBooking: 'Booking', calDate: 'Date', calStart: 'Start', calMinutes: 'Minutes', calType: 'Job type', calResource: 'Bay', calStatus: 'Status', calPhone: 'Phone', calNote: 'Note', calDelete: 'Delete', calEmpty: 'Free', calClosed: 'Closed', calWaitlist: 'Waiting list', calWaitlistEmpty: 'No requests', calNoTime: 'Without time', calConflict: 'Bay is busy', calLoadDay: 'Load (day)', calMinutesShort: 'min', calToOrder: 'Create work order', calExported: 'File downloaded', typeGti: 'Inspection', typeService: 'Service', typeDiagnostics: 'Diagnostics', typeRepair: 'Repair', typeTyres: 'Tyres', resGti: 'Inspection line', resBay1: 'Bay 1', resBay2: 'Bay 2', resTyres: 'Tyres', stRequest: 'Request', stConfirmed: 'Confirmed', stArrived: 'Arrived', stInWork: 'In progress', stDone: 'Done', stNoShow: 'No-show', stCancelled: 'Cancelled', chipGti: 'IN', chipBay1: '1', chipBay2: '2', chipTyres: '🛞', chipAll: 'All bays', demoNote: 'Explore freely — changes stay in this browser.', dashboard: 'Dashboard', orders: 'Work orders', clients: 'Clients', stock: 'Inventory', reports: 'Reports', log: 'Activity log', today: 'In service today', revenue: 'Revenue today', ready: 'Ready for pickup', low: 'Low stock items', recent: 'Current work orders', newOrder: 'New booking', order: 'Work order', client: 'Client', car: 'Vehicle', service: 'Service', master: 'Technician', total: 'Total', payment: 'Payment', unpaid: 'Unpaid', paid: 'Paid', next: 'Change status', markPaid: 'Mark as paid', close: 'Close', allClients: 'Clients and vehicles', visits: 'Visits', parts: 'Spare parts', quantity: 'Stock', purchase: 'Purchase', sale: 'Sale', analytics: 'Service performance', reset: 'Reset demo data', contact: 'Learn about IKARS', created: 'New work order created', saved: 'Changes saved in the demo', name: 'Full name', plate: 'Registration', create: 'Create booking', vehicles: 'Vehicles', vehiclesTitle: 'Vehicles and their history', vehiclesSearch: 'Search by plate, VIN, client or phone', vehiclesHint: 'Type a plate or VIN — the whole visit history opens.', vehiclesVinFound: 'VIN detected — looking up the history…', vehiclesNothing: 'Nothing found', vehiclesEmpty: 'No vehicles yet', vehicleCard: 'Vehicle card', carUnknown: 'Vehicle not specified', vin: 'VIN', vinInvalid: 'VIN must be 17 characters (no I, O, Q)', vinDecode: 'Identify model by VIN', vinDecoding: 'Looking up…', vinAgain: 'Look up again', vinNothing: 'No data found for this VIN', mileage: 'Mileage', sinceLastVisit: 'since the last visit', spentAll: 'Total for repairs', debt: 'Outstanding', photos: 'Photos', addPhoto: 'Add photo', photoSaving: 'Saving…', photoView: 'Open photo', deletePhoto: 'Delete photo', photoSaved: 'Photo added to the vehicle history', photoFailed: 'Could not save the photo', tagGeneral: 'General', tagBefore: 'Before', tagAfter: 'After', tagDamage: 'Damage', tagPart: 'Part', vehicleHistory: 'Service history', historyEmpty: 'No history yet', openVehicle: 'Open vehicle', openOrder: 'Open work order', currentRepair: 'Current repair', callClient: 'Call client', inWork: 'in work' },
  bg: { demo: 'ДЕМО РЕЖИМ', shopLine: 'София · Демо автосервис', scanTitle: 'Фото прием', scanLead: 'Снимайте регистрационния номер или VIN стикера', scanPlate: 'Регистрационен номер', scanVin: 'VIN стикер', scanHint: 'Разпознаването става в браузъра — снимката не се качва.', scanBusy: 'Разпознаваме', scanConfidence: 'увереност', scanBarcode: 'баркод', scanNothing: 'Не се разчете — въведете ръчно.', scanFailed: 'Снимката не можа да се обработи.', scanNotFound: 'Няма такъв автомобил в базата', scanEngineLocal: 'разпознаване в браузъра · безплатно', scanLowConfidence: 'Разчетено с ниска увереност — проверете или изберете вариант', clockLabel: 'Демо дата', clockHint: 'Преместване на времето в демото — вижда се на кого скоро изтича ГТП', clockBack: 'Назад във времето', clockForward: 'Напред във времето', clockToday: 'Върни началото на демото', maintenanceTitle: 'Регламент', maintenanceEmpty: 'Регламентът още не е попълнен', maintFill: 'Попълни', maintEdit: 'Промени', maintSave: 'Запази', maintCancel: 'Отказ', maintGti: 'Годишен технически преглед', maintGtiShort: 'ГТП', maintInsurance: 'Гражданска отговорност', maintInsuranceShort: 'ГО', maintVignette: 'Винетка', maintService: 'Редовно обслужване', maintServiceShort: 'ТО', maintCategory: 'Категория', maintFirstReg: 'Първа регистрация', maintIntervalKm: 'Интервал ТО, км', maintIntervalMonths: 'Интервал, месеци', maintLastServiceKm: 'Последно ТО, км', maintLastServiceDate: 'Дата на последното ТО', maintNextInspection: 'Следващ ГТП', maintLeft: 'Остават', maintOverdue: 'Просрочено с', maintOverdueState: 'Просрочено', maintDaysUnit: 'дни', maintForecast: 'прогноза', maintSoon: 'Скоро', maintUrgent: 'Спешно', maintOk: 'ОК', scanKnownBase: 'Открит в базата', scanRaw: 'Разчетено', scanTips: 'Снимайте от 1–2 м: номерът да заема една трета от кадъра, право и на дневна светлина. VIN — баркодът на стикера.', calendar: 'График', calTitle: 'График на приема', calToday: 'Днес', calDay: 'Ден', calWeek: 'Седмица', calTime: 'Час', calNew: 'Нов запис', calEdit: 'Промяна', calBooking: 'Запис', calDate: 'Дата', calStart: 'Начало', calMinutes: 'Минути', calType: 'Вид работа', calResource: 'Пост', calStatus: 'Статус', calPhone: 'Телефон', calNote: 'Бележка', calDelete: 'Изтрий', calEmpty: 'Свободно', calClosed: 'Затворено', calWaitlist: 'Изчакващи', calWaitlistEmpty: 'Няма заявки', calNoTime: 'Без час', calConflict: 'Постът е зает', calLoadDay: 'Натоварване (ден)', calMinutesShort: 'мин', calToOrder: 'Създай поръчка', calExported: 'Файлът е изтеглен', typeGti: 'ГТП', typeService: 'ТО', typeDiagnostics: 'Диагностика', typeRepair: 'Ремонт', typeTyres: 'Гуми', resGti: 'Линия ГТП', resBay1: 'Канал 1', resBay2: 'Канал 2', resTyres: 'Гуми', stRequest: 'Заявка', stConfirmed: 'Потвърден', stArrived: 'Пристигнал', stInWork: 'В работа', stDone: 'Готов', stNoShow: 'Не дойде', stCancelled: 'Отменен', chipGti: 'Г', chipBay1: '1', chipBay2: '2', chipTyres: '🛞', chipAll: 'Всички постове', demoNote: 'Разгледайте свободно — данните се запазват в браузъра.', dashboard: 'Табло', orders: 'Работни поръчки', clients: 'Клиенти', stock: 'Склад', reports: 'Отчети', log: 'Дневник на действията', today: 'Днес в сервиза', revenue: 'Оборот днес', ready: 'Готови за предаване', low: 'Нужно е зареждане', recent: 'Текущи поръчки', newOrder: 'Нов запис', order: 'Поръчка', client: 'Клиент', car: 'Автомобил', service: 'Работа', master: 'Майстор', total: 'Общо', payment: 'Плащане', unpaid: 'Неплатено', paid: 'Платено', next: 'Промени статуса', markPaid: 'Отбележи като платено', close: 'Затвори', allClients: 'Клиенти и автомобили', visits: 'Посещения', parts: 'Резервни части', quantity: 'Наличност', purchase: 'Доставна', sale: 'Продажна', analytics: 'Резултати на сервиза', reset: 'Възстанови демо данните', contact: 'Научете за IKARS', created: 'Създадена е нова поръчка', saved: 'Промените са запазени в демото', name: 'Име и фамилия', plate: 'Регистрационен номер', create: 'Създай запис', vehicles: 'Автомобили', vehiclesTitle: 'Автомобили и тяхната история', vehiclesSearch: 'Търсене по номер, VIN, клиент или телефон', vehiclesHint: 'Въведете регистрационен номер или VIN — ще се отвори цялата история на посещенията.', vehiclesVinFound: 'VIN е разпознат — търсим историята…', vehiclesNothing: 'Нищо не е намерено', vehiclesEmpty: 'Още няма нито един автомобил', vehicleCard: 'Карта на автомобила', carUnknown: 'Автомобилът не е указан', vin: 'VIN', vinInvalid: 'VIN трябва да е 17 знака (без I, O, Q)', vinDecode: 'Определи марката по VIN', vinDecoding: 'Проверяваме…', vinAgain: 'Търси отново', vinNothing: 'За този VIN няма намерени данни', mileage: 'Пробег', sinceLastVisit: 'от последното посещение', spentAll: 'Общо за ремонти', debt: 'Задължение', photos: 'Снимки', addPhoto: 'Добави снимка', photoSaving: 'Запазваме…', photoView: 'Отвори снимката', deletePhoto: 'Изтрий снимката', photoSaved: 'Снимката е добавена към историята на автомобила', photoFailed: 'Снимката не можа да бъде запазена', tagGeneral: 'Общо', tagBefore: 'Преди', tagAfter: 'След', tagDamage: 'Повреда', tagPart: 'Част', vehicleHistory: 'История на ремонтите', historyEmpty: 'Още няма история', openVehicle: 'Отвори автомобила', openOrder: 'Отвори поръчката', currentRepair: 'Текущ ремонт', callClient: 'Обади се на клиента', inWork: 'в работа' },
}

const t = (key) => copy[lang.value][key] || key
const localeTag = computed(() => ({ lv: 'lv-LV', ru: 'ru-RU', en: 'en-GB', bg: 'bg-BG' }[lang.value] || 'lv-LV'))

const DEMO_START = '2026-09-30'
const CLOCK_KEY = 'autoserwis-demo-clock'

const demoTodayIso = ref(toIso(q.get('date') || localStorage.getItem(CLOCK_KEY)) || DEMO_START)
const demoToday = computed(() => parseDate(demoTodayIso.value))
const demoTodayText = computed(() => formatDate(demoToday.value))
const demoTodayLong = computed(() => formatLong(demoToday.value, localeTag.value))

function shiftDemoDate(days) {
  demoTodayIso.value = toIso(addDays(demoToday.value, days)) || DEMO_START
}
function resetDemoDate() { demoTodayIso.value = DEMO_START }

// ---- график приёма: вид, период и связь записи с нарядом ----
const bookingView = ref(q.get('calendar') === 'day' ? 'day' : 'week')
const bookingAnchor = ref(demoTodayText.value)
const pendingBooking = ref(null)
const printSheet = () => window.print()
watch(demoTodayText, (value) => { bookingAnchor.value = value }, { immediate: true })

watch(demoTodayIso, (iso) => {
  try { localStorage.setItem(CLOCK_KEY, iso) } catch { /* storage full */ }
  const url = new URL(window.location.href)
  url.searchParams.set('date', iso)
  window.history.replaceState({}, '', url)
}, { immediate: true })
const L = (value) => translateWork(value, lang.value)
const ordersView = computed(() => orders.value.map((order) => ({ ...order, service: L(order.service) })))
const clientsView = computed(() => demo.value.clients.map((client) => ({ ...client, history: client.history.map((line) => translateHistoryLine(line, lang.value)) })))
const inventoryView = computed(() => demo.value.inventory.map((part) => ({ ...part, name: translatePart(part.name, lang.value) })))
const clientText = computed(() => ({
  profile: lang.value === 'lv' ? 'Klienta kartīte' : lang.value === 'ru' ? 'Карточка клиента' : lang.value === 'bg' ? 'Карта на клиента' : 'Client profile',
  current: lang.value === 'lv' ? 'Aktuālais remonts' : lang.value === 'ru' ? 'Текущий ремонт' : lang.value === 'bg' ? 'Текущ ремонт' : 'Current repair',
  history: lang.value === 'lv' ? 'Remontu vēsture' : lang.value === 'ru' ? 'История ремонтов' : lang.value === 'bg' ? 'История на ремонтите' : 'Service history',
  spent: lang.value === 'lv' ? 'Kopā samaksāts' : lang.value === 'ru' ? 'Оплачено всего' : lang.value === 'bg' ? 'Платено общо' : 'Total paid',
  debt: lang.value === 'lv' ? 'Neapmaksāts' : lang.value === 'ru' ? 'Задолженность' : lang.value === 'bg' ? 'Задължение' : 'Outstanding',
  noDebt: lang.value === 'lv' ? 'Parādu nav' : lang.value === 'ru' ? 'Задолженности нет' : lang.value === 'bg' ? 'Няма задължения' : 'No outstanding balance',
  call: lang.value === 'lv' ? 'Zvanīt klientam' : lang.value === 'ru' ? 'Позвонить клиенту' : lang.value === 'bg' ? 'Обади се на клиента' : 'Call client',
  openRepair: lang.value === 'lv' ? 'Atvērt darba uzdevumu' : lang.value === 'ru' ? 'Открыть заказ-наряд' : lang.value === 'bg' ? 'Отвори поръчката' : 'Open work order',
}))
const statuses = ['waiting', 'work', 'ready', 'done']
const statusText = computed(() => ({
  waiting: lang.value === 'lv' ? 'Gaida' : lang.value === 'ru' ? 'Ожидает' : lang.value === 'bg' ? 'Чака' : 'Waiting',
  work: lang.value === 'lv' ? 'Darbā' : lang.value === 'ru' ? 'В работе' : lang.value === 'bg' ? 'В работа' : 'In progress',
  ready: lang.value === 'lv' ? 'Gatavs' : lang.value === 'ru' ? 'Готов' : lang.value === 'bg' ? 'Готов' : 'Ready',
  done: lang.value === 'lv' ? 'Pabeigts' : lang.value === 'ru' ? 'Завершён' : lang.value === 'bg' ? 'Приключен' : 'Completed',
}))
const todayOrders = computed(() => orders.value.filter((item) => item.date === demoTodayText.value))
const revenue = computed(() => orders.value.filter((item) => item.paid).reduce((sum, item) => sum + item.labor + item.parts, 0))
const readyCount = computed(() => orders.value.filter((item) => item.status === 'ready').length)
const lowStock = computed(() => demo.value.inventory.filter((item) => item.qty <= item.min).length)
const totalOpen = computed(() => orders.value.filter((item) => item.status !== 'done').reduce((sum, item) => sum + item.labor + item.parts, 0))
const logs = ref(demo.value.logs.map((entry) => ({ ...entry })))

const logText = (entry) => {
  const translations = {
    bg: {
      status: `${entry.id} · статусът е променен на „${statusText.value[entry.status]}“`,
      diagnostic: `${entry.id} · добавена диагностика`,
      created: `${entry.id} · създадена поръчка`,
      reserved: `${entry.id} · резервирана ${entry.quantity} част`,
      payment: `${entry.id} · получено плащане`,
    },
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
const vehicles = computed(() => groupVehicles(ordersView.value))
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

function loadState(code) {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if (!parsed || (parsed.set && parsed.set !== code)) return null
    return parsed
  } catch { return null }
}

function persistDemo() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      set: activeSet.value,
      orders: orders.value,
      bookings: bookings.value,
      maintenance: maintenance.value,
      messages: messages.value,
    }))
  } catch { /* storage full */ }
}

watch([orders, bookings, maintenance, messages], persistDemo, { deep: true })

// lv / ru / en share the Riga set, Bulgarian switches to the Sofia set (and back).
watch(lang, (value) => {
  const next = setKey(value)
  if (next === activeSet.value) return
  activeSet.value = next
  orders.value = structuredClone(demo.value.initialOrders)
  bookings.value = structuredClone(demo.value.bookings || [])
  maintenance.value = structuredClone(demo.value.maintenance || {})
  messages.value = []
  logs.value = demo.value.logs.map((entry) => ({ ...entry }))
  selected.value = null
  selectedClient.value = null
  selectedVehicle.value = null
  visitPhotos.value = []
  notify(t('saved'))
})

function withUrls(records) {
  return [...records]
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
    .map((record) => ({
      ...record,
      time: new Date(record.createdAt).toLocaleString(localeTag.value, { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
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

// Регламент на выбранной машине: ГТП по Н-32, страховка, винетка и интервал ТО.
const selectedMaintenance = computed(() => (selectedVehicle.value ? maintenance.value[selectedVehicle.value.key] || null : null))
function saveMaintenance(record) {
  if (!selectedVehicle.value) return
  maintenance.value = { ...maintenance.value, [selectedVehicle.value.key]: record }
  notify(t('saved'))
}
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
  const wanted = String(preselect).trim().toUpperCase()
  const flat = wanted.replace(/[^A-Z0-9]/g, '')
  const found = vehicles.value.find((vehicle) => [vehicle.plate, vehicle.vin].some((value) => {
    const text = String(value || '').toUpperCase()
    return text === wanted || (flat.length > 3 && text.replace(/[^A-Z0-9]/g, '') === flat)
  }))
  if (found) openVehicle(found)
}

const notify = (message) => {
  toast.value = message
  window.clearTimeout(notify.timer)
  notify.timer = window.setTimeout(() => { toast.value = '' }, 3500)
}
const openOrder = async (order) => {
  const source = orders.value.find((item) => item.id === order.id) || order
  selectedClient.value = null
  selectedVehicle.value = null
  selected.value = source
  visitPhotos.value = withUrls(await photosForVisit(source.id))
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
    id: `WO-${demo.value.orderBase + orders.value.length + 1}`,
    date: demoTodayText.value, time: '16:00', client: form.get('client'), phone: demo.value.newPhone,
    car: form.get('car'), plate: form.get('plate'), service: canonicalWork(form.get('service')), master: demo.value.masters[0],
    vin: String(form.get('vin') || '').trim().toUpperCase(), mileage: Number(form.get('mileage')) || 0,
    status: 'waiting', labor: 45, parts: 0, paid: false,
  }
  orders.value.unshift(next)
  // Запись из графика превращается в наряд: закрываем её и запоминаем номер.
  if (pendingBooking.value) {
    bookings.value = bookings.value.map((item) => (item.id === pendingBooking.value.id
      ? { ...item, status: 'inWork', orderId: next.id }
      : item))
    pendingBooking.value = null
  }
  logs.value.unshift({ time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), type: 'created', id: next.id })
  showNewOrder.value = false
  draftClient.value = null
  selected.value = next
  notify(t('created'))
}
function createBooking(booking) {
  bookings.value = [...bookings.value, booking]
  notify(t('saved'))
}
function updateBooking(booking) {
  bookings.value = bookings.value.map((item) => (item.id === booking.id ? { ...item, ...booking } : item))
  notify(t('saved'))
}
function removeBooking(id) {
  bookings.value = bookings.value.filter((item) => item.id !== id)
  notify(t('saved'))
}
// «Създай поръчка» из записи: открываем обычную форму наряда с подставленными данными.
function orderFromBooking(booking) {
  pendingBooking.value = booking
  openNewOrder({ name: booking.client, car: booking.car, plate: booking.plate, vin: booking.vin, phone: booking.phone })
}

const resetDemo = () => {
  orders.value = structuredClone(demo.value.initialOrders)
  bookings.value = structuredClone(demo.value.bookings || [])
  pendingBooking.value = null
  bookingAnchor.value = demoTodayText.value
  maintenance.value = structuredClone(demo.value.maintenance || {})
  messages.value = []
  resetDemoDate()
  logs.value = demo.value.logs.map((entry) => ({ ...entry }))
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
        <button v-for="item in ['dashboard','calendar','vehicles','orders','clients','stock','reports','log']" :key="item" :class="{ active: section === item }" @click="section = item">
          <span>{{ {dashboard:'▦',calendar:'🗓',vehicles:'🚗',orders:'▤',clients:'●',stock:'◇',reports:'↗',log:'≡'}[item] }}</span>{{ t(item) }}
        </button>
      </nav>
      <a class="learn" href="https://ikars.lv/#contact">{{ t('contact') }} →</a>
      <a class="back-home" href="https://ikars.lv/">← ikars.lv</a>
    </aside>

    <main>
      <header class="topbar">
        <div><strong>IKARS Auto Service</strong><small>{{ t('shopLine') }}</small></div>
        <div class="top-actions"><button v-for="code in ['lv','ru','en','bg']" :key="code" :class="{active:lang===code}" @click="lang=code">{{ code.toUpperCase() }}</button></div>
      </header>
      <div class="demo-banner"><strong>{{ t('demo') }}</strong><span>{{ t('demoNote') }}</span><div class="demo-clock" :title="t('clockHint')"><span>{{ t('clockLabel') }}</span><button type="button" :title="t('clockBack')" @click="shiftDemoDate(-30)">−30</button><button type="button" :title="t('clockBack')" @click="shiftDemoDate(-7)">−7</button><strong>{{ demoTodayText }}</strong><button type="button" :title="t('clockForward')" @click="shiftDemoDate(7)">+7</button><button type="button" :title="t('clockForward')" @click="shiftDemoDate(30)">+30</button><button type="button" class="clock-reset" :title="t('clockToday')" @click="resetDemoDate">⟲</button></div><a class="back-home" href="https://ikars.lv/">← ikars.lv</a><button @click="resetDemo">↻ {{ t('reset') }}</button></div>

      <section class="page">
              <template v-if="section === 'calendar'">
          <div class="page-title"><div><p>CRM · {{ t('calendar') }}</p><h1>{{ t('calTitle') }}</h1></div></div>
          <BookingCalendar
            :bookings="bookings"
            :shop="demo.shop || {}"
            :masters="demo.masters"
            :vehicles="vehicles"
            :t="t"
            :locale="localeTag"
            :today="demoTodayText"
            :view="bookingView"
            :anchor="bookingAnchor"
            @view="bookingView = $event"
            @anchor="bookingAnchor = $event"
            @create="createBooking"
            @update="updateBooking"
            @remove="removeBooking"
            @order="orderFromBooking"
            @print="printSheet"
            @notify="notify"
          />
        </template>

        <template v-if="section === 'vehicles'">
        <VehicleSection :vehicles="vehicles" :t="t" :locale="localeTag" :status-text="statusText" :photos-count="countPhotos" :maintenance="maintenance" :today="demoTodayText" @open="openVehicle" @new-order="newOrderForVehicle" />
      </template>

<template v-if="section === 'dashboard'">
          <div class="page-title"><div><p>{{ demoTodayLong }}</p><h1>{{ t('dashboard') }}</h1></div><button class="primary" @click="openNewOrder()">＋ {{ t('newOrder') }}</button></div>
          <div class="metrics">
            <article><span>{{ t('today') }}</span><strong>{{ todayOrders.length }}</strong><em>2 {{ statusText.work.toLowerCase() }}</em></article>
            <article><span>{{ t('revenue') }}</span><strong>€{{ revenue }}</strong><em>+12% vs. yesterday</em></article>
            <article><span>{{ t('ready') }}</span><strong>{{ readyCount }}</strong><em>{{ statusText.ready }}</em></article>
            <article><span>{{ t('low') }}</span><strong>{{ lowStock }}</strong><em>BP-881 · AF-115</em></article>
          </div>
          <div class="panel"><div class="panel-head"><h2>{{ t('recent') }}</h2><button @click="section='orders'">{{ t('orders') }} →</button></div><OrderTable :orders="ordersView.slice(0,4)" :status-text="statusText" @open="openOrder" /></div>
        </template>

        <template v-else-if="section === 'orders'">
          <div class="page-title"><div><p>CRM · WORKFLOW</p><h1>{{ t('orders') }}</h1></div><button class="primary" @click="openNewOrder()">＋ {{ t('newOrder') }}</button></div>
          <div class="kanban">
            <div v-for="status in statuses" :key="status" class="kanban-column"><h3><span :class="['dot',status]"></span>{{ statusText[status] }} <b>{{ orders.filter(o=>o.status===status).length }}</b></h3><button v-for="order in orders.filter(o=>o.status===status)" :key="order.id" class="order-card" @click="openOrder(order)"><small>{{ order.time }} · {{ order.id }}</small><strong>{{ order.car }}</strong><span>{{ order.client }}</span><em>€{{ order.labor + order.parts }}</em></button></div>
          </div>
        </template>

        <template v-else-if="section === 'clients'">
          <div class="page-title"><div><p>CRM · DATABASE</p><h1>{{ t('allClients') }}</h1></div></div>
          <div class="panel table-panel"><table><thead><tr><th>{{ t('client') }}</th><th>{{ t('car') }}</th><th>{{ t('plate') }}</th><th>{{ t('visits') }}</th></tr></thead><tbody><tr v-for="client in clientsView" :key="client.plate" class="clickable" @click="openClient(client)"><td><strong>{{ client.name }}</strong><small>{{ client.phone }}</small></td><td>{{ client.car }}</td><td><span class="plate">{{ client.plate }}</span></td><td>{{ client.visits }} <b class="row-arrow">›</b></td></tr></tbody></table></div>
        </template>

        <template v-else-if="section === 'stock'">
          <div class="page-title"><div><p>CRM · INVENTORY</p><h1>{{ t('parts') }}</h1></div></div>
          <div class="panel table-panel"><table><thead><tr><th>{{ t('parts') }}</th><th>{{ t('quantity') }}</th><th>{{ t('purchase') }}</th><th>{{ t('sale') }}</th></tr></thead><tbody><tr v-for="part in inventoryView" :key="part.article"><td><strong>{{ part.name }}</strong><small>{{ part.article }}</small></td><td><span :class="['stock-pill',{danger:part.qty<=part.min}]">{{ part.qty }}</span></td><td>€{{ part.buy.toFixed(2) }}</td><td>€{{ part.sell.toFixed(2) }}</td></tr></tbody></table></div>
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

    <div v-if="selected" class="overlay" @click.self="selected=null"><aside class="drawer"><button class="x" @click="selected=null">×</button><p class="eyebrow">{{ t('order') }} · {{ selected.id }}</p><h2>{{ selected.car }} <span class="plate">{{ selected.plate }}</span></h2><div class="detail-grid"><div><span>{{ t('client') }}</span><strong>{{ selected.client }}</strong><small>{{ selected.phone }}</small></div><div><span>{{ t('master') }}</span><strong>{{ selected.master }}</strong></div><div class="wide"><span>{{ t('service') }}</span><strong>{{ L(selected.service) }}</strong></div></div><div class="invoice"><div><span>Darbs / Labor</span><b>€{{ selected.labor }}</b></div><div><span>{{ t('parts') }}</span><b>€{{ selected.parts }}</b></div><div class="sum"><span>{{ t('total') }}</span><b>€{{ selected.labor + selected.parts }}</b></div></div><div v-if="selected.vin || selected.mileage" class="detail-grid order-vehicle"><div v-if="selected.vin"><span>{{ t('vin') }}</span><strong class="mono">{{ selected.vin }}</strong></div><div v-if="selected.mileage"><span>{{ t('mileage') }}</span><strong>{{ selected.mileage.toLocaleString(localeTag.value) }} km</strong></div></div><button v-if="orderVehicle" type="button" class="secondary full" @click="openVehicle(orderVehicle)">{{ t('openVehicle') }} →</button><section class="photos order-photos"><h3>{{ t('photos') }}</h3><PhotoStrip :photos="visitPhotos" :t="t" :busy="photoBusy" :tag="photoTag" @add="addVisitPhotos" @remove="removePhoto" @open="openPhoto" @update:tag="photoTag = $event" /></section><div class="drawer-status"><span :class="['status',selected.status]">{{ statusText[selected.status] }}</span><span :class="['payment',{paid:selected.paid}]">{{ selected.paid ? t('paid') : t('unpaid') }}</span></div><button v-if="selected.status!=='done'" class="primary full" @click="advanceStatus">{{ t('next') }} →</button><button v-if="!selected.paid" class="secondary full" @click="markPaid">€ {{ t('markPaid') }}</button></aside></div>

        <div v-if="selectedVehicle" class="overlay" @click.self="closeVehicle"><VehicleDrawer :vehicle="selectedVehicle" :t="t" :status-text="statusText" :photos="vehiclePhotos" :busy="photoBusy" :tag="photoTag" :locale="localeTag" :vin-info="vinInfo" :vin-busy="vinBusy" :maintenance="selectedMaintenance" :today="demoTodayText" @save-maintenance="saveMaintenance" @close="closeVehicle" @add-photos="addVehiclePhotos" @remove-photo="removePhoto" @open-photo="openPhoto" @open-order="openOrder" @new-order="newOrderForVehicle" @decode-vin="identifyVehicle" @update:tag="photoTag = $event" /></div>

<div v-if="selectedClient" class="overlay" @click.self="selectedClient=null"><aside class="drawer client-drawer"><button class="x" @click="selectedClient=null">×</button><p class="eyebrow">IKARS · {{ clientText.profile }}</p><div class="client-heading"><div class="avatar">{{ selectedClient.name.split(' ').map(word=>word[0]).join('').slice(0,2) }}</div><div><h2>{{ selectedClient.name }}</h2><a :href="`tel:${selectedClient.phone.replaceAll(' ','')}`">{{ selectedClient.phone }}</a></div></div><div class="detail-grid"><div><span>{{ t('car') }}</span><strong>{{ selectedClient.car }}</strong><small><span class="plate">{{ selectedClient.plate }}</span></small></div><div><span>{{ t('visits') }}</span><strong>{{ selectedClient.visits }}</strong></div><div><span>{{ clientText.spent }}</span><strong>€{{ selectedClient.spent }}</strong></div><div><span>{{ clientText.debt }}</span><strong :class="{positive:selectedClient.debt===0}">{{ selectedClient.debt ? `€${selectedClient.debt}` : clientText.noDebt }}</strong></div></div><div v-if="ordersView.find(order=>order.plate===selectedClient.plate && order.status!=='done')" class="current-repair"><span>{{ clientText.current }}</span><strong>{{ ordersView.find(order=>order.plate===selectedClient.plate && order.status!=='done').service }}</strong><small>{{ statusText[ordersView.find(order=>order.plate===selectedClient.plate && order.status!=='done').status] }}</small><button @click="openOrder(ordersView.find(order=>order.plate===selectedClient.plate && order.status!=='done'))">{{ clientText.openRepair }} →</button></div><div class="history"><h3>{{ clientText.history }}</h3><p v-for="item in selectedClient.history" :key="item">{{ item }}</p></div><a class="secondary full action-link" :href="`tel:${selectedClient.phone.replaceAll(' ','')}`">☎ {{ clientText.call }}</a><button class="primary full" @click="openNewOrder(selectedClient)">＋ {{ t('newOrder') }}</button></aside></div>

    <div v-if="showNewOrder" class="overlay" @click.self="showNewOrder=false"><form class="modal" @submit.prevent="createOrder"><button type="button" class="x" @click="showNewOrder=false">×</button><p class="eyebrow">IKARS · CRM</p><h2>{{ t('newOrder') }}</h2><label>{{ t('name') }}<input name="client" :value="draftClient?.name || demo.newClient.name" required></label><label>{{ t('car') }}<input name="car" :value="draftClient?.car || demo.newClient.car" required></label><label>{{ t('plate') }}<input name="plate" :value="draftClient?.plate || demo.newClient.plate" required></label><label>{{ t('vin') }}<input name="vin" :value="draftClient?.vin || ''" placeholder="17"></label><label>{{ t('mileage') }}<input name="mileage" type="number" min="0" :value="draftClient?.mileage || ''"></label><label>{{ t('service') }}<input name="service" :value="L('Diagnostika')" required></label><button class="primary full">{{ t('create') }}</button></form></div>
        <div v-if="lightbox" class="overlay lightbox" @click.self="closePhoto"><figure><img :src="lightbox.fullUrl" :alt="t('photoView')"><figcaption>{{ t('tag' + lightbox.tag.charAt(0).toUpperCase() + lightbox.tag.slice(1)) }} · {{ lightbox.time }}</figcaption><button type="button" class="x" @click="closePhoto">×</button></figure></div>

<div v-if="toast" class="toast">✓ {{ toast }}</div>
  </div>
</template>

