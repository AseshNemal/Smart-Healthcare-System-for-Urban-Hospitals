import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env so process.env is populated when running locally
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * Playwright configuration for Smart Healthcare System E2E tests.
 * Tests live in src/Play_Wright_Test/
 * All secrets are read from .env – never hardcoded here.
 */
export default defineConfig({
    // Absolute path ensures correct resolution regardless of where playwright is invoked
    testDir: path.resolve(__dirname, "src/Play_Wright_Test"),
    // Only match *.spec.ts files — explicitly excludes Jest *.test.ts files
    testMatch: ["**/*.spec.ts"],
    // Belt-and-suspenders: never scan the Jest __tests__ folder
    testIgnore: ["**/__tests__/**", "**/*.test.ts"],
    timeout: 30_000,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ["html", { outputFolder: "playwright-report", open: "never" }],
        ["list"],
    ],
    use: {
        baseURL: "http://localhost:3000",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
        video: "on-first-retry",
    },

    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "firefox",
            use: { ...devices["Desktop Firefox"] },
        },
        {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
        },
        {
            name: "Mobile Chrome",
            use: { ...devices["Pixel 5"] },
        },
    ],

    webServer: {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        // Forward env vars to the Next.js dev server process.
        // Values come from .env (loaded above) – nothing is hardcoded.
        env: {
            NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
            NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
            NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
            NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
            NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "",
            MONGODB_URI: process.env.MONGODB_URI ?? "",
            ADMIN_JWT_SECRET: process.env.ADMIN_JWT_SECRET ?? "",
            ADMIN_EMAIL: process.env.ADMIN_EMAIL ?? "",
            ADMIN_NAME: process.env.ADMIN_NAME ?? "",
            ADMIN_PASSWORD: process.env.ADMIN_PASSWORD ?? "",
            ADMIN_SEED_TOKEN: process.env.ADMIN_SEED_TOKEN ?? "",
        },
    },
});
