import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// En dev, /api se redirige al backend. Hoy apunta directo a activos-service;
// en Fase 6 se cambia el target al Spring Cloud Gateway.
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
})
