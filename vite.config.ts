import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

// En dev, /api se redirige al backend. Hoy apunta directo a activos-service;
// en Fase 6 se cambia el target al Spring Cloud Gateway.
export default defineConfig({
  plugins: [vue()],
  server: {
    // 15273 es el dev server dentro del bloque 152xx de este proyecto; el 5173
    // por defecto choca con los otros frontends del workspace.
    port: 15273,
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
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,vue}'],
      // El arranque no es codigo a cubrir: main.ts solo monta el arbol, y las
      // tres vistas de src/views/ son scaffold que esperan los 3 endpoints de
      // activos que todavia no existen (ver convenciones.md § Cobertura).
      exclude: ['src/main.ts', 'src/vite-env.d.ts', 'src/**/*.d.ts', 'src/views/**'],
      // Sin umbral todavia: hoy hay un solo test (session.spec.ts) y un
      // umbral aca pinearia un numero que mide codigo condenado. Entra con la
      // primera pantalla real que consuma el backend.
    },
  },
})
