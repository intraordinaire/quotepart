import { describe, it, expect } from "vitest";
import { computeM5 } from "@/domain/models/m5-total-contribution";
import type { DomesticSliders, SimulationInput } from "@/domain/types";

const allFifty: DomesticSliders = {
  groceries: 50,
  cooking: 50,
  cleaning: 50,
  admin: 50,
  childrenAppointments: 50,
  schoolSupport: 50,
  maintenance: 50,
  planning: 50,
};

const p1Heavy: DomesticSliders = {
  groceries: 80,
  cooking: 80,
  cleaning: 80,
  admin: 80,
  childrenAppointments: 80,
  schoolSupport: 80,
  maintenance: 20,
  planning: 80,
};

const base: SimulationInput = {
  p1: {
    name: "P1",
    income: 3200,
    personalCharges: 0,
    workQuota: 1,
    fullTimeIncome: 3200,
    partTimeReason: null,
  },
  p2: {
    name: "P2",
    income: 2100,
    personalCharges: 0,
    workQuota: 0.8,
    fullTimeIncome: 2625,
    partTimeReason: "couple-choice",
  },
  commonCharges: 3000,
  hasChildren: true,
  domesticSliders: { p1: allFifty },
  hourlyRate: 9.52,
};

describe("Model 5 — Total contribution", () => {
  it("with 50/50 domestic and unequal incomes, differs slightly from M2", () => {
    const result = computeM5(base);
    const m2Ratio = 3200 / (3200 + 2100);
    // 50/50 domestic → equal domestic values, but total cost approach
    // distributes domestic pool at income ratio, so M5 ≠ M2
    expect(result.modelResult.p1Contribution).not.toBeCloseTo(3000 * m2Ratio, 2);
    expect(result.isSameAsM2).toBe(false);
  });

  it("is truly identical to M2 when hourly rate is 0", () => {
    const input: SimulationInput = { ...base, hourlyRate: 0 };
    const result = computeM5(input);
    const m2Ratio = 3200 / (3200 + 2100);
    expect(result.modelResult.p1Contribution).toBeCloseTo(3000 * m2Ratio, 5);
    expect(result.isSameAsM2).toBe(true);
  });

  it("applies corrected formula: coût total foyer, prorata revenus, minus domestic value", () => {
    // Persona: P1=3200€, P2=2100€, charges=3000€, P1 does 30% domestic (all sliders at 30)
    const p1Does30: DomesticSliders = {
      groceries: 30,
      cooking: 30,
      cleaning: 30,
      admin: 30,
      childrenAppointments: 30,
      schoolSupport: 30,
      maintenance: 30,
      planning: 30,
    };
    const input: SimulationInput = { ...base, domesticSliders: { p1: p1Does30 } };
    const result = computeM5(input);

    // Expected with hourlyRate=9.52, hasChildren=true (28h/week):
    // P1 hours = 28 * 0.30 = 8.4h → 8.4 * 9.52 * 4.33 = 346.2 €/month
    // P2 hours = 28 * 0.70 = 19.6h → 19.6 * 9.52 * 4.33 = 807.7 €/month
    // Coût total = 3000 + 346.2 + 807.7 = 4153.9
    // Ratio P1 = 3200/5300 = 0.60377
    // Part P1 = 4153.9 * 0.60377 = 2508.5
    // CF P1 = 2508.5 - 346.2 = 2162.3
    // CF P2 = 3000 - 2162.3 = 837.7
    expect(result.modelResult.p1Contribution).toBeCloseTo(2162, 0);
    expect(result.modelResult.p2Contribution).toBeCloseTo(838, 0);
    expect(result.modelResult.p1Contribution + result.modelResult.p2Contribution).toBeCloseTo(
      3000,
      0
    );
  });

  it("uses midpoint when P2 sliders are provided (couple mode)", () => {
    const p2Sliders: DomesticSliders = {
      groceries: 20,
      cooking: 20,
      cleaning: 20,
      admin: 20,
      childrenAppointments: 20,
      schoolSupport: 20,
      maintenance: 20,
      planning: 20,
    };
    const coupleMode: SimulationInput = {
      ...base,
      domesticSliders: { p1: p1Heavy, p2: p2Sliders },
    };
    const soloMode: SimulationInput = { ...base, domesticSliders: { p1: p1Heavy } };
    const resultCouple = computeM5(coupleMode);
    const resultSolo = computeM5(soloMode);
    // Midpoint (80+20)/2 = 50 → more balanced domestic split than solo (p1Heavy=80)
    // More balanced split means less domestic adjustment → P1 contribution closer to base ratio
    // Solo P1 does more domestic → pays less. Couple midpoint reduces this effect.
    expect(resultCouple.modelResult.p1Contribution).toBeGreaterThan(
      resultSolo.modelResult.p1Contribution
    );
  });

  it("exposes domestic value for each person", () => {
    const result = computeM5(base);
    expect(result.p1DomesticMonthlyValue).toBeGreaterThan(0);
    expect(result.p2DomesticMonthlyValue).toBeGreaterThan(0);
  });

  it("contributions sum to total charges", () => {
    const result = computeM5(base);
    expect(result.modelResult.p1Contribution + result.modelResult.p2Contribution).toBeCloseTo(
      3000,
      2
    );
  });

  it("warns and shows transfer when contribution is negative (high domestic, low income)", () => {
    // Sophie & Amine scenario from spec (no young children → 23h/week)
    const sophieDoesAlmost: DomesticSliders = {
      groceries: 15,
      cooking: 15,
      cleaning: 15,
      admin: 15,
      childrenAppointments: 15,
      schoolSupport: 15,
      maintenance: 15,
      planning: 15,
    };
    const input: SimulationInput = {
      ...base,
      p1: { ...base.p1, name: "Amine", income: 2800 },
      p2: { ...base.p2, name: "Sophie", income: 428 },
      commonCharges: 2200,
      domesticSliders: { p1: sophieDoesAlmost },
      hasChildren: false,
    };
    const result = computeM5(input);
    expect(result.modelResult.p2Contribution).toBeLessThan(0);
    expect(result.modelResult.warnings.length).toBeGreaterThan(0);
    expect(result.modelResult.warnings[0]).toContain("verser");
    expect(result.modelResult.isViable).toBe(true);
  });

  it("marks non-viable when contribution exceeds income", () => {
    const p2DoesAll: DomesticSliders = {
      groceries: 5,
      cooking: 5,
      cleaning: 5,
      admin: 5,
      childrenAppointments: 5,
      schoolSupport: 5,
      maintenance: 5,
      planning: 5,
    };
    const input: SimulationInput = {
      ...base,
      p1: { ...base.p1, income: 2000 },
      p2: { ...base.p2, income: 1 },
      commonCharges: 1800,
      domesticSliders: { p1: p2DoesAll },
      hasChildren: true,
    };
    const result = computeM5(input);
    expect(result.modelResult.p1Contribution).toBeGreaterThan(2000);
    expect(result.modelResult.isViable).toBe(false);
    expect(result.modelResult.warnings[0]).toContain("dépasse");
  });

  it("warns when hourly rate is 0 (model equals M2)", () => {
    const input: SimulationInput = { ...base, hourlyRate: 0 };
    const result = computeM5(input);
    expect(result.isSameAsM2).toBe(true);
    expect(result.modelResult.warnings.some((w) => w.includes("valeur horaire"))).toBe(true);
  });
});
