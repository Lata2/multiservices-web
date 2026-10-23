import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: { port: 5173, host: true },
  preview: { port: 4173, host: true },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Long-term-cacheable vendor chunks; app code stays split per route.
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 40 },
            { name: 'router', test: /node_modules[\\/]react-router[\\/]/, priority: 30 },
            { name: 'query', test: /node_modules[\\/]@tanstack[\\/]/, priority: 30 },
            { name: 'forms', test: /node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/, priority: 30 },
            { name: 'ui-vendor', test: /node_modules[\\/](lucide-react|tailwind-merge|clsx)[\\/]/, priority: 20 },
            { name: 'mock-api', test: /src[\\/](mocks|services)[\\/]/, priority: 10 },
          ],
        },
      },
    },
  },
});
