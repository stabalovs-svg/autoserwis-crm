<template>
  <div>
    <div class="page-header">
      <h1>{{ $t('clients') }}</h1>
      <button @click="showAddForm = !showAddForm" class="add-btn">
        {{ showAddForm ? $t('hide') : $t('addClient') }}
      </button>
    </div>

    <input v-model="searchQuery" :placeholder="$t('search')" class="search-input">

    <div v-if="showAddForm" class="add-form">
      <!-- форма как раньше -->
    </div>

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
        <tr v-for="client in filteredClients" :key="client.id">
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const clients = ref([])
const searchQuery = ref('')
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
  const { data } = await supabase.from('clients').select('*')
  clients.value = data || []
}

const filteredClients = computed(() => {
  return clients.value.filter(client =>
    client.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (client.phone && client.phone.includes(searchQuery.value))
  )
})

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
    alert('Клиент добавлен!')
    newClient.value = { name: '', phone: '', email: '', car_model: '', car_plate: '', status: 'Оформление' }
    showAddForm.value = false
    fetchClients()
  }
}

onMounted(fetchClients)
</script>

<style scoped>
/* Стили + search */
.search-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}

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