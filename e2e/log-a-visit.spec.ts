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
    page.getByText(/sign in to discover, save, and explore places on the map/i),
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
  // visit count: "📌 Log your first visit" when empty, "＋ Log a visit" otherwise.
  await expect(
    page.getByRole('button', { name: /log (a|your first) visit/i }),
  ).toBeVisible();
});
