import { test, expect } from "@playwright/test";
import { startFullMode, completeTier1, goToResultsMinimal, switchToResultsTab } from "./helpers";

test.describe("Results — progressive model unlocking", () => {
  test("Tier 1 only: M1+M2 unlocked, M3-M4 locked", async ({ page }) => {
    await startFullMode(page);
    await completeTier1(page);
    await switchToResultsTab(page);

    await expect(page.locator("[data-model='m1_5050']")).toBeVisible();
    await expect(page.locator("[data-model='m2_income_ratio']")).toBeVisible();

    await expect(
      page.getByText("Remplissez le palier 2 pour débloquer ce modèle").first()
    ).toBeVisible();
    await expect(
      page.getByText("Remplissez le palier 3 pour débloquer ce modèle").first()
    ).toBeVisible();
  });

  test("Tier 1+2 completed: M3 unlocked", async ({ page }) => {
    await startFullMode(page);
    await completeTier1(page);
    // Complete tier 2 (not skip) — click Suivant without filling charges
    await page.getByRole("button", { name: /suivant/i }).click();
    await expect(page.getByRole("heading", { name: "Temps de travail" })).toBeVisible();
    await switchToResultsTab(page);

    // M3 now unlocked — no palier 2 message
    await expect(
      page.getByText("Remplissez le palier 2 pour débloquer ce modèle")
    ).not.toBeVisible();
    // M4 still locked
    await expect(
      page.getByText("Remplissez le palier 3 pour débloquer ce modèle").first()
    ).toBeVisible();
  });

  test("All tiers completed: all 4 models unlocked", async ({ page }) => {
    await goToResultsMinimal(page);

    await expect(page.getByText(/Remplissez le palier/)).not.toBeVisible();
  });
});

test.describe("Results — calculated values (P1=3000, P2=2000, charges=1500)", () => {
  test("M1 (50/50): each pays 750€", async ({ page }) => {
    await goToResultsMinimal(page, { p1Income: "3000", p2Income: "2000", commonCharges: "1500" });

    const tableRows = page.locator("table tbody tr");

    // Row 1 = Part P1, Row 2 = Part P2 (row 0 = Modèle label)
    const p1ContribRow = tableRows.nth(1);
    await expect(p1ContribRow).toContainText("750");

    const p2ContribRow = tableRows.nth(2);
    await expect(p2ContribRow).toContainText("750");
  });

  test("M2 (prorata): P1 pays 900€, P2 pays 600€", async ({ page }) => {
    await goToResultsMinimal(page, { p1Income: "3000", p2Income: "2000", commonCharges: "1500" });

    const tableRows = page.locator("table tbody tr");

    await expect(tableRows.nth(1)).toContainText("900");
    await expect(tableRows.nth(2)).toContainText("600");
  });

  test("disposable income: M1 RAV P1=2250, P2=1250 / M2 RAV P1=2100, P2=1400", async ({ page }) => {
    await goToResultsMinimal(page, { p1Income: "3000", p2Income: "2000", commonCharges: "1500" });

    const tableRows = page.locator("table tbody tr");

    // Row 3 = Reste à vivre P1, Row 4 = Reste à vivre P2
    await expect(tableRows.nth(3)).toContainText("2 250");
    await expect(tableRows.nth(3)).toContainText("2 100");
    await expect(tableRows.nth(4)).toContainText("1 250");
    await expect(tableRows.nth(4)).toContainText("1 400");
  });
});

test.describe("Results — edge cases", () => {
  test("charges exceed combined income shows alert", async ({ page }) => {
    await goToResultsMinimal(page, { p1Income: "1000", p2Income: "500", commonCharges: "2000" });

    const alert = page.getByText("Les charges communes dépassent");
    await expect(alert).toBeVisible();
  });

  test("non-viable model when contribution exceeds income", async ({ page }) => {
    // M1: 1000/2 = 500 per person. P1=200, P2=200 → 500 > 200
    await goToResultsMinimal(page, { p1Income: "200", p2Income: "200", commonCharges: "1000" });

    await expect(page.getByText(/non viable/i).first()).toBeVisible();
  });
});

test.describe("Results — model detail panel", () => {
  test("clicking M1 opens detail panel with formula, closing hides it", async ({ page }) => {
    await goToResultsMinimal(page);

    await page.locator("[data-model='m1_5050']").click();
    await expect(page.getByText("Chacun paie la moitié des charges communes.")).toBeVisible();

    await page.getByRole("button", { name: /fermer/i }).click();
    await expect(page.getByText("Chacun paie la moitié des charges communes.")).not.toBeVisible();
  });
});

test.describe("Results — Et si... tab", () => {
  test("'Et si...' tab is disabled with 'Bientôt' badge", async ({ page }) => {
    await goToResultsMinimal(page);

    const etSiTab = page.getByRole("tab", { name: /et si/i });
    await expect(etSiTab).toBeVisible();
    await expect(etSiTab).toHaveAttribute("aria-disabled", "true");
    await expect(etSiTab).toContainText("Bientôt");
  });
});
