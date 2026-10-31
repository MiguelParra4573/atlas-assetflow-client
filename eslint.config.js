// Flat config. Ver convenciones.md § Lint para el porque de ESLint y no oxlint:
// oxlint no lintea el bloque <template> de un SFC, y en Vue los bugs viven ahi
// (v-for sin key, v-html sin sanitizar). Ver docs/adr/0001-harness-de-calidad.md.
import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/archivos-a-lintear',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/archivos-a-ignorar',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**'],
  },

  js.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),

  // Prettier es el unico dueno del estilo: este preset apaga las reglas de
  // eslint-plugin-vue que pisan formato (indentacion, comas, etc.), para que
  // no existan dos opiniones sobre lo mismo. Va al final para ganar.
  skipFormatting,

  {
    name: 'app/reglas-propias',
    rules: {
      // XSS: v-html inyecta HTML crudo sin sanitizar.
      'vue/no-v-html': 'error',
      // El bug recurrente de un SFC: una lista sin key rompe el diffing del
      // DOM virtual de forma silenciosa.
      'vue/require-v-for-key': 'error',
      'vue/no-mutating-props': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  {
    name: 'app/frontera-de-src-api',
    // docs/arquitectura.md (y client/README.md) dicen que ningun componente
    // llama fetch directo: todo acceso a la red pasa por src/api/. A
    // diferencia de atlas-waypoint-frontend, esta frontera entra ahora y no
    // diferida: src/api/, src/views/ y src/components/ ya existen, asi que
    // los globs de abajo no apuntan a carpetas vacias.
    //
    // Limite conocido, declarado en vez de disimulado: const { fetch } =
    // window y un import() dinamico se escapan de esta regla. Atrapa el caso
    // normal, no es una frontera hermetica.
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
  },
]
