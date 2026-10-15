import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Todo lo que el front pida a /api/... se reenvía al backend de Spring Boot.
    // Ejemplo: /api/paises -> http://127.0.0.1:8080/paises
    // Así el navegador cree que todo viene del mismo servidor y no hay problemas de CORS.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        rewrite: (ruta) => ruta.replace(/^\/api/, ''),
      },
    },
  },
})
