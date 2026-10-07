import { defineStore } from 'pinia'
import { ref } from 'vue'

// Placeholder de sesión: se completa en Fase 4 (login + JWT + roles).
export const useSessionStore = defineStore('session', () => {
  const token = ref<string | null>(null)
  return { token }
})
