import { describe, it, expect } from "vitest";
import { validateInput, computeEquityScore } from "@/domain/validators";
import type { SimulationInput } from "@/domain/types";

const validInput: SimulationInput = {
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

describe("validateInput", () => {
  it("returns no errors for valid input", () => {
    expect(validateInput(validInput)).toHaveLength(0);
  });

  it("returns error when common charges exceed combined income", () => {
    const errors = validateInput({ ...validInput, commonCharges: 9000 });
    expect(errors.some((e) => e.type === "charges_exceed_income")).toBe(true);
  });

  it("returns error when names are empty", () => {
    const errors = validateInput({ ...validInput, p1: { ...validInput.p1, name: "" } });
    expect(errors.some((e) => e.type === "missing_name")).toBe(true);
  });
});

describe("computeEquityScore", () => {
  it("returns 1 for equal disposable incomes", () => {
    expect(computeEquityScore(1000, 1000)).toBe(1);
  });

  it("returns 0 for maximally unequal disposable incomes", () => {
    // 1 - |0-1000| / max(0,1000) = 1 - 1 = 0
    expect(computeEquityScore(0, 1000)).toBe(0);
  });

  it("returns 0 when max RAV is 0 or negative", () => {
    expect(computeEquityScore(-100, -200)).toBe(0);
  });
});
