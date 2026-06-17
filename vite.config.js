import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        // Separa as bibliotecas grandes em chunks próprios para tirarem partido
        // da cache do browser (mudam pouco) e não inflarem o bundle de arranque.
        // O Leaflet (mapa) fica num chunk à parte que só é pedido nas páginas que
        // usam mapa (Mapa / detalhe de rota).
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('leaflet')) return 'leaflet'
            if (id.includes('react-router')) return 'react-router'
            if (id.includes('/react/') || id.includes('/react-dom/') || id.includes('/scheduler/')) {
              return 'react-vendor'
            }
          }
        },
      },
    },
  },
})
