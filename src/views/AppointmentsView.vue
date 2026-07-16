<template>
  <div>
    <div class="page-header">
      <h1>{{ $t('appointments') }}</h1>
      <button @click="showForm = !showForm" class="add-btn">{{ $t('newAppointment') }}</button>
    </div>

    <!-- Форма -->
    <div v-if="showForm" class="add-form">
      <h3>Новая запись</h3>
      <form @submit.prevent="saveAppointment">
        <div class="form-row">
          <input v-model="newAppointment.time" type="time" required>
          <input v-model="newAppointment.date" type="date" required>
          <input v-model="newAppointment.client" placeholder="Клиент" required>
        </div>
        <div class="form-row">
          <input v-model="newAppointment.car" placeholder="Автомобиль">
          <input v-model="newAppointment.service" placeholder="Услуга">
        </div>
        <select v-model="newAppointment.status">
          <option value="Ожидает">Ожидает</option>
          <option value="В работе">В работе</option>
        </select>
        <button type="submit">Сохранить запись</button>
      </form>
    </div>

    <!-- Таблица -->
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
          <td>{{ appointment.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const appointments = ref([])
const showForm = ref(false)
const newAppointment = ref({
  time: '',
  client: '',
  car: '',
  service: '',
  status: 'Ожидает'
})

const fetchAppointments = async () => {
  const { data } = await supabase.from('appointments').select('*')
  appointments.value = data || []
}

const saveAppointment = async () => {
  const { error } = await supabase.from('appointments').insert([newAppointment.value])
  if (error) {
    alert('Ошибка: ' + error.message)
  } else {
    alert('Запись добавлена!')
    newAppointment.value = { time: '', client: '', car: '', service: '', status: 'Ожидает' }
    showForm.value = false
    fetchAppointments()
  }
}

onMounted(fetchAppointments)
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

.add-form {
  background: #f8fafc;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.form-row input {
  flex: 1;
  padding: 8px;
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
</style>