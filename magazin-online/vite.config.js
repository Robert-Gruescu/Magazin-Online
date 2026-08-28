import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import apiDevServer from './vite-plugin-api.js'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Ruleaza functiile din api/ si in `npm run dev`, nu doar sub `vercel dev`.
    apiDevServer(),
  ],
})
