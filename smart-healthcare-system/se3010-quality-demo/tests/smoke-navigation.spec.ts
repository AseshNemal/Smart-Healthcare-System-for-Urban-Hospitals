import { test, expect } from '@playwright/test';

test.describe('SE3010 Demo - Public navigation smoke tests', () => {
  test('home page loads and shows key content', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Welcome to Smart Healthcare')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Your Health, Our Priority' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Explore Our Doctors/i })).toBeVisible();
  });

  test('about and contact pages are reachable from navbar', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.getByRole('heading', { name: 'About' })).toBeVisible();

    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(page.getByRole('heading', { name: 'Contact' })).toBeVisible();
    await expect(page.getByText('support@urbanhospital.example')).toBeVisible();
  });
});
