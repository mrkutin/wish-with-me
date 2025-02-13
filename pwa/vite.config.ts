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
          description: 'WishWithMe - это приложение для создания и управления списками желаний.',
          theme_color: '#2c3e50',
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
    server: {
      host: true,
      port,
      strictPort: true,
      fs: {
        allow: [
          '..',
          'node_modules/@fontsource/inter/files'
        ]
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
    }
  }
}) 