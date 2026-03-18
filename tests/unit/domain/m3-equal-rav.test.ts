import { describe, it, expect } from "vitest";
import { computeM3 } from "@/domain/models/m3-equal-rav";
import type { SimulationInput } from "@/domain/types";

const base: SimulationInput = {
  p1: {
    name: "P1",
    income: 3200,
    personalCharges: 80,
    workQuota: 1,
    fullTimeIncome: 3200,
    partTimeReason: null,
  },
  p2: {
    name: "P2",
    income: 2100,
    personalCharges: 190,
    workQuota: 0.8,
    fullTimeIncome: 2625,
    partTimeReason: "couple-choice",
  },
  commonCharges: 3000,
  hasChildren: true,
  domesticSliders: {
    p1: {
      groceries: 50,
      cooking: 50,
      cleaning: 50,
      admin: 50,
      childrenAppointments: 50,
      schoolSupport: 50,
      maintenance: 50,
      planning: 50,
    },
  },
  hourlyRate: 9.52,
};

describe("Model 3 — Equal disposable income", () => {
  it("both persons have approximately equal disposable income after contribution", () => {
    const result = computeM3(base);
    expect(result.p1DisposableIncome).toBeCloseTo(result.p2DisposableIncome, 0);
  });

  it("contributions sum to total charges", () => {
    const result = computeM3(base);
    expect(result.p1Contribution + result.p2Contribution).toBeCloseTo(3000, 2);
  });

  it("is not viable when personal charges exceed income for either person", () => {
    const broke = { ...base, p2: { ...base.p2, personalCharges: 2500 } };
    const result = computeM3(broke);
    expect(result.isViable).toBe(false);
    expect(result.warnings[0]).toContain("P2");
  });

  it("person with higher personal charges contributes less to common charges", () => {
    const result = computeM3(base);
    // P2 has more personal charges, so should contribute less
    expect(result.p2Contribution).toBeLessThan(result.p1Contribution);
  });

  it("warns when RAV cible is negative (charges > combined available)", () => {
    // Dispo P1 = 3200-80=3120, Dispo P2 = 2100-190=1910
    // Charges = 6000 → RAV cible = (3120+1910-6000)/2 = -485
    const overloaded = { ...base, commonCharges: 6000 };
    const result = computeM3(overloaded);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("reste à vivre négatif");
    // Model still computes (informative) but warns
    expect(result.p1Contribution + result.p2Contribution).toBeCloseTo(6000, 0);
  });

  it("warns when a contribution is negative (person should receive money)", () => {
    // P1: 4500€, charges perso 500 → dispo 4000
    // P2: 800€, charges perso 400 → dispo 400
    // Charges = 3000 → RAV cible = (4000+400-3000)/2 = 700
    // C_P2 = 400-700 = -300 (P2 should receive 300€)
    const extreme: SimulationInput = {
      ...base,
      p1: { ...base.p1, income: 4500, personalCharges: 500 },
      p2: { ...base.p2, income: 800, personalCharges: 400 },
      commonCharges: 3000,
    };
    const result = computeM3(extreme);
    expect(result.p2Contribution).toBeLessThan(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("verser");
    expect(result.isViable).toBe(true); // still viable, just a transfer
  });

  it("marks non-viable when contribution exceeds income", () => {
    // P1: 2000€, charges perso 100 → dispo 1900
    // P2: 500€, charges perso 50 → dispo 450
    // Charges = 3000 → RAV cible = (1900+450-3000)/2 = -325
    // C_P1 = 1900-(-325) = 2225 > income 2000
    const tooHigh: SimulationInput = {
      ...base,
      p1: { ...base.p1, income: 2000, personalCharges: 100 },
      p2: { ...base.p2, income: 500, personalCharges: 50 },
      commonCharges: 3000,
    };
    const result = computeM3(tooHigh);
    expect(result.isViable).toBe(false);
    expect(result.warnings.some((w) => w.includes("dépasse son revenu"))).toBe(true);
  });
});
