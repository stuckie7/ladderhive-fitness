
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { componentTagger } from "lovable-tagger";

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
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    exclude: ["lovable-tagger"], 
  },
  define: {
    'process.env': {},
  },
  esbuild: {
    target: 'esnext',
    logLevel: 'info',
  },
}));
