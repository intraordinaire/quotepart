import { test, expect } from "@playwright/test";
import { encodeP2Link } from "./helpers";

const DEFAULT_SLIDERS = {
  groceries: 50,
  cooking: 50,
  cleaning: 50,
  admin: 50,
  childrenAppointments: 50,
  schoolSupport: 50,
  maintenance: 50,
  planning: 50,
};

const VALID_INPUT = {
  p1: {
    name: "Alice",
    income: 3000,
    personalCharges: 400,
    workQuota: 1.0,
    fullTimeIncome: 3000,
    partTimeReason: null,
  },
  p2: {
    name: "",
    income: 0,
    personalCharges: 0,
    workQuota: 1.0,
    fullTimeIncome: 0,
    partTimeReason: null,
  },
  commonCharges: 1500,
  hasChildren: false,
  domesticSliders: { p1: DEFAULT_SLIDERS },
  hourlyRate: 9.52,
};

test.describe("Sharing — P2 error states", () => {
  test("no data param shows 'Lien invalide'", async ({ page }) => {
    await page.goto("/simulate/p2");
    await expect(page.getByText(/lien invalide/i)).toBeVisible();
  });

  test("malformed data param shows 'Lien invalide'", async ({ page }) => {
    await page.goto("/simulate/p2?data=notvalid!!!");
    await expect(page.getByText(/lien invalide/i)).toBeVisible();
  });

  test("invalid link page offers new simulation link", async ({ page }) => {
    await page.goto("/simulate/p2");
    const link = page.getByRole("link", { name: /démarrer une nouvelle simulation/i });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/simulate/);
  });
});

test.describe("Sharing — valid P2 link", () => {
  test("P2 page shows banner with P1 name", async ({ page }) => {
    const encoded = encodeP2Link(VALID_INPUT);
    await page.goto(`/simulate/p2?data=${encoded}`);

    await expect(page.getByText("Alice", { exact: true })).toBeVisible();
    await expect(page.getByText(/invite/i)).toBeVisible();
  });

  test("P2 page shows Tier 1 form", async ({ page }) => {
    const encoded = encodeP2Link(VALID_INPUT);
    await page.goto(`/simulate/p2?data=${encoded}`);

    await expect(page.getByRole("heading", { name: "Revenus & charges communes" })).toBeVisible();
  });

  test("P1 income is locked, P2 income is editable (P2 role)", async ({ page }) => {
    const encoded = encodeP2Link(VALID_INPUT);
    await page.goto(`/simulate/p2?data=${encoded}`);

    // In P2 role: P1 income is locked, P2 income is editable
    await expect(page.getByLabel(/revenu net mensuel p2/i)).toBeVisible();
    await expect(page.getByLabel(/revenu net mensuel p1/i)).not.toBeVisible();
  });
});

test.describe("Sharing — P2 flow to results", () => {
  test("P2 fills income and name, then sees results after all tiers", async ({ page }) => {
    const encoded = encodeP2Link(VALID_INPUT);
    await page.goto(`/simulate/p2?data=${encoded}`);

    await expect(page.getByRole("heading", { name: "Revenus & charges communes" })).toBeVisible();

    // P2 fills their own data
    await page.getByLabel(/prénom personne 2/i).fill("Bob");
    await page.getByLabel(/revenu net mensuel p2/i).fill("2000");
    await page.getByRole("button", { name: /suivant/i }).click();

    // Skip tiers 2, 3, 4
    await page.getByRole("button", { name: /passer/i }).click();
    await page.getByRole("button", { name: /passer/i }).click();
    await page.getByRole("button", { name: /voir les résultats/i }).click();

    // Should see results
    await expect(page.getByRole("heading", { name: "Comparaison des modèles" })).toBeVisible();
  });
});
