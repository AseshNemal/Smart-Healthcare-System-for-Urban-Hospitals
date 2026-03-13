import { test as base, expect, type Page, type BrowserContext } from '@playwright/test';

type DoctorFixtures = {
  authenticatedDoctorPage: Page;
};

// Test doctor credentials - ensure this account exists in your system
const TEST_DOCTOR_EMAIL = 'y@gmail.com';
const TEST_DOCTOR_PASSWORD = '123456';

export const test = base.extend<DoctorFixtures>({
  authenticatedDoctorPage: async ({ browser }, use) => {
    // Firebase v9+ stores auth tokens in IndexedDB (not localStorage), so
    // Playwright's storageState cannot capture or restore the session.
    // The reliable approach is to perform a real login for every test that
    // needs an authenticated doctor context.
    const authContext: BrowserContext = await browser.newContext();
    const page = await authContext.newPage();

    await page.goto('/doctor/login');

    // The login page renders while resolving the Firebase auth state.
    // Wait for the email input to confirm the form has fully rendered
    // before attempting to fill it.
    await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });

    // Fill in doctor credentials
    await page.locator('#email').fill(TEST_DOCTOR_EMAIL);
    await page.locator('#password').fill(TEST_DOCTOR_PASSWORD);
    
    // Click the login button
    await page.getByRole('button', { name: /Login/i }).click();

    // Wait for the doctor dashboard redirect to complete
    await expect(page).toHaveURL(/\/doctor\/dashboard/, { timeout: 15000 });

    // Wait for the dashboard to fully load and confirm React has hydrated
    await expect(page.getByText('Doctor Portal')).toBeVisible({ timeout: 10000 });

    await use(page);

    await authContext.close();
  },
});

export { expect } from '@playwright/test';
