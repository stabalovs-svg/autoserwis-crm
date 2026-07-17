<template>
  <div>
    <div class="page-header">
      <h1>{{ $t('appointments') }}</h1>
      <button @click="showForm = !showForm" class="add-btn">
        {{ showForm ? $t('hide') : $t('newAppointment') }}
      </button>
    </div>

    <!-- Форма -->
    <div v-if="showForm" class="add-form">
      <h3>{{ $t('newAppointment') }}</h3>
      <form @submit.prevent="saveAppointment">
        <div class="form-row">
          <input v-model="newAppointment.time" type="time" required>
          <input v-model="newAppointment.client" :placeholder="$t('client')" required>
        </div>
        <div class="form-row">
          <input v-model="newAppointment.car" :placeholder="$t('car')">
          <input v-model="newAppointment.service" :placeholder="$t('service')">
        </div>
        <select v-model="newAppointment.statusKey">
          <option value="waiting">{{ $t('waiting') }}</option>
          <option value="inWork">{{ $t('inWork') }}</option>
        </select>
        <button type="submit">{{ $t('save') }}</button>
      </form>
    </div>

    <!-- Таблица -->
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
          <td>{{ appointment.service }}</td>
          <td>{{ $t(appointment.statusKey) }}</td>
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
  statusKey: 'waiting'
})

const fetchAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select('*')

  if (error) {
    console.error('Ошибка загрузки записей:', error)
    appointments.value = []
    return
  }

  appointments.value = data || []
}

const saveAppointment = async () => {
  const appointmentToSave = {
    time: newAppointment.value.time,
    client: newAppointment.value.client,
    car: newAppointment.value.car,
    service: newAppointment.value.service,
    status_key: newAppointment.value.statusKey
  }

  const { error } = await supabase
    .from('appointments')
    .insert([appointmentToSave])

  if (error) {
    console.error('Ошибка сохранения записи:', error)
    alert('Ошибка: ' + error.message)
    return
  }

  alert('Запись добавлена!')

  newAppointment.value = {
    time: '',
    client: '',
    car: '',
    service: '',
    statusKey: 'waiting'
  }

  showForm.value = false

  await fetchAppointments()
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