<template>
  <div>
    <h1>{{ $t('dashboard') }}</h1>
    <p>{{ $t('welcome') }}</p>

    <div class="stats">
      <div class="stat-card">
        <h3>{{ $t('todayInWork') }}</h3>
        <p class="big-number">12</p>
      </div>
      <div class="stat-card">
        <h3>{{ $t('freeAppointments') }}</h3>
        <p class="big-number">8</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Логика позже
</script>

<style scoped>
.stats {
  display: flex;
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  flex: 1;
}

.big-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e40af;
}
</style>