import { defineConfig, devices } from "@playwright/test";

// E2e smoke tests. Run with: npx playwright install (once) then `npm run test:e2e`.
// The webServer block boots the app on PORT before the run.
const PORT = Number(process.env.PORT) || 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
