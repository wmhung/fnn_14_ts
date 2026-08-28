import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Load the git-ignored test credentials before the tests import the client.
config({ path: '.env.test' });

export default defineConfig({
  test: {
    environment: 'node', // real DB calls, no browser
    include: ['**/*.integration.test.ts'],
    testTimeout: 20000, // network round-trips to Supabase
    fileParallelism: false, // one file, shared test rows — keep it sequential
  },
});
