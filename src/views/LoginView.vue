<template>
  <div class="login-page">
    <div class="login-panel">
      <div class="brand-block">
        <p class="brand-title">{{ serviceName }}</p>
        <p class="brand-subtitle">{{ $t('welcome') }}</p>
      </div>

      <form @submit.prevent="login" class="credentials-card">
        <label class="field-label" for="email">{{ $t('email') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          :placeholder="$t('email')"
          required
          class="form-input"
        />

        <label class="field-label" for="password">{{ $t('password') }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          :placeholder="$t('password')"
          required
          class="form-input"
        />

        <button type="submit" class="primary-btn">
          {{ $t('signIn') }}
        </button>
        <p v-if="error" class="error-text">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const email = ref('')
const password = ref('')
const error = ref('')
const serviceName =
  import.meta.env.VITE_SERVICE_NAME || 'Название автосервиса клиента'

const login = async () => {
  const { error: err } = await authStore.login(email.value, password.value)
  if (err) {
    error.value = t('loginError')
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(0deg, #0a122a 0%, #0b1835 35%, #0f3a61 70%, #0f7774 100%);
}

.login-panel {
  width: min(460px, 100%);
  background: rgba(3, 7, 18, 0.75);
  border-radius: 32px;
  padding: 2.5rem;
  box-shadow: 0 25px 60px rgba(4, 7, 13, 0.6);
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-height: min(520px, calc(100vh - 4rem));
  justify-content: space-between;
  border: 1px solid rgba(148, 163, 184, 0.2);
  max-height: calc(100vh - 2rem);
}

.brand-block {
  text-align: center;
}

.brand-title {
  margin: 0;
  font-size: 1.75rem;
  font-weight: 700;
  color: #f8fafc;
}

.brand-subtitle {
  margin-top: 0.35rem;
  color: #94a3b8;
  font-size: 1rem;
}

.credentials-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: #fff;
  border-radius: 18px;
  padding: 2rem;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.08);
  flex: 1;
  justify-content: center;
  max-width: 100%;
  min-height: 0;
  box-sizing: border-box;
  align-items: stretch;
  overflow: hidden;
}

.field-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12rem;
  color: #475569;
}

.form-input {
  width: 100%;
  padding: 0.85rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  font-size: 1rem;
  background: #fff;
  box-sizing: border-box;
}

.primary-btn {
  margin-top: 0.5rem;
  padding: 0.9rem 0;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%);
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.08rem;
  cursor: pointer;
  transition: transform 0.2s ease;
  width: 100%;
}

.primary-btn:hover {
  transform: translateY(-1px);
}

.error-text {
  margin-top: 0.25rem;
  text-align: center;
  font-size: 0.85rem;
  color: #dc2626;
}

@media (max-width: 640px) {
  .login-page {
    padding: 1.5rem;
  }

  .login-panel {
    width: 100%;
    padding: 1.5rem;
    min-height: auto;
    gap: 1.5rem;
  }

  .credentials-card {
    padding: 1.25rem;
    gap: 0.6rem;
  }
}
</style>