import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react' // <-- Aceasta este forma corectă
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})