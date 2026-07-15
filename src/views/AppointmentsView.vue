<template>
  <div>
    <div class="page-header">
      <h1>Записи на ремонт</h1>
      <button @click="newAppointment" class="add-btn">+ Новая запись</button>
    </div>

    <div class="calendar-info">
      <p>Сегодня: {{ new Date().toLocaleDateString('ru-RU') }}</p>
    </div>

    <table class="appointments-table">
      <thead>
        <tr>
          <th>Время</th>
          <th>Клиент</th>
          <th>Автомобиль</th>
          <th>Услуга</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="appointment in appointments" :key="appointment.id">
          <td>{{ appointment.time }}</td>
          <td>{{ appointment.client }}</td>
          <td>{{ appointment.car }}</td>
          <td>{{ appointment.service }}</td>
          <td :class="appointment.statusClass">{{ appointment.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const appointments = ref([
  { 
    id: 1, 
    time: '09:00', 
    client: 'Иванов И.И.', 
    car: 'BMW X5', 
    service: 'Замена масла', 
    status: 'В работе',
    statusClass: 'status-working'
  },
  { 
    id: 2, 
    time: '11:30', 
    client: 'Петров С.', 
    car: 'Toyota Camry', 
    service: 'Диагностика', 
    status: 'Ожидает',
    statusClass: 'status-waiting'
  }
])
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