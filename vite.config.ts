import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { resolve } from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      host: "::",
      port: 8080,
    },
  },
  build: {
    target: "esnext",
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: mode === 'development',
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": "./src",
    },
  },
  optimizeDeps: {
    include: ['@radix-ui/react-icons', 'lovable-tagger'],
  },
  define: {
    'process.env': {},
  },
  esbuild: {
    target: 'esnext',
    logLevel: 'info',
  },
}));
