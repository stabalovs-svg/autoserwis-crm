import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue')
    },
    {
      path: '/clients',
      name: 'clients',
      component: () => import('@/views/ClientsView.vue')
    },
    {
      path: '/appointments',
      name: 'appointments',
      component: () => import('@/views/AppointmentsView.vue')
    },
    {
      path: '/inventory',
      name: 'inventory',
      component: () => import('@/views/InventoryView.vue')
    }
  ]
})

export default router