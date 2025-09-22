import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/v1\.fontapi\.ir\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'font-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          }
        ]
      },
      includeAssets: ['favicon.svg', 'icon-*.svg', 'checkman-features.svg'],
      manifest: {
        name: 'چک من',
        short_name: 'چک من',
        description: 'برنامه مدیریت چک با قابلیت‌های پیشرفته - Advanced check management application',
        theme_color: '#2563eb',
        background_color: '#2563eb',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'fa',
        dir: 'rtl',
        categories: ['finance', 'productivity', 'business'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'چک جدید',
            short_name: 'چک جدید',
            description: 'افزودن چک جدید',
            url: '/?action=new',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }]
          },
          {
            name: 'چک‌های پیش رو',
            short_name: 'پیش رو',
            description: 'مشاهده چک‌های پیش رو',
            url: '/?tab=upcoming',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' }]
          }
        ]
      }
    })
  ],
  root: '.',
  base: '/',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'
    }
  }
})
