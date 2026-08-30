import { defineStore } from 'pinia'

const defaultRoles = [
  { id: 'admin', name: 'Admin' },
  { id: 'director', name: 'Director' },
  { id: 'accountant', name: 'Accountant' },
  { id: 'manager', name: 'Manager' },
  { id: 'master', name: 'Master' },
  { id: 'warehouse_manager', name: 'Warehouse Manager' },
]

export const useRolesStore = defineStore('roles', {
  state: () => ({
    roles: defaultRoles,
  }),
  getters: {
    getRoleById: (state) => (id) => state.roles.find((role) => role.id === id),
  },
  actions: {
    async fetchRoles() {
      // Возможное расширение: загрузка ролей из Supabase
      return this.roles
    },
  },
})