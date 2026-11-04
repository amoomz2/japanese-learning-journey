import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base so the build works on GitHub Pages under /japanese-learning-journey/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Registration is done in src/pwa/offline.js so users can turn offline mode off.
      injectRegister: false,
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icon.svg'],
      manifest: {
        name: 'Japanese Learning Journey',
        short_name: 'Japanese Journey',
        description: 'Kana charts, vocabulary, flashcards, quizzes and a study log.',
        lang: 'en',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#fbf7f4',
        theme_color: '#fbf7f4',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // All lessons live in the JS bundle, so precaching the build makes everything available offline.
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            // Textbook audio: saved per lesson from the Listening page ("Save audio for offline").
            // Range requests are served from the cached file so audio seeking works offline on iPhone.
            urlPattern: ({ url }) => url.pathname.includes('/audio/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'jlj-audio',
              rangeRequests: true,
              cacheableResponse: { statuses: [200] },
            },
          },
        ],
      },
    }),
  ],
  base: './',
})
