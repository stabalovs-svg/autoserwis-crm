<template>
  <div>
    <div class="page-header">
      <h1>{{ $t('appointments') }}</h1>
      <button @click="showForm = !showForm" class="add-btn">{{ $t('newAppointment') }}</button>
    </div>

    <input v-model="searchQuery" :placeholder="$t('search')" class="search-input">

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

    <table class="appointments-table" v-if="appointments.length">
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
        <tr v-for="appointment in filteredAppointments" :key="appointment.id">
          <td>{{ appointment.time }}</td>
          <td>{{ appointment.client }}</td>
          <td>{{ appointment.car }}</td>
          <td>{{ $t(appointment.service) }}</td>
          <td>{{ $t(appointment.statusKey) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const appointments = ref([])
const searchQuery = ref('')
const showForm = ref(false)
const newAppointment = ref({
  time: '',
  client: '',
  car: '',
  service: 'oilChange',
  statusKey: 'waiting'
})

const fetchAppointments = async () => {
  const { data } = await supabase.from('appointments').select('*')
  appointments.value = data || []
}

const filteredAppointments = computed(() => {
  return appointments.value.filter(appointment =>
    appointment.client.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (appointment.car && appointment.car.includes(searchQuery.value))
  )
})

const saveAppointment = async () => {
  const { error } = await supabase.from('appointments').insert([newAppointment.value])
  if (error) {
    alert('Ошибка: ' + error.message)
  } else {
    alert('Запись добавлена!')
    newAppointment.value = { time: '', client: '', car: '', service: 'oilChange', statusKey: 'waiting' }
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

.search-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
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