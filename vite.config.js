import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// En GitHub Pages la app vive en https://<usuario>.github.io/uca-tickets/
// Por eso "base" lleva el nombre del repositorio. React Router toma de aquí su basename.
const base = '/uca-tickets/';

export default defineConfig({
  base,
  plugins: [
    react(),
    // PWA: manifest + service worker generado con Workbox
    VitePWA({
      registerType: 'prompt', // la app avisa cuando hay versión nueva (no se recarga sola)
      injectRegister: false, // el registro lo hace el componente PwaNotices
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        id: base,
        name: 'UCA TICKETS',
        short_name: 'UCA TICKETS',
        description: 'Compra boletos para conciertos y lleva tus entradas con código QR, incluso sin conexión.',
        lang: 'es',
        start_url: base,
        scope: base,
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0b0b14',
        background_color: '#0b0b14',
        categories: ['entertainment', 'music', 'shopping'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache del "app shell": HTML, JS, CSS, iconos y favicon
        globPatterns: ['**/*.{html,js,css,png,svg,woff2}'],
        // Las imágenes de eventos y la API NO van en el precache: usan las estrategias de abajo
        globIgnores: ['img/eventos/**', 'api/**'],
        // Fallback de navegación SPA: cualquier ruta (/eventos/soda-stereo, /admin...) abre index.html
        navigateFallback: `${base}index.html`,
        navigateFallbackDenylist: [/\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // API falsa (public/api/*.json): primero la red; sin conexión, lo último guardado.
            // Se usa RegExp (no una función con "base") porque Workbox copia el patrón tal cual al sw.js.
            urlPattern: new RegExp(`${base}api/.*\\.json$`),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'uca-api',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Imágenes (afiches de eventos): primero la caché, no cambian
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'uca-imagenes',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Hoja de estilos de Google Fonts
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            // Archivos de la fuente Inter
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
