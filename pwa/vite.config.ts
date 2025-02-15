import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const port = parseInt(env.VITE_PORT || '3001')

  return {
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          name: 'WishWithMe',
          short_name: 'WishWithMe',
          description: 'WishWithMe - Create and Share Wishlists',
          start_url: '/',
          display: 'standalone',
          theme_color: '#2c3e50',
          background_color: '#ffffff',
          lang: 'en',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ]
        },
        workbox: {
          navigateFallback: '/index.html',
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\.wishwith\.me\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24 // 24 hours
                }
              }
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    optimizeDeps: {
      include: ['@fontsource/inter']
    },
    server: {
      host: true,
      port,
      strictPort: true,
      fs: {
        strict: false  // This is important for serving node_modules content
      },
      allowedHosts: [
        'wishwith.me',
        'localhost',
        '127.0.0.1'
      ]
    },
    preview: {
      host: true,
      port: parseInt(process.env.VITE_PREVIEW_PORT || '3001')
    },
    build: {
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name) {
              if (/\.(woff|woff2|eot|ttf|otf)$/.test(assetInfo.name)) {
                return 'assets/fonts/[name][extname]'
              }
            }
            return 'assets/[name]-[hash][extname]'
          }
        }
      }
    }
  }
}) 