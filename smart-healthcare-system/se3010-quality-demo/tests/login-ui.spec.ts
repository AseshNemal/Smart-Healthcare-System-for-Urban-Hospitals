import { test, expect } from '@playwright/test';

test.describe('SE3010 Demo - Login UI validation', () => {
  test('login page renders required fields and actions', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Smart Healthcare Login' })).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Login with Email/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Login with Google/i })).toBeVisible();
  });

  test('email login button triggers validation for empty fields', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: /Login with Email/i }).click();

    const emailIsInvalid = await page.locator('#email').evaluate((el) => (el as HTMLInputElement).matches(':invalid'));
    const passwordIsInvalid = await page.locator('#password').evaluate((el) => (el as HTMLInputElement).matches(':invalid'));

    expect(emailIsInvalid).toBeTruthy();
    expect(passwordIsInvalid).toBeTruthy();
  });
});
