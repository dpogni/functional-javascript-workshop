import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Tests import your code through the "@ex" alias.
// `npm run verify-solutions` points the alias at /solutions instead, so the
// reference solutions can be checked against the exact same tests.
const target = process.env.USE_SOLUTIONS ? 'solutions' : 'exercises';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@ex': fileURLToPath(new URL(`./${target}`, import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    include: ['tests/**/*.test.{js,jsx}'],
    restoreMocks: true,
  },
});
