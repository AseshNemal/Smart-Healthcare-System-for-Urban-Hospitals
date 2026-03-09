import { test, expect, type Page, type Route } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env so credentials are available via process.env when running locally
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// ─────────────────────────────────────────────────────────────────────────────
// Credentials – read from environment, never hardcoded
// ─────────────────────────────────────────────────────────────────────────────

const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_NAME = process.env.ADMIN_NAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET!;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !ADMIN_JWT_SECRET) {
    throw new Error(
        "Missing required env vars: ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_JWT_SECRET. " +
        "Ensure .env is present in the project root."
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock data – mirrors what the real MongoDB collections would return.
// Credentials inside stub responses are also sourced from env vars.
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ADMIN_ME = {
    authenticated: true,
    role: "admin",
    user: { name: ADMIN_NAME, email: ADMIN_EMAIL },
};

const MOCK_LOGIN_SUCCESS = {
    success: true,
    user: { name: ADMIN_NAME, email: ADMIN_EMAIL, role: "admin" },
};

const MOCK_APPOINTMENTS = {
    appointments: [
        {
            _id: "appt001",
            patientName: "John Doe",
            doctorName: "Dr. Smith",
            department: "Cardiology",
            date: "2026-03-10",
            time: "09:00",
            status: "confirmed",
            reason: "Chest pain check",
        },
        {
            _id: "appt002",
            patientName: "Jane Roe",
            doctorName: "Dr. Lee",
            department: "Neurology",
            date: "2026-03-10",
            time: "11:00",
            status: "pending",
            reason: "Headache",
        },
    ],
};

const MOCK_PATIENTS = {
    patients: [
        {
            _id: "pat001",
            name: "John Doe",
            email: "john@example.com",
            phone: "0771234567",
            gender: "Male",
            digitalHealthCardId: "DHC-001",
        },
        {
            _id: "pat002",
            name: "Jane Roe",
            email: "jane@example.com",
            phone: "0779876543",
            gender: "Female",
            digitalHealthCardId: "DHC-002",
        },
    ],
};

const MOCK_DOCTORS = {
    doctors: [
        {
            _id: "doc001",
            name: "Dr. Smith",
            email: "smith@hospital.com",
            specialization: "Cardiology",
            department: "Cardiology",
        },
        {
            _id: "doc002",
            name: "Dr. Lee",
            email: "lee@hospital.com",
            specialization: "Neurology",
            department: "Neurology",
        },
    ],
};

const MOCK_PAYMENTS = [
    {
        id: "pay001",
        appointmentId: "appt001",
        patientName: "John Doe",
        patientEmail: "john@example.com",
        doctorName: "Dr. Smith",
        service: "Cardiology Consultation",
        appointmentDate: "2026-03-10",
        amount: 5000,
        currency: "LKR",
        paymentMethod: "card",
        paymentStatus: "completed",
        paidAt: "2026-03-10T09:30:00Z",
        transactionId: "TXN-001",
    },
    {
        id: "pay002",
        appointmentId: "appt002",
        patientName: "Jane Roe",
        patientEmail: "jane@example.com",
        doctorName: "Dr. Lee",
        service: "Neurology Consultation",
        appointmentDate: "2026-03-10",
        amount: 4500,
        currency: "LKR",
        paymentMethod: "card",
        paymentStatus: "pending",
        paidAt: "",
        transactionId: "TXN-002",
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: register mock handlers for all admin API routes
// ─────────────────────────────────────────────────────────────────────────────

async function mockAdminAPIs(page: Page) {
    await page.route("**/api/admin/me", (route: Route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_ADMIN_ME),
        })
    );

    await page.route("**/api/appointments**", (route: Route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_APPOINTMENTS),
        })
    );

    await page.route("**/api/patients/profile**", (route: Route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_PATIENTS),
        })
    );

    await page.route("**/api/doctors**", (route: Route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_DOCTORS),
        })
    );

    await page.route("**/api/payments**", (route: Route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify(MOCK_PAYMENTS),
        })
    );

    await page.route("**/api/reports**", (route: Route) =>
        route.fulfill({
            status: 200,
            contentType: "application/json",
            body: JSON.stringify({
                statistics: {
                    totalVisits: 120,
                    averageDailyVisits: 4,
                    peakHours: "09:00-11:00",
                    utilizationRate: 75,
                },
                chartData: {
                    visitsOverTime: [
                        { date: "2026-03-01", visits: 10 },
                        { date: "2026-03-02", visits: 14 },
                    ],
                    serviceUtilization: [
                        { name: "Cardiology", value: 50, percentage: 42 },
                    ],
                },
                patientDetails: [],
                financeStats: {
                    totalRevenue: 9500,
                    monthlyRevenue: 9500,
                    averageTransactionValue: 4750,
                    completedPayments: 1,
                    pendingPayments: 1,
                    revenueOverTime: [],
                    revenueByService: [],
                },
            }),
        })
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Admin Login  –  Mock: /api/admin/login  and  /api/admin/me
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Login", () => {
    test("mock: successful login returns 200 → redirects to /admin/dashboard", async ({ page }) => {
        // /api/admin/me: first call returns 401 (login page renders the form),
        // subsequent calls return authenticated (dashboard loads after redirect).
        let meCallCount = 0;
        await page.route("**/api/admin/me", (route: Route) => {
            meCallCount++;
            if (meCallCount <= 1) {
                return route.fulfill({
                    status: 401,
                    contentType: "application/json",
                    body: JSON.stringify({ authenticated: false }),
                });
            }
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(MOCK_ADMIN_ME),
            });
        });

        // Mock login endpoint – returns success without touching the real DB
        await page.route("**/api/admin/login", (route: Route) =>
            route.fulfill({
                status: 200,
                contentType: "application/json",
                headers: {
                    "Set-Cookie":
                        "admin_token=mock-jwt-token; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800",
                },
                body: JSON.stringify(MOCK_LOGIN_SUCCESS),
            })
        );

        // Mock remaining APIs so the dashboard loads cleanly after redirect
        await page.route("**/api/appointments**", (route: Route) =>
            route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_APPOINTMENTS) })
        );
        await page.route("**/api/patients/profile**", (route: Route) =>
            route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_PATIENTS) })
        );
        await page.route("**/api/doctors**", (route: Route) =>
            route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_DOCTORS) })
        );

        await page.goto("/login");
        // Use credentials from env vars – not hardcoded
        await page.getByLabel(/email address/i).fill(ADMIN_EMAIL);
        await page.getByLabel(/password/i).fill(ADMIN_PASSWORD);
        await page.getByRole("button", { name: "Login with Email" }).click();

        await expect(page).toHaveURL(/\/admin\/dashboard/, { timeout: 15_000 });
    });

    test("mock: login returns 401 → error message is displayed", async ({ page }) => {
        await page.route("**/api/admin/login", (route: Route) =>
            route.fulfill({
                status: 401,
                contentType: "application/json",
                body: JSON.stringify({ error: "Invalid credentials" }),
            })
        );
        await page.route("**/api/users/check-role**", (route: Route) =>
            route.fulfill({
                status: 404,
                contentType: "application/json",
                body: JSON.stringify({ error: "not found" }),
            })
        );

        await page.goto("/login");
        await page.getByLabel(/email address/i).fill(ADMIN_EMAIL);
        await page.getByLabel(/password/i).fill("wrong-password");
        await page.getByRole("button", { name: "Login with Email" }).click();

        await expect(
            page.locator("div").filter({ hasText: /invalid|incorrect|failed|error/i }).first()
        ).toBeVisible({ timeout: 10_000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Admin Appointments  –  Mock: /api/appointments
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Appointments", () => {
    test.beforeEach(async ({ page }) => {
        await mockAdminAPIs(page);
    });

    test("mock: appointments response populates patient names in table", async ({ page }) => {
        await page.goto("/admin/appointments");
        await expect(page.getByText("John Doe")).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText("Jane Roe")).toBeVisible({ timeout: 10_000 });
    });

    test("mock: appointments response populates doctor names in table", async ({ page }) => {
        await page.goto("/admin/appointments");
        await expect(page.getByText("Dr. Smith")).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText("Dr. Lee")).toBeVisible({ timeout: 10_000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Admin Patients  –  Mock: /api/patients/profile
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Patients", () => {
    test.beforeEach(async ({ page }) => {
        await mockAdminAPIs(page);
    });

    test("mock: patients response populates patient names in list", async ({ page }) => {
        await page.goto("/admin/patients");
        await expect(page.getByText("John Doe")).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText("Jane Roe")).toBeVisible({ timeout: 10_000 });
    });

    test("mock: patients response populates digital health card IDs", async ({ page }) => {
        await page.goto("/admin/patients");
        await expect(page.getByText("DHC-001")).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText("DHC-002")).toBeVisible({ timeout: 10_000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Admin Finance  –  Mock: /api/payments
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Finance", () => {
    test.beforeEach(async ({ page }) => {
        await mockAdminAPIs(page);
    });

    test("mock: payments response populates patient names in finance table", async ({ page }) => {
        await page.goto("/admin/finance");
        await expect(page.getByText("John Doe")).toBeVisible({ timeout: 10_000 });
        await expect(page.getByText("Jane Roe")).toBeVisible({ timeout: 10_000 });
    });

    test("mock: payments response populates transaction IDs in finance table", async ({ page }) => {
        await page.goto("/admin/finance");
        await expect(page.getByText("TXN-001")).toBeVisible({ timeout: 10_000 });
    });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Admin Logout  –  Mock: /api/admin/logout  and  /api/admin/me
// ─────────────────────────────────────────────────────────────────────────────

test.describe("Admin Logout", () => {
    test("mock: logout returns 200 → clears admin session and redirects to /login", async ({ page }) => {
        // /api/admin/me flips to 401 after the logout API is called, preventing
        // the login page from immediately redirecting back to the dashboard.
        let loggedOut = false;
        await page.route("**/api/admin/me", (route: Route) => {
            if (loggedOut) {
                return route.fulfill({
                    status: 401,
                    contentType: "application/json",
                    body: JSON.stringify({ authenticated: false }),
                });
            }
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify(MOCK_ADMIN_ME),
            });
        });

        await page.route("**/api/appointments**", (route: Route) =>
            route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_APPOINTMENTS) })
        );
        await page.route("**/api/patients/profile**", (route: Route) =>
            route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_PATIENTS) })
        );
        await page.route("**/api/doctors**", (route: Route) =>
            route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(MOCK_DOCTORS) })
        );

        // Mock logout – flip the flag so /api/admin/me returns 401 afterwards
        await page.route("**/api/admin/logout", (route: Route) => {
            loggedOut = true;
            return route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ success: true }),
            });
        });

        await page.goto("/admin/dashboard");
        await expect(page.getByText("Digital Health").first()).toBeVisible();

        // Use the title attribute for a precise selector — avoids ambiguity with
        // other buttons that contain "logout" text on narrow (mobile) viewports.
        const logoutBtn = page.locator('button[title="Logout admin"]');
        await expect(logoutBtn).toBeVisible({ timeout: 5_000 });
        // force:true bypasses pointer-event interception by overlapping elements
        // (e.g. the notification bell on the Mobile Chrome viewport).
        await logoutBtn.click({ force: true });
        await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });
    });
});
