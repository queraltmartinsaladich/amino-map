import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/amino-map/',
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    include: ['molstar'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler' 
      },
    },
  },
})