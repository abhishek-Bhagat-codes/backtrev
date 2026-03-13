import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://10.0.82.200:7172',
        changeOrigin: true,
      },
      '/ms': {
        target: 'http://10.0.82.200:3000',
        changeOrigin: true
      },
    },
  },
})
