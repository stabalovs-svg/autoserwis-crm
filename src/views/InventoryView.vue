<template>
  <div>
    <div class="page-header">
      <h1>Склад запчастей</h1>
      <button @click="addPart" class="add-btn">+ Добавить запчасть</button>
    </div>

    <table class="inventory-table">
      <thead>
        <tr>
          <th>Название запчасти</th>
          <th>Артикул</th>
          <th>Количество</th>
          <th>Цена закупки</th>
          <th>Цена продажи</th>
          <th>Статус</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="part in parts" :key="part.id">
          <td>{{ part.name }}</td>
          <td>{{ part.article }}</td>
          <td :class="{ 'low-stock': part.quantity < 5 }">{{ part.quantity }}</td>
          <td>{{ part.buyPrice }} €</td>
          <td>{{ part.sellPrice }} €</td>
          <td>{{ part.status }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const parts = ref([
  { id: 1, name: 'Масло моторное 5W-40', article: 'MOT-545', quantity: 23, buyPrice: 12.5, sellPrice: 18.9, status: 'В наличии' },
  { id: 2, name: 'Тормозные колодки', article: 'BRK-784', quantity: 4, buyPrice: 35, sellPrice: 52, status: 'Мало' },
  { id: 3, name: 'Фильтр воздушный', article: 'FLT-912', quantity: 12, buyPrice: 8.5, sellPrice: 14, status: 'В наличии' },
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