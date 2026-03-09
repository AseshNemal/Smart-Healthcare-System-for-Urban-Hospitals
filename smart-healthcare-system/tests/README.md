# Patient Module — Playwright E2E Test Suite

This directory contains all end-to-end (E2E) tests for the **patient-facing module** of the Smart Healthcare System. Tests are written with [Playwright](https://playwright.dev/) and exercise the full stack: Next.js frontend, Firebase Authentication, MongoDB via REST API, and the application's React state management.

---

## Directory Structure

```
tests/
├── fixtures.ts                  # Shared authenticated-page fixture
├── patient-login.spec.ts        # Login flow tests
├── dashboard.spec.ts            # Dashboard access tests
├── book-appointment.spec.ts     # Appointment booking tests
├── update-appointment.spec.ts   # Appointment update tests
├── edit-profile.spec.ts         # Patient profile edit tests
├── e2e-flow.spec.ts             # Full patient journey (single-tab, serial)
├── seed-test-patient.mjs        # One-time MongoDB seeder for test patient data
└── README.md                    # This file
```

---

## Running the Tests

> All commands must be run from inside `smart-healthcare-system/`.

**One-time setup (install Chromium binary):**
```bash
npx playwright install chromium
```

**Start the dev server (Terminal 1):**
```bash
npm run dev
```

**Run all tests (Terminal 2):**
```bash
npx playwright test
```

**Run a single spec file:**
```bash
npx playwright test tests/patient-login.spec.ts
npx playwright test tests/e2e-flow.spec.ts
```

**Run tests and open the HTML report automatically:**
```bash
npm run test:e2e:report
```

**Open the HTML report manually after a test run:**
```bash
npx playwright show-report
```

---

## Types of Tests

### 1. Authentication Test — `patient-login.spec.ts`

**What it tests:** The complete patient login flow from the `/login` page through to the `/dashboard` redirect.

**Steps covered:**
- Navigate to `/login`
- Wait for the email form to render (Firebase + admin session resolve asynchronously)
- Fill email and password
- Click "Login with Email"
- Assert the URL changes to `/dashboard`
- Assert key dashboard elements are visible and contain correct text

**Why it matters:** Validates that Firebase authentication, the `/api/users/check-role` API call, and the client-side redirect all work end-to-end.

---

### 2. Dashboard Access Test — `dashboard.spec.ts`

**What it tests:** That an already-authenticated patient can navigate directly to `/dashboard` without being redirected to `/login`.

**Steps covered:**
- Use the `authenticatedPatientPage` fixture (pre-authenticated browser context)
- Navigate directly to `/dashboard` via `page.goto`
- Assert the dashboard heading, appointments section, and booking button all render

**Why it matters:** Confirms the Firebase session is correctly restored from the browser context and the protected route guard does not incorrectly block a valid session.

---

### 3. Appointment Booking Test — `book-appointment.spec.ts`

**What it tests:** The end-to-end flow for a patient booking a new appointment from the dashboard.

**Steps covered:**
- Open the booking modal via the "Book Appointment" button
- Wait for the doctor list to load from `/api/doctors`
- Select a doctor, fill patient name, pick a future date (7 days ahead)
- Wait for time slots to load from `/api/appointments?checkAvailability=true`
- Select a time slot and a service ("General Checkup")
- Submit the form
- Assert the modal closes (form field disappears)
- Assert the new appointment card appears in the dashboard list

**Why it matters:** Covers the complete booking workflow including async API calls for doctor data and time slot availability.

---

### 4. Appointment Update Test — `update-appointment.spec.ts`

**What it tests:** That a patient can open an existing appointment, change the service, and save the update.

**Steps covered:**
- Navigate to `/dashboard` using the authenticated fixture
- Click the "Edit" button on the first appointment card
- Wait for the "Edit Appointment" modal to open
- Wait for the time slot dropdown to be enabled (pre-fill fetch completes)
- Change the service to "Follow-up Visit"
- Click "Update Appointment"
- Assert the modal closes and the updated service appears in the dashboard list

**Why it matters:** Validates the `PUT /api/appointments/:id` endpoint and confirms the dashboard re-renders with updated data after a successful edit.

---

### 5. Profile Edit Test — `edit-profile.spec.ts`

**What it tests:** That a patient can navigate to their profile page and save an updated phone number.

**Steps covered:**
- Load `/dashboard` first (primes the `AuthProvider` so `user` is in React context)
- Click the profile navbar link (`a[href="/profile"]`) for client-side navigation
- Assert the `/profile` URL and "My Profile" heading
- Click "Edit Profile" to enter edit mode
- Update the phone number field
- Click "Save Changes"
- Assert the success banner "Profile updated successfully" appears
- Assert the new phone number is rendered in view mode
- Assert the edit form is dismissed

**Why it matters:** The profile page has an auth guard (`if (!user) router.push('/login')`) that fires before `onAuthStateChanged` resolves on a cold `page.goto('/profile')`. Using client-side navigation from the dashboard avoids this race condition and keeps the `AuthProvider` alive.

---

### 6. Full Patient Journey — `e2e-flow.spec.ts`

**What it tests:** The complete patient workflow — login, dashboard check, book appointment, update appointment, edit profile — in a single browser tab and a single browser context.

**Configuration:**
```typescript
test.describe.configure({ mode: 'serial', retries: 0 });
```

- `mode: 'serial'`: tests run one after another, sharing the same `page` object
- `retries: 0`: retrying a shared-state test would leave the page in an unknown position; failures are surfaced immediately instead

**Tests in sequence:**

| # | Name | What it verifies |
|---|------|-----------------|
| 1 | Dashboard loads | h1, "Patient Portal", h2, Book button all visible after login |
| 2 | Book a new appointment | Full booking flow, "General Checkup" appears in list |
| 3 | Update the booked appointment | Edit button on the "General Checkup" card, change to "Follow-up Visit" |
| 4 | Edit patient profile | Client-side nav to profile, phone update, success confirmation |

**Performance:** Runs in ~27s compared to ~53s for the four individual fixture-based tests because only one login is performed for the entire suite instead of one per test.

---

## Fixtures — `fixtures.ts`

### `authenticatedPatientPage`

A custom Playwright fixture that provides a fully authenticated `Page` object. It is used by `dashboard.spec.ts`, `book-appointment.spec.ts`, `update-appointment.spec.ts`, and `edit-profile.spec.ts`.

```typescript
export const test = base.extend<PatientFixtures>({
  authenticatedPatientPage: async ({ browser }, use) => {
    const authContext = await browser.newContext();
    const page = await authContext.newPage();

    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible({ timeout: 15000 });
    await page.locator('#email').fill('adrielperera321@gmail.com');
    await page.locator('#password').fill('helloadriel');
    await page.getByRole('button', { name: 'Login with Email' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
    await expect(page.locator('h1')).toBeVisible();

    await use(page);          // test body runs here
    await authContext.close(); // cleanup
  },
});
```

**Why a real login instead of `storageState`:**
Firebase v9+ stores authentication tokens in **IndexedDB**, not `localStorage`. Playwright's `storageState` saves and restores cookies and `localStorage` only — it cannot capture IndexedDB. The only reliable way to provide a pre-authenticated page is to perform a real login for each browser context.

**Lifecycle:**
- A new isolated `BrowserContext` is created before each test
- Firebase login is performed
- The test receives a `Page` already on `/dashboard` with `user` in React context
- After the test, the context is closed and the session is discarded

---

## Assertions Used

### URL Assertion — `toHaveURL`

Confirms the browser navigated to the expected URL. Used to verify login redirects and that no unintended navigation occurred.

```typescript
await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
await expect(page).toHaveURL(/\/profile/);
```

### Text Content Assertion — `toContainText`

Confirms that an element contains specific text. Used to verify headings and section titles render correctly.

```typescript
await expect(page.locator('h1')).toContainText('Welcome Back!');
await expect(page.locator('h2')).toContainText('Your Appointments');
await expect(page.locator('h1')).toContainText('My Profile');
```

### Visibility Assertion — `toBeVisible`

Confirms an element exists in the DOM and is visible to the user. Used to verify that UI components render after async operations resolve.

```typescript
await expect(page.locator('#doctorId')).toBeVisible();
await expect(page.getByText('Profile updated successfully')).toBeVisible({ timeout: 10000 });
await expect(page.getByText('+1 555 000 9999')).toBeVisible();
```

### Negative Visibility Assertion — `not.toBeVisible`

Confirms an element is no longer visible. Used to verify that modals close after a successful form submission and that edit forms dismiss after saving.

```typescript
await expect(page.locator('#doctorId')).not.toBeVisible({ timeout: 15000 });
await expect(page.locator('#name')).not.toBeVisible();
```

### Enabled/Disabled Assertion — `toBeEnabled`

Confirms an interactive element is not disabled. Used to verify that buttons are clickable and that dropdowns become active after async data loads.

```typescript
await expect(bookButton).toBeEnabled();
await expect(page.locator('#timeSlot')).toBeEnabled({ timeout: 15000 });
await expect(editButton).toBeEnabled();
```

### `waitForFunction` — DOM Polling

Used when a dropdown's `options.length` needs to exceed a threshold — a condition Playwright's built-in matchers cannot express directly. Always given an explicit `{ timeout: 15000 }` to fail fast rather than hang silently for 60 seconds.

```typescript
await page.waitForFunction(() => {
  const s = document.querySelector('#doctorId') as HTMLSelectElement;
  return s !== null && s.options.length > 1;
}, undefined, { timeout: 15000 });
```

---

## Test Reporting

Three reporters run simultaneously on every test execution, configured in `playwright.config.ts`:

```typescript
reporter: [
  ['html', { outputFolder: 'playwright-report' }],
  ['line'],
  ['json', { outputFile: 'playwright-report/results.json' }],
],
```

### HTML Reporter

**Output:** `playwright-report/index.html`

An interactive browser-based report. Each test shows its status (pass/fail), duration, steps, and on failure: a screenshot, a video recording, and a full trace viewer.

**View it:**
```bash
npx playwright show-report
```

### Line Reporter

**Output:** Terminal (stdout)

Prints one line per test as it completes. Provides immediate feedback during a test run without waiting for the full suite to finish.

**Example output:**
```
  ✓  patient-login.spec.ts > Patient Login Flow > Patient can log in ... (8.3s)
  ✓  dashboard.spec.ts > Patient Dashboard > Authenticated patient can access ... (5.1s)
```

### JSON Reporter

**Output:** `playwright-report/results.json`

A machine-readable report containing all test results, durations, and error details. Suitable for CI pipelines, dashboards, and automated quality gates.

---

## Known Constraints and Design Decisions

| Constraint | Decision |
|-----------|----------|
| Firebase v9 stores tokens in IndexedDB | Real login per browser context instead of `storageState` |
| Profile page auth guard fires before `onAuthStateChanged` | Navigate from `/dashboard` via client-side link click, not `page.goto('/profile')` |
| Dashboard renders multiple "Book Appointment" elements | `.first()` on locators to avoid strict mode violations |
| `toISOString()` returns previous day in UTC+ timezones | Date built from local `getFullYear()`, `getMonth()`, `getDate()` components |
| `waitForFunction` default timeout is 60 seconds | Explicit `{ timeout: 15000 }` on all polling calls |
| Shared-state serial tests must not retry | `retries: 0` in `e2e-flow.spec.ts` |

---

## Test Patient Credentials

| Field | Value |
|-------|-------|
| Email | `adrielperera321@gmail.com` |
| Password | `helloadriel` |

The corresponding MongoDB patient record is created by `seed-test-patient.mjs`. Run it once if the record does not exist:

```bash
node tests/seed-test-patient.mjs
```
