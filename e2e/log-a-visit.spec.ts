import { test, expect } from '@playwright/test';

test('an authenticated user can reach the "Log a visit" action on a place', async ({
  page,
}) => {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('fnn_guest_tour_seen', '1');
    } catch {
      /* ignore */
    }
  });

  await page.goto('/placelist');

  // Auth gate passed: the sign-in prompt is gone.
  await expect(
    page.getByText(/登入以在地圖上發現、儲存並探索地點/),
  ).toHaveCount(0);

  // Open the first saved place's detail page (PlaceItem links to
  // placelist/<id>/?lat=...&lng=...).
  const firstPlace = page
    .locator('a[href*="placelist/"][href*="lat="]')
    .first();
  await expect(firstPlace).toBeVisible();
  await firstPlace.click();
  await expect(page).toHaveURL(/\/placelist\/\d+/);

  // The journey reaches the action point. VisitsSection labels the button by
  // visit count: 「記錄你的第一次造訪」 when empty, 「＋ 記錄造訪」 otherwise.
  await expect(
    page.getByRole('button', { name: /記錄(你的第一次)?造訪/ }),
  ).toBeVisible();
});
