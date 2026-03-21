import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/arena':       { target: 'http://localhost:8000', changeOrigin: true },
      '/vote':        { target: 'http://localhost:8000', changeOrigin: true },
      '/optimize':    { target: 'http://localhost:8000', changeOrigin: true },
      '/stats':       { target: 'http://localhost:8000', changeOrigin: true },
      '/history':     { target: 'http://localhost:8000', changeOrigin: true },
      '/leaderboard': { target: 'http://localhost:8000', changeOrigin: true },
      '/models':      { target: 'http://localhost:8000', changeOrigin: true },
      '/health':      { target: 'http://localhost:8000', changeOrigin: true },
    }
  }
})
