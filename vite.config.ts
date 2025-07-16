import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    host: '0.0.0.0',
    strictPort: true,
    open: true
  },
  // Vercel-specific configurations
  build: {
    outDir: 'dist',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor and app code
          vendor: ['react', 'react-dom', 'react-router-dom'],
          // Split other large dependencies
          mui: ['@mui/material', '@emotion/react', '@emotion/styled'],
        },
      },
    },
    // Reduce chunk size warning limit
    chunkSizeWarningLimit: 1000,
  },
  // Base public path when served in production
  base: '/',
  // Environment files directory
  envDir: './',
  // Path aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
    include: ['react', 'react-dom', 'react-router-dom'],
  },
  // Preview server configuration
  preview: {
    port: 8080,
    strictPort: true,
  },
  // Environment variables
  define: {
    'process.env': { ...process.env },
  },
});
