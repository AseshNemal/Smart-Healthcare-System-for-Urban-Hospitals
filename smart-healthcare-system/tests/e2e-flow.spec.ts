import { test, expect, BrowserContext, Page } from '@playwright/test';

// Run all tests in this file sequentially, sharing one browser context.
// This means a single visible browser tab from login through to profile edit.
// retries: 0 prevents Playwright from retrying individual tests with shared state —
// a retry would leave the page in an unknown position and corrupt subsequent tests.
test.describe.configure({ mode: 'serial', retries: 0 });

let context: BrowserContext;
let page: Page;

test.describe('Full Patient Journey — Single Tab', () => {
  // Log in ONCE before all tests. The same page object is reused throughout.
  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    await page.goto('/login');
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
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test.afterAll(async () => {
    await context.close();
  });

  // ── Test 1 ──────────────────────────────────────────────────────────────────
  test('1. Dashboard loads correctly after login', async () => {
    await expect(page.locator('h1')).toContainText('Welcome Back!');
    await expect(page.getByText(/Patient Portal/).first()).toBeVisible();
    await expect(page.locator('h2')).toContainText('Your Appointments');
    await expect(
      page.getByRole('button', { name: /Book Appointment/ }).first()
    ).toBeEnabled();
  });

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  test('2. Book a new appointment', async () => {
    await page.getByRole('button', { name: /Book Appointment/ }).first().click();
    await expect(page.locator('#doctorId')).toBeVisible();

    // Wait for doctor list to load from /api/doctors
    await page.waitForFunction(() => {
      const s = document.querySelector('#doctorId') as HTMLSelectElement;
      return s !== null && s.options.length > 1;
    }, undefined, { timeout: 15000 });
    await page.locator('#doctorId').selectOption({ index: 1 });
    await page.locator('#patientName').fill('Adriel Perera');

    // Build the date string using local time components to avoid the UTC
    // off-by-one bug that toISOString() produces in UTC+ timezones.
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const dateStr = [
      futureDate.getFullYear(),
      String(futureDate.getMonth() + 1).padStart(2, '0'),
      String(futureDate.getDate()).padStart(2, '0'),
    ].join('-');
    await page.locator('#date').fill(dateStr);

    // Wait for time slot fetch to complete
    await expect(page.locator('#timeSlot')).toBeEnabled({ timeout: 15000 });
    await page.waitForFunction(() => {
      const s = document.querySelector('#timeSlot') as HTMLSelectElement;
      return s !== null && !s.disabled && s.options.length > 1;
    }, undefined, { timeout: 15000 });
    await page.locator('#timeSlot').selectOption({ index: 1 });
    await page.locator('#service').selectOption('General Checkup');
    await page.locator('button[type="submit"]').click();

    // Modal closes on success
    await expect(page.locator('#doctorId')).not.toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('General Checkup').first()).toBeVisible();
  });

  // ── Test 3 ──────────────────────────────────────────────────────────────────
  test('3. Update the booked appointment', async () => {
    // Target the Edit button inside a card that shows "General Checkup" —
    // the service booked in Test 2 — rather than blindly clicking .first()
    // which could target an unrelated older appointment.
    const editButton = page
      .locator('div')
      .filter({ hasText: /General Checkup/ })
      .getByRole('button', { name: /Edit/ })
      .first();
    await expect(editButton).toBeVisible({ timeout: 10000 });
    await expect(editButton).toBeEnabled();
    await editButton.click();

    await expect(page.getByText('Edit Appointment')).toBeVisible();
    // Pre-filled form: wait for time slots to be available
    await expect(page.locator('#timeSlot')).toBeEnabled({ timeout: 15000 });

    await page.locator('#service').selectOption('Follow-up Visit');
    await page.getByRole('button', { name: /Update Appointment/ }).click();

    await expect(page.locator('#doctorId')).not.toBeVisible({ timeout: 15000 });
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByText('Follow-up Visit').first()).toBeVisible();
  });

  // ── Test 4 ──────────────────────────────────────────────────────────────────
  test('4. Edit patient profile', async () => {
    // Client-side navigation keeps the auth context alive — no re-login needed.
    // This works because we are already on /dashboard with user in React context.
    await page.locator('a[href="/profile"]').click();
    await expect(page).toHaveURL(/\/profile/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('My Profile', { timeout: 15000 });

    await page.getByRole('button', { name: 'Edit Profile' }).click();
    await expect(page.locator('#name')).toBeVisible();

    await page.locator('#phone').fill('+1 555 000 9999');
    await page.getByRole('button', { name: 'Save Changes' }).click();

    await expect(page.getByText('Profile updated successfully')).toBeVisible({
      timeout: 10000,
    });
    // Confirm the saved value is rendered in view mode — verifies the API
    // persisted it and the UI reflects the updated data.
    await expect(page.getByText('+1 555 000 9999')).toBeVisible();
    await expect(page.locator('#name')).not.toBeVisible();
    await expect(page).toHaveURL(/\/profile/);
  });
});
