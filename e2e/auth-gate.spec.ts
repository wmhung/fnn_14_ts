import { test, expect } from '@playwright/test';

test('unauthenticated visit to /placelist shows the sign-in prompt', async ({
  page,
}) => {
  await page.goto('/placelist');

  await expect(
    page.getByRole('heading', { name: /find your next neverland/i }),
  ).toBeVisible();

  await expect(
    page.getByText(/sign in to discover, save, and explore places on the map/i),
  ).toBeVisible();
});
