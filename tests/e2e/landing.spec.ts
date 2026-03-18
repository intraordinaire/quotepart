import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hero section loads with correct headline", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: /réparties/i })).toBeVisible();
    await expect(page.getByText(/pas une calculette/i)).toBeVisible();
  });

  test("'Commencer la simulation' navigates to /simulate", async ({ page }) => {
    await page.getByRole("link", { name: /commencer la simulation/i }).click();
    await expect(page).toHaveURL(/\/simulate/);
  });

  test("'Comment ça marche' section is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /comment ça marche/i })).toBeVisible();
  });

  test("5 models section shows all model names", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /façons de voir l'équité/i })).toBeVisible();
    await expect(page.getByText("50/50")).toBeVisible();
    await expect(page.getByText("Prorata revenus")).toBeVisible();
    await expect(page.getByText("Reste à vivre égal")).toBeVisible();
    await expect(page.getByText("Ajusté temps de travail")).toBeVisible();
    await expect(page.getByText("Contribution totale")).toBeVisible();
  });

  test("mobile viewport — all sections visible without horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    // Check key sections are visible
    await expect(page.getByRole("heading", { level: 1, name: /réparties/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /comment ça marche/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /façons de voir l'équité/i })).toBeVisible();

    // No horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
