import { test, expect } from './fixtures';

test.describe('Patient Appointment Booking', () => {
  test('Patient can book a new appointment and see it on the dashboard', async ({
    authenticatedPatientPage: page,
  }) => {
    // Navigate to the patient dashboard using the pre-authenticated fixture.
    // No login step needed — Firebase session is restored from storage state.
    await page.goto('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome Back!');

    // Open the appointment booking modal via the quick-action button.
    // .first() targets the quick-action card button before any modal submit button.
    await page.getByRole('button', { name: /Book Appointment/ }).first().click();

    // Wait for the booking form to appear inside the modal.
    await expect(page.locator('#doctorId')).toBeVisible();

    // Doctor options are fetched from /api/doctors on mount.
    // Wait until at least one real doctor option exists beyond the default placeholder.
    await page.waitForFunction(() => {
      const select = document.querySelector('#doctorId') as HTMLSelectElement;
      return select !== null && select.options.length > 1;
    });

    // Select the first available doctor (index 1 skips the "Select a doctor" placeholder).
    await page.locator('#doctorId').selectOption({ index: 1 });

    // Fill in the patient name.
    await page.locator('#patientName').fill('Adriel Perera');

    // Select a date 7 days in the future.
    // Using a future date (not today) ensures all time slots are available and not
    // filtered by the "2 hours from now" restriction that applies to same-day booking.
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD format
    await page.locator('#date').fill(dateStr);

    // After doctor and date are both set, the form triggers a fetch to
    // /api/appointments?checkAvailability=true to load available time slots.
    // Wait for the time slot dropdown to become enabled (fetch complete).
    await expect(page.locator('#timeSlot')).toBeEnabled({ timeout: 15000 });

    // Confirm that real time slot options have loaded (more than the placeholder alone).
    await page.waitForFunction(() => {
      const select = document.querySelector('#timeSlot') as HTMLSelectElement;
      return select !== null && !select.disabled && select.options.length > 1;
    });

    // Select the first available time slot (index 1 skips the placeholder).
    await page.locator('#timeSlot').selectOption({ index: 1 });

    // Select a service type.
    await page.locator('#service').selectOption('General Checkup');

    // Submit the booking form.
    await page.locator('button[type="submit"]').click();

    // After a successful POST to /api/appointments, the form resets and the modal closes.
    // Wait for the modal form to disappear as the implicit confirmation signal.
    await expect(page.locator('#doctorId')).not.toBeVisible({ timeout: 15000 });

    // Assert the dashboard URL is unchanged — no redirect occurred.
    await expect(page).toHaveURL(/\/dashboard/);

    // Assert the "Your Appointments" section is visible.
    await expect(page.locator('h2')).toContainText('Your Appointments');

    // Assert the newly booked appointment appears as a card in the appointments list.
    // The dashboard re-fetches appointments after booking, so this card is newly rendered.
    await expect(page.getByText('General Checkup').first()).toBeVisible();
  });
});
