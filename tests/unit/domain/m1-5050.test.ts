import { describe, it, expect } from "vitest";
import { computeM1 } from "@/domain/models/m1-5050";
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
      groceries: 35,
      cooking: 40,
      cleaning: 25,
      admin: 30,
      childrenAppointments: 20,
      schoolSupport: 35,
      maintenance: 75,
      planning: 30,
    },
  },
  hourlyRate: 9.52,
};

describe("Model 1 — 50/50", () => {
  it("each person pays half of common charges", () => {
    const result = computeM1(base);
    expect(result.p1Contribution).toBe(1500);
    expect(result.p2Contribution).toBe(1500);
  });

  it("disposable income = income - contribution", () => {
    const result = computeM1(base);
    expect(result.p1DisposableIncome).toBe(1700); // 3200 - 1500
    expect(result.p2DisposableIncome).toBe(600); // 2100 - 1500
  });

  it("is viable when both can pay their share", () => {
    const result = computeM1(base);
    expect(result.isViable).toBe(true);
  });

  it("is not viable when contribution exceeds P2 income", () => {
    const lowIncome = { ...base, p2: { ...base.p2, income: 1200 } };
    const result = computeM1(lowIncome);
    expect(result.isViable).toBe(false);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("equity score is low when incomes are very different", () => {
    const result = computeM1(base);
    expect(result.equityScore).toBeLessThan(0.5);
  });

  it("equity score is 1 when incomes are equal", () => {
    const equal = { ...base, p1: { ...base.p1, income: 2100 } };
    const result = computeM1(equal);
    expect(result.equityScore).toBeCloseTo(1, 2);
  });
});
