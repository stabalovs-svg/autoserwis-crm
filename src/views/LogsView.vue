<template>
    <div>
        <h1>{{ $t('logs') }}</h1>
        <table class="logs-table">
            <thead>
                <tr>
                    <th>{{ $t('date') }}</th>
                    <th>{{ $t('action') }}</th>
                    <th>{{ $t('user') }}</th>
                    <th>{{ $t('details') }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="log in logs" :key="log.id">
                    <td>{{ new Date(log.created_at).toLocaleString() }}</td>
                    <td>{{ log.action }}</td>
                    <td>{{ log.user_email }}</td>
                    <td>{{ log.details }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/services/supabase'

const logs = ref([])

const fetchLogs = async () => {
    const { data } = await supabase.from('logs').select('*').order('created_at', { ascending: false })
    logs.value = data || []
}

onMounted(fetchLogs)
</script>

<style scoped>
.logs-table {
    width: 100%;
    border-collapse: collapse;
}

.logs-table th,
.logs-table td {
    border: 1px solid #e2e8f0;
    padding: 12px;
    text-align: left;
}

.logs-table th {
    background: #f1f5f9;
}
</style>