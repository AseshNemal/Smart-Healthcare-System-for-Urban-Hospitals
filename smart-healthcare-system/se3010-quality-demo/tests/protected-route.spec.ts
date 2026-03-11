import { test, expect } from '@playwright/test';

test.describe('SE3010 Demo - Route protection behavior', () => {
  test('unauthenticated user is redirected from dashboard to login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: 'Smart Healthcare Login' })).toBeVisible();
  });
});
