<template>
    <div>
        <h1>{{ $t('reports') }}</h1>
        <p>{{ $t('reportsDescription') }}</p>

        <div class="reports-grid">
            <div class="report-card">
                <h3>{{ $t('generalStats') }}</h3>
                <p>{{ $t('totalClients') }}: {{ totalClients }}</p>
                <p>{{ $t('todayAppointments') }}: {{ todayAppointments }}</p>
            </div>
            <div class="report-card">
                <h3>{{ $t('popularServices') }}</h3>
                <ul>
                    <li>{{ $t('oilChange') }} — 45%</li>
                    <li>{{ $t('diagnostics') }} — 30%</li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const totalClients = ref(45)
const todayAppointments = ref(12)
</script>

<style scoped>
.reports-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-top: 20px;
}

.report-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>