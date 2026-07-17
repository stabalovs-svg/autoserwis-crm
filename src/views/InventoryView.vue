<template>
  <div>
    <div class="page-header">
      <h1>{{ $t('inventory') }}</h1>
      <button @click="showForm = !showForm" class="add-btn">
        {{ showForm ? $t('hide') : $t('addPart') }}
      </button>
    </div>

    <!-- Поиск -->
    <input v-model="searchQuery" :placeholder="$t('search')" class="search-input">

    <!-- Форма добавления -->
    <div v-if="showForm" class="add-form">
      <h3>{{ $t('newPart') }}</h3>
      <form @submit.prevent="savePart">
        <input v-model="newPart.name" :placeholder="$t('partName')" required>
        <input v-model="newPart.article" :placeholder="$t('article')">
        <input v-model="newPart.quantity" type="number" :placeholder="$t('quantity')">
        <input v-model="newPart.buy_price" type="number" :placeholder="$t('buyPrice')">
        <input v-model="newPart.sell_price" type="number" :placeholder="$t('sellPrice')">
        <button type="submit">{{ $t('save') }}</button>
      </form>
    </div>

    <!-- Таблица -->
    <table class="inventory-table" v-if="parts.length">
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
        <tr v-for="part in filteredParts" :key="part.id">
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
import { ref, onMounted, computed } from 'vue'
import { supabase } from '@/services/supabase'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const parts = ref([])
const searchQuery = ref('')
const showForm = ref(false)
const newPart = ref({
  name: '',
  article: '',
  quantity: '',
  buy_price: '',
  sell_price: '',
})

const fetchParts = async () => {
  const { data } = await supabase.from('inventory').select('*')
  parts.value = data || []
}

const filteredParts = computed(() => {
  return parts.value.filter(part =>
    part.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    (part.article && part.article.includes(searchQuery.value))
  )
})

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

.add-form {
  background: #f8fafc;
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 20px;
}

.add-form input {
  display: block;
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
}

.search-input {
  width: 100%;
  padding: 12px;
  margin-bottom: 20px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
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
</style>