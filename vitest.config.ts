import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    // Unit + component only. Integration/E2E run via their own commands.
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/*.integration.test.{ts,tsx}',
      'e2e/**',
    ],
  },
});
