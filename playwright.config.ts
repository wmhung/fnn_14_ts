import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';

// Load E2E_EMAIL / E2E_PASSWORD from the git-ignored .env.test.
// Tiny inline parser so the config needs no external dependency (dotenv).
try {
  for (const line of readFileSync('.env.test', 'utf8').split('\n')) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/); // skips blanks & # comments
    if (m && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
    }
  }
} catch {
  // .env.test is optional; the setup project will error clearly if creds missing.
}

const STORAGE_STATE = 'e2e/.auth/state.json';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    // 1) Logs in once, saves the session to STORAGE_STATE.
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // 2) Unauthenticated tests — no stored session.
    {
      name: 'logged-out',
      testMatch: /auth-gate\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: undefined },
    },

    // 3) Authenticated tests — reuse the saved session.
    {
      name: 'logged-in',
      testMatch: /log-a-visit\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
