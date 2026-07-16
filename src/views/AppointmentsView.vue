<template>
  <div>
    <div class="page-header">
      <h1>{{ $t('appointments') }}</h1>
      <button @click="newAppointment" class="add-btn">{{ $t('newAppointment') }}</button>
    </div>

    <div class="calendar-info">
      <p>{{ $t('today') }}: {{ new Date().toLocaleDateString(locale) }}</p>
    </div>

    <table class="appointments-table">
      <thead>
        <tr>
          <th>{{ $t('time') }}</th>
          <th>{{ $t('client') }}</th>
          <th>{{ $t('car') }}</th>
          <th>{{ $t('service') }}</th>
          <th>{{ $t('status') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="appointment in appointments" :key="appointment.id">
          <td>{{ appointment.time }}</td>
          <td>{{ appointment.client }}</td>
          <td>{{ appointment.car }}</td>
          <td>{{ $t(appointment.service) }}</td>
          <td :class="appointment.statusClass">{{ $t(appointment.statusKey) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const appointments = ref([
  {
    id: 1,
    time: '09:00',
    client: 'Иванов И.И.',
    car: 'BMW X5',
    service: 'oilChange',
    statusKey: 'inWork',
    statusClass: 'status-working'
  },
  {
    id: 2,
    time: '11:30',
    client: 'Петров С.',
    car: 'Toyota Camry',
    service: 'diagnostics',
    statusKey: 'waiting',
    statusClass: 'status-waiting'
  }
])

const newAppointment = () => {
  alert('Форма новой записи — будет позже')
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.add-btn {
  background: #1e40af;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
}

.appointments-table {
  width: 100%;
  border-collapse: collapse;
}

.appointments-table th,
.appointments-table td {
  border: 1px solid #e2e8f0;
  padding: 12px;
  text-align: left;
}

.appointments-table th {
  background: #f1f5f9;
}

.status-working {
  color: #166534;
  background: #dcfce7;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-waiting {
  color: #854d0e;
  background: #fef3c7;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>