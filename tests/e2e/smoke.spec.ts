import { test, expect } from "@playwright/test";

// Minimal smoke coverage: the shell renders and core navigation resolves.
// Requires browsers (`npx playwright install`) and boots the dev server via
// playwright.config.ts's webServer.

test("home page renders the app shell", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /OsuStocks/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Market" })).toBeVisible();
});

test("leaderboard route resolves", async ({ page }) => {
  await page.goto("/leaderboard");
  await expect(page.getByRole("heading", { name: "Leaderboard" })).toBeVisible();
});

test("trending route resolves", async ({ page }) => {
  await page.goto("/trending");
  await expect(page.getByRole("heading", { name: "Trending" })).toBeVisible();
});
