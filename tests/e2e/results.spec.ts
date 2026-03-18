import { test, expect, type Page } from "@playwright/test";

// Helper: navigate to /simulate, pick full mode, complete Tier 1 with minimal data
async function completeTier1(page: Page): Promise<void> {
  await page.goto("/simulate");
  await page.getByText("Je remplis pour nous deux").click();

  // Wait for Tier 1 to render
  await expect(page.getByText("Revenus & charges communes")).toBeVisible();

  // Fill minimal required data so p1/p2 are defined in state
  await page.getByLabel(/revenu net mensuel p1/i).fill("3000");
  await page.getByLabel(/revenu net mensuel p2/i).fill("2000");

  // Complete Tier 1 by clicking Suivant
  await page.getByRole("button", { name: /suivant/i }).click();

  // Wait for tier 2 to show — confirms tier1 was completed and state updated
  await expect(page.getByText("Charges personnelles")).toBeVisible();
}

test.describe("Results screen", () => {
  test("after filling Tier 1, Results tab is enabled and shows model columns", async ({ page }) => {
    await completeTier1(page);

    // Résultats tab should now be enabled
    const resultatsTab = page.getByRole("tab", { name: /résultats/i });
    await expect(resultatsTab).not.toHaveAttribute("aria-disabled", "true");
    await resultatsTab.click();

    // All 5 model column headers should exist
    await expect(page.locator("[data-model='m1_5050']")).toBeVisible();
    await expect(page.locator("[data-model='m2_income_ratio']")).toBeVisible();

    // M3–M5 should show locked overlay text
    await expect(page.getByText(/palier 2/i).first()).toBeVisible();
  });

  test("clicking a model column header opens the detail panel", async ({ page }) => {
    await completeTier1(page);

    const resultatsTab = page.getByRole("tab", { name: /résultats/i });
    await resultatsTab.click();

    // Click M1 column header to open detail panel
    await page.locator("[data-model='m1_5050']").click();

    // Detail panel should show formula text for M1
    await expect(page.getByText("Chacun paie la moitié des charges communes.")).toBeVisible();

    // Close the panel
    await page.getByRole("button", { name: /fermer/i }).click();

    // Detail panel should close
    await expect(page.getByText("Chacun paie la moitié des charges communes.")).not.toBeVisible();
  });

  test("'Et si...' CTA link is present in results", async ({ page }) => {
    await completeTier1(page);

    const resultatsTab = page.getByRole("tab", { name: /résultats/i });
    await resultatsTab.click();

    // The Et si... link should be present
    await expect(page.getByRole("link", { name: /et si/i })).toBeVisible();
  });
});
