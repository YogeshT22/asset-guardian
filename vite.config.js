/**
 * vite.config.js
 * Production practices applied:
 * 1. Path alias (@/) — import from '@/components/Foo' instead of '../../components/Foo'
 *    Clean, refactor-proof imports. Standard in every serious React project.
 * 2. Build chunk splitting — vendor libs (React, Router) go in a separate cached chunk.
 *    Browser caches node_modules separately from your app code. Faster repeat loads.
 * 3. sourcemap: false in production — don't expose your source code to end users.
 * 4. Terser minification — smaller bundle = faster load.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      // Allows: import Foo from '@/components/Foo'
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    sourcemap: false, // Never expose source maps in production
    minify: 'terser',
    rollupOptions: {
      output: {
        // Chunk splitting: vendor libs cached separately from app code.
        // Function form is required for React 19 — the object form silently
        // produces empty chunks because React 19 uses different internal entry points.
        manualChunks(id) {
          if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) {
            return 'router';
          }
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/scheduler')) {
            return 'vendor';
          }
        },
      },
    },
  },

  server: {
    port: 5173,
    // Proxy API calls in dev so you never hardcode ports in components
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});
