import { test, expect } from "@playwright/test";
import { encodeP2Payload } from "./helpers";

const VALID_PAYLOAD = {
  commonCharges: 1500,
  hasChildren: false,
  hourlyRate: 9.52,
  p1Name: "Alice",
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
    const encoded = encodeP2Payload(VALID_PAYLOAD);
    await page.goto(`/simulate/p2?data=${encoded}`);

    await expect(page.getByText(/alice/i)).toBeVisible();
    await expect(page.getByText(/invite/i)).toBeVisible();
  });

  test("P2 page shows Tier 1 form", async ({ page }) => {
    const encoded = encodeP2Payload(VALID_PAYLOAD);
    await page.goto(`/simulate/p2?data=${encoded}`);

    await expect(page.getByRole("heading", { name: "Revenus & charges communes" })).toBeVisible();
  });

  test("P2 income field is locked, P1 income is editable (shared mode)", async ({ page }) => {
    const encoded = encodeP2Payload(VALID_PAYLOAD);
    await page.goto(`/simulate/p2?data=${encoded}`);

    // In shared mode: P1 income is editable, P2 income is a LockedField
    await expect(page.getByLabel(/revenu net mensuel p1/i)).toBeVisible();
    await expect(page.getByLabel(/revenu net mensuel p2/i)).not.toBeVisible();
  });
});

test.describe("Sharing — P2 flow to results", () => {
  test("P2 fills P1 income and P2 name, then sees results", async ({ page }) => {
    const encoded = encodeP2Payload(VALID_PAYLOAD);
    await page.goto(`/simulate/p2?data=${encoded}`);

    await expect(page.getByRole("heading", { name: "Revenus & charges communes" })).toBeVisible();

    // In shared mode on P2 page: P1 income is the editable field, P2 income is locked.
    // P2 must also fill P2 name so that rawInput.p2 is defined (ResultsShell requires it).
    await page.getByLabel(/prénom personne 2/i).fill("Bob");
    await page.getByLabel(/revenu net mensuel p1/i).fill("2000");
    await page.getByRole("button", { name: /suivant/i }).click();

    // P2 page renders ResultsShell directly after completing Tier 1
    await expect(page.getByRole("heading", { name: "Comparaison des modèles" })).toBeVisible();
  });
});
