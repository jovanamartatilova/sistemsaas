import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'jspdf-autotable': path.resolve(__dirname, 'node_modules/jspdf-autotable/dist/jspdf.plugin.autotable.mjs'),
    },
  },
  optimizeDeps: {
    include: ['jspdf', 'jspdf-autotable'],
  },
  build: {
    // Output to Laravel public folder
    outDir: '../backend/public/dist',
    emptyOutDir: true,
    sourcemap: false, // Set to true for debugging in production
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // Remove console logs
      },
    },
    rollupOptions: {
      output: {
        // Optimize chunk naming for better caching
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
  server: {
    // Development server configuration
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
})
