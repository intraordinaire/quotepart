import { describe, it, expect } from "vitest";
import { calculate } from "@/domain/calculate";
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

describe("calculate — orchestrator", () => {
  it("returns results for all 4 models", () => {
    const results = calculate(base);
    expect(results.m1_5050).toBeDefined();
    expect(results.m2_income_ratio).toBeDefined();
    expect(results.m3_equal_rav).toBeDefined();
    expect(results.m4_adjusted_time).toBeDefined();
  });

  it("returns domestic overlays", () => {
    const results = calculate(base);
    expect(results.domestic).toBeDefined();
    expect(results.domestic!.m2_income_ratio).toBeDefined();
    expect(results.domestic!.m3_equal_rav).toBeDefined();
    expect(results.domestic!.m4_adjusted_time).toBeDefined();
  });

  it("m1 has lower equity score than m2 for unequal incomes", () => {
    const results = calculate(base);
    expect(results.m1_5050.equityScore).toBeLessThan(results.m2_income_ratio.equityScore);
  });

  it("returns validation errors when input is invalid", () => {
    const invalid = { ...base, commonCharges: 99999 };
    const results = calculate(invalid);
    expect(results.validationErrors.length).toBeGreaterThan(0);
  });

  it("includes projection data (1y, 5y, 10y savings gap)", () => {
    const results = calculate(base);
    const proj = results.projections["m1_5050"];
    expect(proj).toBeDefined();
    expect(proj!.year1).toBeGreaterThan(0);
    expect(proj!.year10).toBe(proj!.year1 * 10);
  });

  it("includes domestic projection data", () => {
    const results = calculate(base);
    const proj = results.domesticProjections["m2_income_ratio"];
    expect(proj).toBeDefined();
    expect(proj!.year1).toBeGreaterThanOrEqual(0);
  });
});
