import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

/**
 * Public path the app is served from. GitHub Pages hosts project sites under `/<repository>/`,
 * so the deploy workflow passes `BASE_PATH=/mui-dashboard`. Locally the app is served from `/`.
 */
const basePath = process.env.BASE_PATH?.replace(/\/+$/, '') ?? '';

// https://vite.dev/config/
export default defineConfig({
  base: `${basePath}/`,
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    restoreMocks: true,
    // Full-page smoke tests render the data grid and charts, which is slow in jsdom.
    testTimeout: 15_000,
  },
});
