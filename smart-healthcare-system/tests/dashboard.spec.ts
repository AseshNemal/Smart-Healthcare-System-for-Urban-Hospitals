import { test, expect } from './fixtures';

test.describe('Patient Dashboard (pre-authenticated)', () => {
  test('Authenticated patient can access dashboard directly without logging in', async ({
    authenticatedPatientPage: page,
  }) => {
    // Navigate directly to the protected dashboard route.
    // The browser context was created with storageState containing Firebase's localStorage
    // tokens, so onAuthStateChanged restores the user session without redirecting to /login.
    await page.goto('/dashboard');

    // Wait for h1 to appear — it only renders after authLoading === false and user !== null.
    // This serves as both the Firebase auth-restore signal and the React hydration signal.
    await expect(page.locator('h1')).toBeVisible();

    // Assert no redirect to /login occurred — confirming the protected route was served
    // to an authenticated user
    await expect(page).toHaveURL(/\/dashboard/);

    // Assert the main dashboard heading
    await expect(page.locator('h1')).toContainText('Welcome Back!');

    // Assert the Appointments section loaded — confirms the data-fetching useEffect ran
    await expect(page.locator('h2')).toContainText('Your Appointments');

    // Assert the Book Appointment quick-action button is visible and interactive
    const bookButton = page.getByRole('button', { name: /Book Appointment/ });
    await expect(bookButton).toBeVisible();
    await expect(bookButton).toBeEnabled();
  });
});
