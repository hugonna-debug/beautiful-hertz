/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { weaponPipelinePlugin } from './src/DEV_MODE_ONLY/weaponPipelinePlugin.ts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), weaponPipelinePlugin()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
  server: {
    host: true,
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'bundle',
    emptyOutDir: true
  }
})
