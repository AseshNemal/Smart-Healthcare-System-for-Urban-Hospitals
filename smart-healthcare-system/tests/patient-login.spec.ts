import { test, expect } from '@playwright/test';

test.describe('Patient Login Flow', () => {
  test('Patient can log in with valid credentials and reach the dashboard', async ({ page }) => {
    await page.goto('/login');

    // The login page renders "Checking authentication..." while resolving the admin session
    // via /api/admin/me and the Firebase auth state. Wait for the email input to confirm
    // the form has fully rendered before interacting with it.
    await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });

    const testEmail = process.env.TEST_PATIENT_EMAIL;
    const testPassword = process.env.TEST_PATIENT_PASSWORD;
    if (!testEmail || !testPassword) {
      throw new Error(
        'TEST_PATIENT_EMAIL and TEST_PATIENT_PASSWORD must be set. ' +
        'Copy .env.example to .env and fill in the test patient credentials.'
      );
    }
    await page.locator('#email').fill(testEmail);
    await page.locator('#password').fill(testPassword);
    await page.getByRole('button', { name: 'Login with Email' }).click();

    // Assertion type 1 — URL: confirms the login handler completed the role check
    // (/api/users/check-role) and issued the router.push('/dashboard') redirect.
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });

    // Assertion type 2 — visibility: confirms key dashboard elements are rendered
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/Patient Portal/).first()).toBeVisible();

    // Assertion type 3 — text content: confirms the correct text is displayed,
    // not just that an element exists
    await expect(page.locator('h1')).toContainText('Welcome Back!');
    await expect(page.locator('h2')).toContainText('Your Appointments');
  });
});
