import { test, expect } from "@playwright/test";
import { startFullMode, completeTier1, skipTier2, skipTier3 } from "./helpers";

test.describe("Form flow — mode selection", () => {
  test("landing on /simulate shows ModeChoice", async ({ page }) => {
    await page.goto("/simulate");
    await expect(page.getByText("Comment souhaitez-vous remplir")).toBeVisible();
  });

  test("selecting 'full' mode advances to Tier 1", async ({ page }) => {
    await startFullMode(page);
  });

  test("selecting 'shared' mode advances to Tier 1 with P2 income locked", async ({ page }) => {
    await page.goto("/simulate");
    await page.getByText("On remplit chacun·e nos données").click();
    await expect(page.getByRole("heading", { name: "Revenus & charges communes" })).toBeVisible();
    // In shared mode, P2 income is a LockedField (no input), P1 income is editable
    await expect(page.getByLabel(/revenu net mensuel p1/i)).toBeVisible();
    await expect(page.getByLabel(/revenu net mensuel p2/i)).not.toBeVisible();
  });
});

test.describe("Form flow — Tier 1 validation", () => {
  test("clicking Suivant without incomes shows P1 validation error", async ({ page }) => {
    await startFullMode(page);
    await page.getByRole("button", { name: /suivant/i }).click();

    await expect(page.getByText("Le revenu de la personne 1 est requis.")).toBeVisible();
    // Should stay on Tier 1
    await expect(page.getByRole("heading", { name: "Revenus & charges communes" })).toBeVisible();
  });

  test("clicking Suivant with only P1 income shows P2 error only", async ({ page }) => {
    await startFullMode(page);
    await page.getByLabel(/revenu net mensuel p1/i).fill("3000");
    await page.getByRole("button", { name: /suivant/i }).click();

    await expect(page.getByText("Le revenu de la personne 2 est requis.")).toBeVisible();
    await expect(page.getByText("Le revenu de la personne 1 est requis.")).not.toBeVisible();
  });

  test("filling both incomes allows advancing to Tier 2", async ({ page }) => {
    await startFullMode(page);
    await completeTier1(page);
  });
});

test.describe("Form flow — tier navigation (Retour / Passer)", () => {
  test("Retour from Tier 1 goes back to ModeChoice", async ({ page }) => {
    await startFullMode(page);
    await page.getByRole("button", { name: /retour/i }).click();
    await expect(page.getByText("Comment souhaitez-vous remplir")).toBeVisible();
  });

  test("Tier 2: Passer skips to Tier 3", async ({ page }) => {
    await startFullMode(page);
    await completeTier1(page);
    await skipTier2(page);
  });

  test("Tier 2: Retour goes back to Tier 1", async ({ page }) => {
    await startFullMode(page);
    await completeTier1(page);
    await page.getByRole("button", { name: /retour/i }).click();
    await expect(page.getByRole("heading", { name: "Revenus & charges communes" })).toBeVisible();
  });

  test("Tier 3: Passer skips to Tier 4", async ({ page }) => {
    await startFullMode(page);
    await completeTier1(page);
    await skipTier2(page);
    await skipTier3(page);
  });

  test("Tier 3: Retour goes back to Tier 2", async ({ page }) => {
    await startFullMode(page);
    await completeTier1(page);
    await skipTier2(page);
    await page.getByRole("button", { name: /retour/i }).click();
    await expect(page.getByRole("heading", { name: "Charges personnelles" })).toBeVisible();
  });

  test("Tier 4: Retour goes back to Tier 3", async ({ page }) => {
    await startFullMode(page);
    await completeTier1(page);
    await skipTier2(page);
    await skipTier3(page);
    await page.getByRole("button", { name: /retour/i }).click();
    await expect(page.getByRole("heading", { name: "Temps de travail" })).toBeVisible();
  });

  test("Tier 4: 'Voir les résultats' navigates to results", async ({ page }) => {
    await startFullMode(page);
    await completeTier1(page);
    await skipTier2(page);
    await skipTier3(page);
    await page.getByRole("button", { name: /voir les résultats/i }).click();
    await expect(page.getByRole("heading", { name: "Comparaison des modèles" })).toBeVisible();
  });
});

test.describe("Form flow — TierNav sidebar", () => {
  test("sidebar shows progression with tier labels", async ({ page, viewport }) => {
    // Sidebar is hidden on mobile (hidden md:block → 768px breakpoint)
    test.skip((viewport?.width ?? 1280) < 768, "Sidebar not visible on mobile");
    await startFullMode(page);
    await expect(page.getByText("Progression")).toBeVisible();
    await expect(page.getByText("Charges perso")).toBeVisible();
  });
});

test.describe("Form flow — full 4-tier completion", () => {
  test("completing all tiers end-to-end unlocks all 4 models", async ({ page }) => {
    await startFullMode(page);

    // Tier 1
    await page.getByLabel(/revenu net mensuel p1/i).fill("3000");
    await page.getByLabel(/revenu net mensuel p2/i).fill("2000");
    await page.locator('input[placeholder="3 000"]').fill("1500");
    await page.getByRole("button", { name: /suivant/i }).click();
    await expect(page.getByRole("heading", { name: "Charges personnelles" })).toBeVisible();

    // Tier 2: fill some charges
    await page
      .getByLabel(/transport domicile-travail/i)
      .first()
      .fill("80");
    await page.getByRole("button", { name: /suivant/i }).click();
    await expect(page.getByRole("heading", { name: "Temps de travail" })).toBeVisible();

    // Tier 3: keep defaults
    await page.getByRole("button", { name: /suivant/i }).click();
    await expect(page.getByRole("heading", { name: "Répartition domestique" })).toBeVisible();

    // Tier 4: view results
    await page.getByRole("button", { name: /voir les résultats/i }).click();
    await expect(page.getByRole("heading", { name: "Comparaison des modèles" })).toBeVisible();

    // All 4 model columns visible
    await expect(page.locator("[data-model='m1_5050']")).toBeVisible();
    await expect(page.locator("[data-model='m2_income_ratio']")).toBeVisible();
    await expect(page.locator("[data-model='m3_equal_rav']")).toBeVisible();
    await expect(page.locator("[data-model='m4_adjusted_time']")).toBeVisible();
  });
});
