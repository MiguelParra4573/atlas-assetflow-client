# CLAUDE.md

Frontend de Atlas AssetFlow (CMMS): Vue 3 + TypeScript + Pinia + Vue Router + Vitest, sobre Vite.
Backend en el repo hermano `atlas-assetflow-services`.

## Antes de tocar código

- Arquitectura y stack: `../docs/arquitectura.md` (raíz del workspace).
- Cómo se escribe el código de este repo, y qué gate lo rompe si no se cumple: `convenciones.md`
  (este directorio).
- En qué orden se construye: `../docs/plan.md`.

## Arranque local

```
npm install
npm run dev      # http://localhost:15273 (proxy /api → http://localhost:8091)
npm run build    # typecheck + bundle de produccion
```

## El harness de calidad

`npm install` activa los hooks de git solo (script `prepare`). `npm run build`, `npm run lint` y
`npm run typecheck` son los gates: Prettier, ESLint (con el template `.vue` incluido — no oxlint,
ver `convenciones.md` § Lint), TypeScript estricto. Si algo falla, `convenciones.md` dice qué gate
fue y cómo se arregla.

**Ningún componente de `src/views/` ni de `src/components/` llama `fetch` directo**: el acceso a la
red pasa por `src/api/`. Un `fetch(` en una vista rompe el lint (`no-restricted-globals`), a
propósito.
