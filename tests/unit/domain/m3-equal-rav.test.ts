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
});
