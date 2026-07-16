<template>
  <div>
    <div class="page-header">
      <h1>{{ $t('inventory') }}</h1>
      <button @click="showForm = !showForm" class="add-btn">+ Добавить запчасть</button>
    </div>

    <!-- Форма -->
    <div v-if="showForm" class="add-form">
      <h3>Новая запчасть</h3>
      <form @submit.prevent="savePart">
        <input v-model="newPart.name" placeholder="Название" required>
        <input v-model="newPart.article" placeholder="Артикул">
        <input v-model="newPart.quantity" type="number" placeholder="Количество">
        <input v-model="newPart.buy_price" type="number" placeholder="Цена закупки">
        <input v-model="newPart.sell_price" type="number" placeholder="Цена продажи">
        <button type="submit">Сохранить</button>
      </form>
    </div>

    <!-- Таблица -->
    <table class="inventory-table">
      <thead>
        <tr>
          <th>Название</th>
          <th>Артикул</th>
          <th>Количество</th>
          <th>Цена закупки</th>
          <th>Цена продажи</th>
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
</style>