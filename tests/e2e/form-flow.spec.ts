import { test, expect } from "@playwright/test";

test.describe("Form flow", () => {
  test("can navigate to /simulate and see ModeChoice", async ({ page }) => {
    await page.goto("/simulate");
    await expect(page.getByText("Comment souhaitez-vous remplir")).toBeVisible();
  });

  test("selecting full mode advances to Tier 1", async ({ page }) => {
    await page.goto("/simulate");
    await page.getByText("Je remplis pour nous deux").click();
    await expect(page.getByText("Revenus & charges communes")).toBeVisible();
  });

  test("TierNav sidebar is visible with 4 tiers", async ({ page }) => {
    await page.goto("/simulate");
    await page.getByText("Je remplis pour nous deux").click();
    await expect(page.getByText("Progression")).toBeVisible();
    await expect(page.getByText("Charges perso")).toBeVisible();
  });

  test("Suivant advances from Tier 1 to Tier 2", async ({ page }) => {
    await page.goto("/simulate");
    await page.getByText("Je remplis pour nous deux").click();
    await page.getByRole("button", { name: /suivant/i }).click();
    await expect(page.getByText("Charges personnelles")).toBeVisible();
  });

  test("Retour from Tier 1 goes back to ModeChoice", async ({ page }) => {
    await page.goto("/simulate");
    await page.getByText("Je remplis pour nous deux").click();
    await page.getByRole("button", { name: /retour/i }).click();
    await expect(page.getByText("Comment souhaitez-vous remplir")).toBeVisible();
  });
});
