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
  domesticSliders: { p1: allFifty },
  hourlyRate: 9.57,
};

describe("Model 5 — Total contribution", () => {
  it("is identical to M2 when domestic is 50/50", () => {
    const result = computeM5(base);
    const m2Ratio = 3200 / (3200 + 2100);
    // 50/50 domestic → no imbalance → M5 = M2 exactly
    expect(result.modelResult.p1Contribution).toBeCloseTo(3000 * m2Ratio, 5);
    expect(result.isSameAsM2).toBe(true);
  });

  it("reduces financial contribution for person doing more domestic work", () => {
    const p1DoesMore: SimulationInput = { ...base, domesticSliders: { p1: p1Heavy } };
    const result = computeM5(p1DoesMore);
    // P1 does more domestic, so P1 should contribute less financially
    const m2Ratio = 3200 / (3200 + 2100);
    expect(result.modelResult.p1Contribution).toBeLessThan(3000 * m2Ratio);
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
    const m2Contribution = 3000 * (3200 / 5300);
    // Midpoint (80+20)/2 = 50 → closer to M2 than solo (p1Heavy)
    expect(Math.abs(resultCouple.modelResult.p1Contribution - m2Contribution)).toBeLessThan(
      Math.abs(resultSolo.modelResult.p1Contribution - m2Contribution)
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
});
