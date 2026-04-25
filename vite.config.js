import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react({ jsxRuntime: 'automatic' })],
  server: {
    proxy: {
      '/api/jup-price': {
        target: 'https://lite-api.jup.ag',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/jup-price/, '/price/v2'),
        secure: false,
      },
      '/api/token-list': {
        target: 'https://lite-api.jup.ag',
        changeOrigin: true,
        rewrite: () => '/tokens/v1/all',
        secure: false,
      },
    },
    watch: { usePolling: true, interval: 1000 },
    cors: true,
    allowedHosts: true,
  },
})