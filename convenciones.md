# Convenciones de código — atlas-assetflow-client

Cómo se escribe el código de este repo y qué lo verifica. El **por qué** de cada elección está en
`../docs/adr/0001-harness-de-calidad.md`, raíz del workspace, que aplica a los dos repos; acá está
el **cómo**.

La arquitectura —qué capa puede llamar a qué— es otro documento: `../docs/arquitectura.md` en la
raíz del workspace.

## Puesta a punto

```bash
npm install    # instala y, con el script prepare, activa los hooks de git
```

No hace falta configurar `core.hooksPath` a mano: lo hace el script `prepare` en cada
`npm install`. Si alguna vez hay que forzarlo: `git config core.hooksPath .githooks`.

Hace falta **Node 22**.

## Los gates que rompen el build

| Gate | Comando | Qué verifica | Cómo se arregla |
| --- | --- | --- | --- |
| Prettier | `npm run format:check` | Formato de todo el repo menos el markdown | `npm run format` |
| ESLint | `npm run lint` | `.ts` **y `.vue`, template incluido**, con `--max-warnings 0` | El mensaje señala la regla |
| TypeScript | `npm run typecheck` | Tipado estricto de los dos proyectos (`tsconfig.app.json`, `tsconfig.node.json`) | Arreglar el tipo; no se silencia con `any` |
| Vitest | `npm run test:coverage` | Tests, y genera `coverage/` | Escribir el test que falta |
| Vite | `npm run build` | Que el bundle de producción se construya | — |

CI los corre en ese orden, del más rápido y más barato de arreglar al más caro: si `vue-tsc` ya
falló, `vite build` no agrega información.

El `pre-commit` corre solo Prettier y ESLint, y **solo sobre los archivos staged**. No corre
`vue-tsc`, que es de proyecto completo, ni los tests, ni el build: eso es trabajo de CI.

## Formato

**Prettier 3.9.10**, pineado exacto sin caret: es un gate que rompe el build, así que un
`npm install` en otra máquina no debe poder cambiarle la versión sin un commit.

```bash
npm run format          # formatea
npm run format:check    # verifica (lo corre CI y el pre-commit)
```

`.prettierrc.json` declara **solo** `singleQuote` y `semi: false`, que es lo que el código ya
practicaba (`vite.config.ts`, `http.ts`). `printWidth`, `tabWidth` y `endOfLine` **no van ahí**:
Prettier lee el `.editorconfig` por defecto desde la 3.x, y repetirlos crearía una segunda fuente de
verdad que después diverge. El ancho de línea es el `max_line_length = 100` del `.editorconfig`.

El **markdown no se formatea**: está en `.prettierignore` porque las tablas de `CLAUDE.md` y de
este archivo están hechas a mano y Prettier las reacomoda en cada `format`.

Un commit de reformateo masivo **no lleva ningún otro cambio, nunca**, y su SHA va a
`.git-blame-ignore-revs`. Para que `git blame` local lo honre:

```bash
git config blame.ignoreRevsFile .git-blame-ignore-revs
```

## Lint

**ESLint + `eslint-plugin-vue`, no oxlint.** La razón está en `../docs/adr/0001-harness-de-calidad.md`
y se resume en una línea: oxlint no lintea el bloque `<template>` de un SFC —solo ve `<script>`—, y
en un proyecto Vue los bugs viven en el template. Es una divergencia deliberada de
`atlas-waypoint-frontend`, que usa oxlint porque es React.

Config plana (`eslint.config.js`): `eslint-plugin-vue` en `flat/recommended` + `typescript-eslint` +
`@vue/eslint-config-prettier` al final de la cadena, para que **Prettier sea el único dueño del
estilo** —el conflicto clásico de dos dueños—. `eslint`, `eslint-plugin-vue` y los paquetes
`@vue/eslint-config-*` van **pineados exactos**, por lo mismo que Prettier.

Reglas puestas a mano por encima del preset, con su razón:

- `vue/no-v-html` a **error**: XSS. HTML crudo sin sanitizar.
- `vue/require-v-for-key` a **error**: el bug recurrente de un SFC, una lista sin `key` rompe el
  diffing del DOM virtual en silencio.
- `vue/no-mutating-props`: una prop mutada rompe el flujo de datos de arriba hacia abajo.
- `@typescript-eslint/no-explicit-any` a **error**: ver `any` en el típado no se permite; usar
  `@ts-expect-error` con comentario si hace falta un escape real.

`--max-warnings 0` va en el script. Sin eso, un `warn` no se ve nunca.

## Tipado

`tsconfig.base.json` tiene el rigor extra, y `tsconfig.app.json` (que ya hereda `strict` de
`@vue/tsconfig`) y `tsconfig.node.json` lo extienden además. Lo que está activado, más allá de
`strict`:

- **`noUncheckedIndexedAccess`**: `lista[i]` es `T | undefined`. Con listas que llegan de la API
  (activos, órdenes), es la clase de bug que se ve en producción y no en el test.
- **`exactOptionalPropertyTypes`**: `prop?: X` no acepta `undefined` explícito.
- `noImplicitOverride`, `noImplicitReturns`.

Un error de tipo **no se silencia con `any` ni con `@ts-ignore`**. Si hace falta un escape, es
`@ts-expect-error` con un comentario que diga por qué, y falla el build el día en que el error
desaparece —que es exactamente lo que se quiere—.

Si `exactOptionalPropertyTypes` se vuelve impracticable con alguna librería de terceros, se apaga
**en un PR con la razón escrita**, nunca en silencio.

