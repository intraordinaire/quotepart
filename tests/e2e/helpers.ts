import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Navigate to /simulate and choose "full" mode */
export async function startFullMode(page: Page): Promise<void> {
  await page.goto("/simulate");
  await page.getByText("On remplit ensemble").click();
  await expect(page.getByRole("heading", { name: "Revenus & charges communes" })).toBeVisible();
}

/** Fill Tier 1 incomes and advance to Tier 2 */
export async function completeTier1(
  page: Page,
  opts: { p1Income?: string; p2Income?: string; commonCharges?: string } = {}
): Promise<void> {
  await page.getByLabel(/revenu net mensuel p1/i).fill(opts.p1Income ?? "3000");
  await page.getByLabel(/revenu net mensuel p2/i).fill(opts.p2Income ?? "2000");
  if (opts.commonCharges) {
    await page.locator('input[placeholder="3 000"]').fill(opts.commonCharges);
  }
  await page.getByRole("button", { name: /suivant/i }).click();
  await expect(page.getByRole("heading", { name: "Charges personnelles" })).toBeVisible();
}

/** Skip Tier 2 → Tier 3 */
export async function skipTier2(page: Page): Promise<void> {
  await page.getByRole("button", { name: /passer/i }).click();
  await expect(page.getByRole("heading", { name: "Temps de travail" })).toBeVisible();
}

/** Skip Tier 3 → Tier 4 */
export async function skipTier3(page: Page): Promise<void> {
  await page.getByRole("button", { name: /passer/i }).click();
  await expect(page.getByRole("heading", { name: "Répartition domestique" })).toBeVisible();
}

/** Complete Tier 4 and go to results (full mode only) */
export async function completeTier4AndViewResults(page: Page): Promise<void> {
  await page.getByRole("button", { name: /voir les résultats/i }).click();
  await expect(page.getByRole("heading", { name: "Comparaison des modèles" })).toBeVisible();
}

/** Full flow: start → fill tier 1 → skip tiers 2-3 → switch to results */
export async function goToResultsMinimal(
  page: Page,
  opts: { p1Income?: string; p2Income?: string; commonCharges?: string } = {}
): Promise<void> {
  await startFullMode(page);
  await completeTier1(page, opts);
  await skipTier2(page);
  await skipTier3(page);
  await switchToResultsTab(page);
}

/** Navigate to results tab */
export async function switchToResultsTab(page: Page): Promise<void> {
  const tab = page.getByRole("tab", { name: /résultats/i });
  await tab.click();
  await expect(page.getByRole("heading", { name: "Comparaison des modèles" })).toBeVisible();
}

/** Encode a P2 shared payload for URL */
export function encodeP2Payload(payload: {
  commonCharges: number;
  hasChildren: boolean;
  hourlyRate: number;
  p1Name: string;
}): string {
  return Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}
