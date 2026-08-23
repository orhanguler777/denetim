import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['zabita-logo.jpg'],
      manifest: {
        name: 'Zabıta Saha Gözlem',
        short_name: 'Zabıta Gözlem',
        description: 'Zabıta saha çalışma ve süreç analiz uygulaması',
        theme_color: '#1e3a8a', // blue-900
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'zabita-logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg',
            purpose: 'any maskable'
          },
          {
            src: 'zabita-logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})
