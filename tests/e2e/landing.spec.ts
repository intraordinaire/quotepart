import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/QuotePart/);
  });

  test("hero section displays headline and tagline", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: /réparties/i })).toBeVisible();
    await expect(page.getByText(/pas une calculette/i)).toBeVisible();
  });

  test("CTA 'Commencer la simulation' navigates to /simulate", async ({ page }) => {
    await page.getByRole("link", { name: /commencer la simulation/i }).click();
    await expect(page).toHaveURL(/\/simulate/);
  });

  test("'Comment ça marche' section is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /comment ça marche/i })).toBeVisible();
  });

  test("4 equity models section lists all models", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /modèles.*domestique/i })).toBeVisible();
    // Model names are in <span> elements with font-semibold styling
    const modelSection = page.locator("section", {
      has: page.getByRole("heading", { name: /modèles.*domestique/i }),
    });
    await expect(modelSection.getByText("50/50")).toBeVisible();
    await expect(modelSection.getByText("Prorata revenus")).toBeVisible();
    await expect(modelSection.getByText("Reste à vivre égal")).toBeVisible();
    await expect(modelSection.getByText("Ajusté temps de travail")).toBeVisible();
  });

  test("mobile viewport — no horizontal scroll", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1, name: /réparties/i })).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
  });
});
