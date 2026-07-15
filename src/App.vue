<template>
  <div class="app">
    <AppSidebar />
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import AppSidebar from './components/layout/AppSidebar.vue'
</script>

<style scoped>
.app {
  display: flex;
}

.content {
  margin-left: 240px;
  /* ширина сайдбара */
  width: 100%;
  padding: 20px;
  background: #f8fafc;
  min-height: 100vh;
}
</style>