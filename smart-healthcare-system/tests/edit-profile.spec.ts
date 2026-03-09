import { test, expect } from './fixtures';

test.describe('Patient Profile Edit', () => {
  test('Patient can edit their profile and see the success confirmation', async ({
    authenticatedPatientPage: page,
  }) => {
    // The profile page's auth guard is `if (!user) router.push('/login')` with
    // no authLoading check. This fires before onAuthStateChanged resolves even
    // on client-side navigation. To guarantee user is in context before the
    // profile component mounts, we perform a full /dashboard page load (the
    // dashboard waits for authLoading), confirm it rendered, THEN use a
    // client-side navbar link click to keep the AuthProvider instance alive.
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome Back!', { timeout: 20000 });

    // Click the navbar Health Card link — Next.js <Link> does client-side
    // routing so the AuthProvider is not remounted and user stays in context.
    await page.locator('a[href="/profile"]').click();

    await expect(page).toHaveURL(/\/profile/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('My Profile', { timeout: 15000 });

    // Enter edit mode
    await page.getByRole('button', { name: 'Edit Profile' }).click();
    await expect(page.locator('#name')).toBeVisible();

    // Update the phone number
    await page.locator('#phone').fill('+1 555 000 9999');

    // Save changes
    await page.getByRole('button', { name: 'Save Changes' }).click();

    // Success banner appears in view mode after PUT /api/patients/profile resolves
    await expect(page.getByText('Profile updated successfully')).toBeVisible({ timeout: 10000 });

    // Edit form is dismissed — view mode restored
    await expect(page.locator('#name')).not.toBeVisible();

    // Confirm the saved phone number is actually rendered in view mode,
    // confirming the API persisted the value and the UI reflects it.
    await expect(page.getByText('+1 555 000 9999')).toBeVisible();

    // Still on the profile page
    await expect(page).toHaveURL(/\/profile/);
  });
});
