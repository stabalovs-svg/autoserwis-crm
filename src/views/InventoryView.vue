<template>
  <div>
    <div class="page-header">
      <h1>{{ $t('inventory') }}</h1>
      <button @click="showForm = !showForm" class="add-btn">{{ $t('addPart') }}</button>
    </div>

    <input v-model="searchQuery" :placeholder="$t('search')" class="search-input">

    <div v-if="showForm" class="add-form">
      <h3>{{ $t('newPart') }}</h3>
      <form @submit.prevent="savePart" class="form-grid">
        <input v-model="newPart.name" :placeholder="$t('partName')" required>
        <input v-model="newPart.article" :placeholder="$t('article')">
        <input v-model="newPart.quantity" type="number" :placeholder="$t('quantity')">
        <input v-model="newPart.buy_price" type="number" :placeholder="$t('buyPrice')">
        <input v-model="newPart.sell_price" type="number" :placeholder="$t('sellPrice')">
        <button type="submit">{{ $t('save') }}</button>
      </form>
    </div>

    <table class="inventory-table">
      <thead>
        <tr>
          <th>{{ $t('partName') }}</th>
          <th>{{ $t('article') }}</th>
          <th>{{ $t('quantity') }}</th>
          <th>{{ $t('buyPrice') }}</th>
          <th>{{ $t('sellPrice') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="part in parts" :key="part.id">
          <td>{{ part.name }}</td>
          <td>{{ part.article }}</td>
          <td>{{ part.quantity }}</td>
          <td>{{ part.buy_price }} €</td>
          <td>{{ part.sell_price }} €</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const searchQuery = ref('')
const parts = ref([])
const showForm = ref(false)
const newPart = ref({
  name: '',
  article: '',
  quantity: 0,
  buy_price: 0,
  sell_price: 0
})

const fetchParts = async () => {
  const { data } = await supabase.from('inventory').select('*')
  parts.value = data || []
}

const savePart = async () => {
  const { error } = await supabase.from('inventory').insert([newPart.value])
  if (error) {
    alert('Ошибка: ' + error.message)
  } else {
    alert('Запчасть добавлена!')
    newPart.value = { name: '', article: '', quantity: 0, buy_price: 0, sell_price: 0 }
    showForm.value = false
    fetchParts()
  }
}

onMounted(fetchParts)
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

.inventory-table {
  width: 100%;
  border-collapse: collapse;
}

.inventory-table th,
.inventory-table td {
  border: 1px solid #e2e8f0;
  padding: 12px;
  text-align: left;
}

.inventory-table th {
  background: #f1f5f9;
}

.low-stock {
  color: #b45309;
  font-weight: bold;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}
</style>