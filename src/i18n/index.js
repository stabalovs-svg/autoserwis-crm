import { createI18n } from 'vue-i18n'

const messages = {
  ru: {
    dashboard: 'Панель управления',
    clients: 'Клиенты',
    appointments: 'Записи',
    inventory: 'Склад',
    reports: 'Отчёты',
    addClient: 'Добавить клиента',
    welcome: 'Добро пожаловать в систему!',
    addClient: 'Добавить клиента',
    hide: 'Скрыть форму',
    todayInWork: 'Сегодня в работе',
    freeAppointments: 'Свободные записи',
  },
  en: {
    dashboard: 'Dashboard',
    clients: 'Clients',
    appointments: 'Appointments',
    inventory: 'Inventory',
    reports: 'Reports',
    addClient: 'Add Client',
    welcome: 'Welcome to the system!',
    addClient: 'Add client',
    todayInWork: 'Today in Work',
    freeAppointments: 'Free Appointments',
    hide: 'Hide form',
  },
  bg: {
    dashboard: 'Табло за управление',
    clients: 'Клиенти',
    appointments: 'Записи',
    inventory: 'Склад',
    reports: 'Отчети',
    addClient: 'Добави клиент',
    welcome: 'Добре дошли в системата!',
    addClient: 'Добавяне на клиент',
    hide: 'Скриване на формуляра',
    todayInWork: 'Сегодня в работа',
    freeAppointments: 'Свободные записи',
  },
  lv: {
    dashboard: 'Vadības panelis',
    clients: 'Klienti',
    appointments: 'Pieraksti',
    inventory: 'Noliktava',
    reports: 'Pārskati',
    addClient: 'Pievienot klientu',
    welcome: 'Laipni lūdzam sistēmā!',
    addClient: 'Pievienot klientu',
    hide: 'Slēpt veidlapu',
    todayInWork: 'Šodien darbā',
    freeAppointments: 'Pieejamās tikšanās',
  },
}

const i18n = createI18n({
  legacy: false, // ← Это важно!
  locale: 'ru',
  fallbackLocale: 'ru',
  messages,
})

export default i18n
