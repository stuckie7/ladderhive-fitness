
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Configure plugins based on mode
  const plugins = [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'production' && visualizer(),
  ].filter(Boolean);

  return {
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
      rollupOptions: {
        // Ensure proper handling of dynamic imports
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env': {},
    },
    esbuild: {
      target: 'esnext',
      logLevel: 'info',
    },
  };
});
