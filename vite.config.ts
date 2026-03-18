import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './', // Esto es vital para que el ESP32 encuentre las imágenes
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  }
})