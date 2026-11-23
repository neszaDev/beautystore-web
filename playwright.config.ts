import { defineConfig, devices } from "@playwright/test";

/**
 * E2E runs against the FULL stack (API with the "Demo seed" + mock payments, and this storefront).
 *   E2E_BASE_URL (default http://localhost:3000; API from beautystore-api `make dev` must be running)
 * Start the stack first; no webServer is launched here. Tests are serial (shared demo stock).
 */
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
    locale: "th-TH",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
