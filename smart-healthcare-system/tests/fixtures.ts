import { test as base, expect, type Page, type BrowserContext } from '@playwright/test';

type PatientFixtures = {
  authenticatedPatientPage: Page;
};

export const test = base.extend<PatientFixtures>({
  authenticatedPatientPage: async ({ browser }, use) => {
    // Firebase v9+ stores auth tokens in IndexedDB (not localStorage), so
    // Playwright's storageState cannot capture or restore the session.
    // The reliable approach is to perform a real login for every test that
    // needs an authenticated context.
    const authContext: BrowserContext = await browser.newContext();
    const page = await authContext.newPage();

    await page.goto('/login');

    // The login page renders "Checking authentication..." while resolving the admin
    // session and Firebase auth state. Wait for the email input to confirm the form
    // has fully rendered before attempting to fill it.
    await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });

    await page.locator('#email').fill('adrielperera321@gmail.com');
    await page.locator('#password').fill('helloadriel');
    await page.getByRole('button', { name: 'Login with Email' }).click();

    // Wait for the patient dashboard redirect to complete.
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Wait for the h1 to confirm React has fully hydrated before the test begins.
    await expect(page.locator('h1')).toBeVisible();

    await use(page);

    await authContext.close();
  },
});

export { expect } from '@playwright/test';
