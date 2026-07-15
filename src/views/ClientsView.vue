<template>
  <div>
    <div class="page-header">
      <h1>Клиенты автосервиса</h1>
      <button @click="showAddForm = !showAddForm" class="add-btn">
        {{ showAddForm ? 'Скрыть форму' : '+ Добавить клиента' }}
      </button>
    </div>

    <div v-if="showAddForm" class="add-form">
      <h3>Новый клиент</h3>
      <form @submit.prevent="saveClient">
        <input v-model="newClient.name" placeholder="ФИО" required>
        <input v-model="newClient.phone" placeholder="Телефон">
        <input v-model="newClient.email" placeholder="Email" type="email">
        <input v-model="newClient.car_model" placeholder="Модель автомобиля">
        <input v-model="newClient.car_plate" placeholder="Номер автомобиля">
        <select v-model="newClient.status">
          <option value="Оформление">Оформление</option>
          <option value="В ремонте">В ремонте</option>
          <option value="Ожидает">Ожидает</option>
        </select>
        <button type="submit">Сохранить клиента</button>
      </form>
    </div>

    <table class="clients-table" v-if="clients.length">
      <thead>
        <tr>
          <th>ФИО</th>
          <th>Телефон</th>
          <th>Автомобиль</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="client in clients" :key="client.id">
          <td>{{ client.name }}</td>
          <td>{{ client.phone }}</td>
          <td>{{ client.car_model }}</td>
          <td>{{ client.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const clients = ref([])
const showAddForm = ref(false)
const newClient = ref({
  name: '',
  phone: '',
  email: '',
  car_model: '',
  car_plate: '',
  status: 'Оформление'
})

const fetchClients = async () => {
  const { data, error } = await supabase.from('clients').select('*')
  if (error) console.error(error)
  else clients.value = data || []
}

const saveClient = async () => {
  const { error } = await supabase.from('clients').insert([newClient.value])
  if (error) {
    alert('Ошибка: ' + error.message)
  } else {
    alert('Клиент добавлен!')
    newClient.value = { name: '', phone: '', email: '', car_model: '', car_plate: '', status: 'Оформление' }
    showAddForm.value = false
    fetchClients()
  }
}

onMounted(fetchClients)
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

.add-form input,
.add-form select {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
}

.clients-table {
  width: 100%;
  border-collapse: collapse;
}

.clients-table th,
.clients-table td {
  border: 1px solid #e2e8f0;
  padding: 12px;
  text-align: left;
}

.clients-table th {
  background: #f1f5f9;
}
</style>