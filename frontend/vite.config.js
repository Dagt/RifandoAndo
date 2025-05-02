import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isDev = process.env.NODE_ENV !== 'production'

export default defineConfig({
  plugins: [react()],
  base: isDev ? '/' : '/static/',
  build: {
    outDir: '../frontend/dist',
    emptyOutDir: true,
    assetsDir: '',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: isDev
    ? {
        proxy: {
          '/api': 'http://localhost:8000',
        },
      }
    : undefined,
})
