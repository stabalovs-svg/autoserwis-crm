<template>
  <div>
    <div class="page-header">
      <h1>{{ $t('clients') }}</h1>
      <button @click="showAddForm = !showAddForm" class="add-btn">
        {{ showAddForm ? $t('hide') : $t('addClient') }}
      </button>
    </div>

    <input v-model="searchQuery" :placeholder="$t('search')" class="search-input">

    <!-- Форма добавления -->
    <div v-if="showAddForm" class="add-form">
      <h3>{{ $t('newClient') }}</h3>
      <form @submit.prevent="saveClient">
        <input v-model="newClient.name" :placeholder="$t('fullName')" required>
        <input v-model="newClient.phone" :placeholder="$t('phone')">
        <input v-model="newClient.email" :placeholder="$t('email')" type="email">
        <input v-model="newClient.car_model" :placeholder="$t('carModel')">
        <input v-model="newClient.car_plate" :placeholder="$t('carPlate')">
        <select v-model="newClient.status">
          <option value="Оформление">{{ $t('оформление') }}</option>
          <option value="В ремонте">{{ $t('inRepair') }}</option>
          <option value="Ожидает">{{ $t('waiting') }}</option>
        </select>
        <button type="submit">{{ $t('save') }}</button>
      </form>
    </div>

    <!-- Таблица -->
    <table class="clients-table" v-if="clients.length">
      <thead>
        <tr>
          <th>{{ $t('fullName') }}</th>
          <th>{{ $t('phone') }}</th>
          <th>{{ $t('carModel') }}</th>
          <th>{{ $t('status') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="client in clients" :key="client.id">
          <td>{{ client.name }}</td>
          <td>{{ client.phone }}</td>
          <td>{{ client.car_model }}</td>
          <td>{{ getTranslatedStatus(client.status) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

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

const getTranslatedStatus = (status) => {
  const map = {
    'Оформление': t('оформление'),
    'В ремонте': t('inRepair'),
    'Ожидает': t('waiting')
  }
  return map[status] || status
}

const saveClient = async () => {
  const { error } = await supabase.from('clients').insert([newClient.value])
  if (error) {
    alert('Ошибка: ' + error.message)
  } else {
    // Логирование
    await supabase.from('logs').insert([{
      action: 'Добавлен клиент',
      user_email: 'admin@auto.lv',
      details: newClient.value.name
    }])
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