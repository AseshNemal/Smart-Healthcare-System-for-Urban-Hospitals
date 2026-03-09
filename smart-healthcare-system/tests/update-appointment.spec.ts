import { test, expect } from './fixtures';

test.describe('Patient Appointment Update', () => {
  test('Patient can edit an existing appointment and see the updated service on the dashboard', async ({
    authenticatedPatientPage: page,
  }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome Back!');

    // Wait for the appointments section to render
    await expect(page.locator('h2')).toContainText('Your Appointments');

    // Find the first clickable Edit button on an unpaid appointment card.
    // The button is disabled when paymentStatus === true, so we assert it is enabled.
    const editButton = page.getByRole('button', { name: /Edit/ }).first();
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await expect(editButton).toBeEnabled();
    await editButton.click();

    // The booking modal opens in edit mode — heading changes to "Edit Appointment"
    await expect(page.getByText('Edit Appointment')).toBeVisible();
    await expect(page.locator('#doctorId')).toBeVisible();

    // The form is pre-filled with the existing appointment data.
    // Wait for the available time slots fetch to complete before interacting,
    // indicated by the #timeSlot select becoming enabled.
    await expect(page.locator('#timeSlot')).toBeEnabled({ timeout: 15000 });

    // Change the service type to "Follow-up Visit"
    await page.locator('#service').selectOption('Follow-up Visit');

    // Submit the update
    await page.getByRole('button', { name: /Update Appointment/ }).click();

    // On success the modal closes — #doctorId is unmounted
    await expect(page.locator('#doctorId')).not.toBeVisible({ timeout: 15000 });

    // Confirm we stayed on the dashboard
    await expect(page).toHaveURL(/\/dashboard/);

    // The updated service label is visible in the appointments list
    await expect(page.getByText('Follow-up Visit').first()).toBeVisible();
  });
});
