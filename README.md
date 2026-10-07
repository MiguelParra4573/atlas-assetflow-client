# client — Atlas AssetFlow (Vue 3)

Frontend del CMMS Atlas AssetFlow. Backend en el repo `atlas-assetflow-services`.

Vue 3 + TypeScript + Pinia + Vue Router + Vitest, sobre Vite.

```
npm install
npm run dev      # http://localhost:5173 (proxy /api → http://localhost:8091)
npm test
npm run build
```

Estructura: `src/api` (cliente HTTP), `src/router`, `src/stores` (Pinia), `src/views`.
El proxy de `/api` está en `vite.config.ts`; en Fase 6 apuntará al Gateway.
