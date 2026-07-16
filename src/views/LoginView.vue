<template>
    <div class="login-page">
        <div class="login-form">
            <h1>Вход в систему</h1>
            <form @submit.prevent="login">
                <input v-model="email" type="email" placeholder="Email" required>
                <input v-model="password" type="password" placeholder="Пароль" required>
                <button type="submit">Войти</button>
            </form>
            <p v-if="error">{{ error }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')

const login = async () => {
    const { error: err } = await authStore.login(email.value, password.value)
    if (err) {
        error.value = 'Неверный email или пароль'
    } else {
        router.push('/')
    }
}
</script>

<style scoped>
.login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: #f8fafc;
}

.login-form {
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
}

.login-form input {
    width: 100%;
    padding: 12px;
    margin-bottom: 15px;
    border: 1px solid #cbd5e1;
    border-radius: 6px;
}

.login-form button {
    width: 100%;
    padding: 12px;
    background: #1e40af;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
}
</style>