<script setup>
defineProps({
  orders: { type: Array, default: () => [] },
  statusText: { type: Object, default: () => ({}) },
})
defineEmits(['open'])
</script>

<template>
  <div class="order-table">
    <button v-for="order in orders" :key="order.id" @click="$emit('open', order)">
      <time>{{ order.time }}</time>
      <span><strong>{{ order.car }} · {{ order.plate }}</strong><small>{{ order.client }} · {{ order.service }}</small></span>
      <em :class="['status', order.status]">{{ statusText[order.status] }}</em>
      <b>€{{ order.labor + order.parts }}</b><i>›</i>
    </button>
  </div>
</template>
