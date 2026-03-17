import { describe, it, expect } from "vitest";
import { computeM1 } from "@/domain/models/m1-5050";
import { computeM2 } from "@/domain/models/m2-income-ratio";
import type { SimulationInput } from "@/domain/types";

const base: SimulationInput = {
  p1: {
    name: "Thomas",
    income: 3200,
    personalCharges: 0,
    workQuota: 1,
    fullTimeIncome: 3200,
    partTimeReason: null,
  },
  p2: {
    name: "Léa",
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
  hourlyRate: 9.57,
};

describe("Model 2 — Income ratio", () => {
  it("contributions are proportional to income", () => {
    const result = computeM2(base);
    const totalIncome = 3200 + 2100;
    expect(result.p1Contribution).toBeCloseTo(3000 * (3200 / totalIncome), 2);
    expect(result.p2Contribution).toBeCloseTo(3000 * (2100 / totalIncome), 2);
  });

  it("contributions sum to total charges", () => {
    const result = computeM2(base);
    expect(result.p1Contribution + result.p2Contribution).toBeCloseTo(3000, 2);
  });

  it("has higher equity score than 50/50 for unequal incomes", () => {
    const m1 = computeM1(base);
    const m2 = computeM2(base);
    expect(m2.equityScore).toBeGreaterThan(m1.equityScore);
  });

  it("is identical to 50/50 when incomes are equal", () => {
    const equal = { ...base, p1: { ...base.p1, income: 2100 } };
    const result = computeM2(equal);
    expect(result.p1Contribution).toBeCloseTo(1500, 2);
    expect(result.p2Contribution).toBeCloseTo(1500, 2);
  });
});