`skipLibCheck` se mantiene en `true`: los tipos de terceros no son trabajo de este repo.

## Cobertura

```bash
npm run test:coverage    # genera coverage/index.html
```

**Sin umbral todavía**, a propósito. Hoy hay un solo test (`src/stores/session.spec.ts`) y las tres
vistas (`ActivosView`, `OrdenesView`, `LoginView`) son placeholders que esperan endpoints que no
existen. Un umbral acá pinearía un número que mide código condenado.

El umbral entra con la primera pantalla real que consuma el backend, y desde ahí **solo sube**.
Bajarlo pide una entrada en `../docs/bitacora.md` con la razón.

## La frontera de `src/api`

`../docs/arquitectura.md` dice que ningún componente llama `fetch` directo: todo acceso a la red
pasa por `src/api/`. A diferencia de `atlas-waypoint-frontend`, esta frontera **entra ahora y no
diferida**: ahí los globs apuntarían a carpetas vacías porque `src/features/` no existía; acá
`src/api/http.ts`, `src/views/` y `src/components/` **ya existen**.

El bloque vive en `eslint.config.js`, bajo el bloque `app/frontera-de-src-api`:

```js
{
  files: ['src/views/**', 'src/components/**'],
  rules: {
    'no-restricted-globals': [
      'error',
      { name: 'fetch', message: 'La red se accede por src/api/.' },
      { name: 'EventSource', message: 'El SSE se abre en src/api/.' },
      { name: 'WebSocket', message: 'La red se accede por src/api/.' },
      { name: 'XMLHttpRequest', message: 'La red se accede por src/api/.' },
    ],
  },
}
```

Se usa `no-restricted-globals`, el mismo criterio de `atlas-waypoint-frontend`: lo que hay que
prohibir son identificadores globales, no sintaxis.

**Límite conocido, declarado en vez de disimulado:** `const { fetch } = window` y un `import()`
dinámico se escapan de la regla. El gate enseña y atrapa el caso normal; no es una frontera
hermética.

**Verificado inyectando la violación a propósito**: un `fetch(` directo en una vista, un `v-html`
sin sanitizar y un `v-for` sin `:key`, los tres a la vez. `npm run lint` falló señalando las tres
líneas exactas, y es la comprobación que justifica haber descartado oxlint —si no hubiera fallado,
la divergencia no habría valido la pena.

## Idioma y nombres

Igual que el backend, y por la misma razón: es un proyecto de portafolio de un autor, no un ERP
multiequipo.

- En **inglés**: nombres de componente de archivo (`ActivosView.vue`), campos de DTO —son el
  contrato con el backend—.
- En **español**: la prosa, los comentarios, y los nombres de tipo y de función de negocio
  (`Activo`, `OrdenTrabajo`, `cargarActivos`), igual que en `services/`: el dominio se piensa en
  español en los dos repos.

## Commits

Convencionales, validado por `.githooks/commit-msg`, que es **byte por byte el mismo archivo que en
el backend**: si se cambia uno, se cambia el otro.

```
<tipo>(<alcance opcional>): <asunto en minúscula, hasta 80 caracteres>
```

Tipos: `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `style`, `test`. El cuerpo
y el pie quedan libres. Los mensajes que genera git solo (`Merge`, `Revert`, `fixup!`, `squash!`,
`Reapply`) no se validan: sin ese escape, `git merge` y `git rebase --autosquash` fallarían.

El `pre-commit` **verifica, nunca arregla**: un hook que reescribe archivos con staging parcial deja
el índice desincronizado y commitea algo que nadie leyó. Eso es también lo que hace innecesario
`lint-staged`.

## Trampas conocidas

1. **El `pre-commit` usa dos listas de archivos, no una.** Prettier formatea también `css`, `json`
   y `html`, pero ESLint solo entiende `.ts`/`.vue`/`.js` y falla con "No files matching the
   pattern" si se le pasa una lista en la que ninguno le corresponde. Con una sola lista, un commit
   que solo toca `package.json` fallaría por un falso positivo.
2. **El ancho de línea vive en el `.editorconfig`, no en `.prettierrc.json`.** Si alguien borra
   `max_line_length = 100`, Prettier vuelve a 80 **sin avisar** y el siguiente `format` reformatea
   todo el repo.
3. **Las versiones de `prettier` y `eslint` van sin caret a propósito.** Para una herramienta que
   rompe el build, eso significa que un `npm install` en otra máquina no puede romper CI sin un
   commit visible. Los sube Dependabot.
4. **`undici` (transitivo de `jsdom`, solo en tests) necesita un override.** `jsdom@29.1.1` fija
   `undici@^7.25.0`, cuyo rango entero (`7.0.0`–`7.30.0`) tiene vulnerabilidades altas conocidas sin
   que `npm audit fix` las resuelva sin un major de `jsdom`. El `overrides` del `package.json` lo
   fuerza a `7.30.1`, que ya las corrige, sin tocar la versión de `jsdom`. Si `npm install` vuelve a
   mostrar una vulnerabilidad de `undici`, lo primero es revisar si ese override sigue siendo
   necesario o si ya alcanza con la versión que trae `jsdom`.

Y una del entorno: los hooks se ejecutan con el `sh` de Git for Windows. Si un hook tuviera CRLF
fallaría con `bad interpreter: /bin/sh^M` y **git no avisa**, se lo saltaría en silencio; de eso se
encarga la regla `/.githooks/** text eol=lf` del `.gitattributes`.
