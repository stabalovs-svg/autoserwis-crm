<template>
  <aside class="sidebar">
    <div class="logo">
      <h2>AutoService</h2>
    </div>

    <nav>
      <router-link to="/" class="menu-item">
        📊 {{ $t('dashboard') }}
      </router-link>
      <router-link to="/clients" class="menu-item">
        👥 {{ $t('clients') }}
      </router-link>
      <router-link to="/appointments" class="menu-item">
        📅 {{ $t('appointments') }}
      </router-link>
      <router-link to="/inventory" class="menu-item">
        🔧 {{ $t('inventory') }}
      </router-link>
      <router-link to="/reports" class="menu-item">
        📈 {{ $t('reports') }}
      </router-link>
    </nav>

    <div class="language-switcher">
      <button v-for="lang in ['ru', 'en', 'bg', 'lv']" :key="lang" @click="changeLanguage(lang)"
        :class="{ active: currentLang === lang }">
        {{ lang.toUpperCase() }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { ref } from 'vue'

const { locale } = useI18n()
const currentLang = ref('ru')

const changeLanguage = (lang) => {
  locale.value = lang
  currentLang.value = lang
}
</script>

<style scoped>
.sidebar {
  width: 240px;
  background: #1e2937;
  color: white;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  padding: 20px 0;
}

.logo {
  padding: 0 20px 30px;
  border-bottom: 1px solid #334155;
}

.menu-item {
  display: block;
  padding: 12px 20px;
  color: #cbd5e1;
  text-decoration: none;
}

.menu-item:hover {
  background: #334155;
  color: white;
}

.language-switcher {
  padding: 10px 20px;
  display: flex;
  gap: 5px;
  margin-top: 20px;
}

.language-switcher button {
  padding: 5px 10px;
  background: #334155;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.language-switcher button.active {
  background: #1e40af;
  font-weight: bold;
}
</style>