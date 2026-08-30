<template>
  <aside class="sidebar">
    <div class="logo unified-logo">
      <img :src="logo" alt="IKARS" />
      <div class="logo-text">
        <h2>IKARS</h2>
        <p>CRM</p>
      </div>
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
      <router-link to="/logs" class="menu-item">
        📜 {{ $t('logs') }}
      </router-link>
    </nav>

    <div class="menu-bottom">
      <div class="language-switcher">
        <button
          v-for="lang in primaryLangs"
          :key="lang"
          type="button"
          @click="setLanguage(lang)"
          :class="{ active: currentLang === lang }"
        >
          {{ lang.toUpperCase() }}
        </button>
        <button class="gear-btn" type="button" @click="toggleSecondaryLangs" aria-label="Дополнительные языки">
          ⚙️
        </button>
      </div>

      <div v-if="showSecondaryLangs" class="secondary-langs">
        <button
          v-for="lang in secondaryLangs"
          :key="lang"
          type="button"
          @click="setLanguage(lang, true)"
          :class="{ active: currentLang === lang }"
        >
          {{ lang.toUpperCase() }}
        </button>
      </div>

      <button class="logout-btn" type="button" @click="logout">
        {{ $t('logout') }}
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import logo from '@/assets/logo/ikars-logo.svg'

const router = useRouter()
const { locale, t } = useI18n()
const authStore = useAuthStore()

const languagePairs = [
  { id: 'lv-ru', langs: ['lv', 'ru'] },
  { id: 'bg-en', langs: ['bg', 'en'] },
]
const initialPairIndex = languagePairs.findIndex((pair) =>
  pair.langs.includes(locale.value)
)
const activePairIndex = ref(initialPairIndex >= 0 ? initialPairIndex : 0)
const primaryLangs = computed(() => languagePairs[activePairIndex.value].langs)
const secondaryLangs = computed(
  () => languagePairs[(activePairIndex.value + 1) % languagePairs.length].langs
)
const currentLang = computed(() => locale.value || 'ru')
const showSecondaryLangs = ref(false)

const setLanguage = (lang, isSecondary = false) => {
  if (isSecondary) {
    const targetPair = languagePairs.findIndex((pair) => pair.langs.includes(lang))
    if (targetPair >= 0) {
      activePairIndex.value = targetPair
    }
  }
  locale.value = lang
  showSecondaryLangs.value = false
}

const toggleSecondaryLangs = () => {
  showSecondaryLangs.value = !showSecondaryLangs.value
}

const logout = async () => {
  await authStore.logout()
  router.push('/login')
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
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  }

  .unified-logo {
    align-items: center;
    justify-content: center;
  }

.logo img {
  width: 120px;
}

.logo-text h2 {
  margin: 0;
  font-size: 1.25rem;
}

.logo-text p {
  margin: 0;
  font-size: 0.85rem;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
  color: #94a3b8;
}

.menu-bottom {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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
  gap: 6px;
  margin-top: 20px;
  align-items: center;
}

.language-switcher button,
.secondary-langs button {
  padding: 6px 12px;
  border-radius: 8px;
  border: 1px solid transparent;
  background: #1e2937;
  color: #cbd5e1;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border 0.2s;
}

.language-switcher button.active,
.secondary-langs button.active {
  background: #1d4ed8;
  border-color: #2563eb;
  color: #fff;
}

.gear-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  color: #cbd5e1;
  font-size: 18px;
}

.secondary-langs {
  margin: 0 20px 8px;
  display: flex;
  gap: 8px;
}

.logout-btn {
  width: calc(100% - 40px);
  margin: 0 20px;
  padding: 0.75rem;
  border: none;
  border-radius: 10px;
  background: #dc2626;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: fixed;
    bottom: 0;
    top: auto;
    padding: 10px 0 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-top: 1px solid rgba(148, 163, 184, 0.4);
    background: #0f172a;
  }

  nav {
    width: 100%;
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 4px;
  }

  .menu-item {
    padding: 8px 12px;
    flex: 1;
    text-align: center;
    font-size: 0.78rem;
    letter-spacing: 0.02em;
  }

  .menu-bottom {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 8px;
    gap: 6px;
  }

  .language-switcher,
  .secondary-langs {
    justify-content: center;
    flex-wrap: wrap;
  }

  .logo {
    order: -1;
  }
}
</style>