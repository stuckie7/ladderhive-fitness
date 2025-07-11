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
  },
  base: '/', // Ensure base URL is set correctly for Vercel
  envDir: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
    },
  },
  // For Vercel rewrites
  preview: {
    port: 8080,
    strictPort: true,
  },
  // Handle environment variables
  define: {
    'process.env': process.env,
  },
});
