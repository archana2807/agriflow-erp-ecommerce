import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
            if (id.includes('react-router')) return 'router';
            if (id.includes('@reduxjs/toolkit') || id.includes('react-redux')) return 'redux';
            if (id.includes('@tanstack')) return 'tanstack';
            if (id.includes('@radix-ui')) return 'radix';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('embla-carousel')) return 'carousel';
          }
        },
      },
    },
  },
})
