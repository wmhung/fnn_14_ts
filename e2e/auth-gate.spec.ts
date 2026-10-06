import { test, expect } from '@playwright/test';

test('unauthenticated visit to /placelist shows the sign-in prompt', async ({
  page,
}) => {
  await page.goto('/placelist');

  await expect(
    page.getByRole('heading', { name: /尋找你的下一個夢幻島/ }),
  ).toBeVisible();

  await expect(
    page.getByText(/登入以在地圖上發現、儲存並探索地點/),
  ).toBeVisible();
});
