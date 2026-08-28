import { test as setup, expect } from '@playwright/test';

const STORAGE_STATE = 'e2e/.auth/state.json';

// Logs in through the real LoginForm and saves the session cookie so the
// authenticated specs don't each have to repeat the login.
setup('authenticate', async ({ page }) => {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;
  if (!email || !password) {
    throw new Error('Set E2E_EMAIL and E2E_PASSWORD in .env.test');
  }

  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Password').fill(password);
  await page.getByRole('button', { name: 'Continue with email' }).click();

  // On success LoginForm does window.location.href = '/'.
  await page.waitForURL('http://localhost:3000/');
  // Guard against a silent auth failure (would leave us on /login with a banner).
  await expect(page).not.toHaveURL(/\/login/);

  await page.context().storageState({ path: STORAGE_STATE });
});
