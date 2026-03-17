import { describe, it, expect } from "vitest";
import { computeM4 } from "@/domain/models/m4-adjusted-time";
import type { SimulationInput } from "@/domain/types";

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

describe("Model 4 — Adjusted for part-time", () => {
  it("option A (real income) is identical to Model 2", () => {
    const result = computeM4(base);
    const total = base.p1.income + base.p2.income;
    expect(result.optionA.p1Contribution).toBeCloseTo(3000 * (3200 / total), 2);
  });

  it("option B uses theoretical full-time income for ratio", () => {
    const result = computeM4(base);
    // P1: 3200 (full time), P2: 2625 (theoretical)
    const total = 3200 + 2625;
    expect(result.optionB.p1Contribution).toBeCloseTo(3000 * (3200 / total), 2);
  });

  it("option B gives P2 a larger contribution than option A (theoretical income is higher)", () => {
    const result = computeM4(base);
    // P2's theoretical full-time income (2625) > real income (2100), so P2's ratio is higher → larger contribution
    expect(result.optionB.p2Contribution).toBeGreaterThan(result.optionA.p2Contribution);
  });

  it("partTimeCostMonthly reflects difference between options A and B for P2", () => {
    const result = computeM4(base);
    const diff = Math.abs(result.optionA.p2Contribution - result.optionB.p2Contribution);
    expect(result.partTimeCostMonthly).toBeCloseTo(diff, 2);
  });

  it("both options are identical when both work full time", () => {
    const bothFullTime: SimulationInput = {
      ...base,
      p2: { ...base.p2, workQuota: 1, fullTimeIncome: 2100, income: 2100 },
    };
    const result = computeM4(bothFullTime);
    expect(result.optionA.p1Contribution).toBeCloseTo(result.optionB.p1Contribution, 2);
    expect(result.isSameAsM2).toBe(true);
  });
});
