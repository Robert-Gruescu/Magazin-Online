import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    // Cod care rulează în Node, nu în browser: funcțiile serverless și
    // fișierele de configurare / plugin ale lui Vite.
    files: ['api/**/*.js', 'vite.config.js', 'vite-plugin-api.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Providerele exportă și hook-ul aferent (useCart, useAuth…), tipar uzual
    // pentru Context API. Fast refresh nu e o problemă aici.
    files: ['src/context/**/*.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
