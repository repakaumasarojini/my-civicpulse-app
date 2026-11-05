import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // or your tailwind plugin setup

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/', // Ensure this is set to '/' for Vercel root deployment
})