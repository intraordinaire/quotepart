import { test, expect } from "@playwright/test";

test.describe("Sharing flow", () => {
  test("P2 page shows error for missing data param", async ({ page }) => {
    await page.goto("/simulate/p2");
    await expect(page.getByText(/lien invalide/i)).toBeVisible();
  });

  test("P2 page shows error for malformed data param", async ({ page }) => {
    await page.goto("/simulate/p2?data=notvalid!!!");
    await expect(page.getByText(/lien invalide/i)).toBeVisible();
  });

  test("P2 page shows banner when valid data param is provided", async ({ page }) => {
    const payload = {
      commonCharges: 1500,
      hasChildren: false,
      hourlyRate: 9.57,
      p1Name: "Alice",
    };
    const encoded = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    await page.goto(`/simulate/p2?data=${encoded}`);
    await expect(page.getByText(/alice/i)).toBeVisible();
    await expect(page.getByText(/invite/i)).toBeVisible();
  });

  test("P2 page shows Tier 1 form for P2 to fill", async ({ page }) => {
    const payload = {
      commonCharges: 1200,
      hasChildren: true,
      hourlyRate: 9.57,
      p1Name: "Bob",
    };
    const encoded = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    await page.goto(`/simulate/p2?data=${encoded}`);
    await expect(page.getByText(/bob/i)).toBeVisible();
    await expect(page.getByText("Revenus & charges communes")).toBeVisible();
  });

  test("P2 page does not show P1 income in the UI", async ({ page }) => {
    const payload = {
      commonCharges: 1500,
      hasChildren: false,
      hourlyRate: 9.57,
      p1Name: "Alice",
    };
    const encoded = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

    await page.goto(`/simulate/p2?data=${encoded}`);
    // P1 income is not in the payload — verify it doesn't appear in the main content
    const mainContent = await page.locator("main").textContent();
    // The main content area should not show "3000" (P1 income that's absent from payload)
    expect(mainContent).not.toMatch(/\b3000\b/);
  });
});
