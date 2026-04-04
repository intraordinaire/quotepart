import { describe, it, expect } from "vitest";
import { computeDomesticOverlays } from "@/domain/domestic-overlay";
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

describe("Domestic overlay — M2", () => {
  it("M2+domestic with 50/50 sliders and unequal incomes differs from base M2", () => {
    const result = computeDomesticOverlays(base);
    const m2Ratio = 3200 / (3200 + 2100);
    // 50/50 domestic → equal domestic values, but total cost approach
    // distributes domestic pool at income ratio, so overlay ≠ base M2
    expect(result.m2_income_ratio.p1Contribution).not.toBeCloseTo(3000 * m2Ratio, 2);
  });

  it("M2+domestic equals base M2 when hourly rate is 0", () => {
    const input: SimulationInput = { ...base, hourlyRate: 0 };
    const result = computeDomesticOverlays(input);
    const m2Ratio = 3200 / (3200 + 2100);
    expect(result.m2_income_ratio.p1Contribution).toBeCloseTo(3000 * m2Ratio, 5);
  });

  it("applies corrected formula: inflate charges, distribute by income ratio, subtract domestic", () => {
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
    const result = computeDomesticOverlays(input);

    // Expected with hourlyRate=9.52, hasChildren=true (28h/week):
    // P1 hours = 28 * 0.30 = 8.4h → 8.4 * 9.52 * 4.33 = 346.2 €/month
    // P2 hours = 28 * 0.70 = 19.6h → 19.6 * 9.52 * 4.33 = 807.7 €/month
    // Total cost = 3000 + 346.2 + 807.7 = 4153.9
    // Ratio P1 = 3200/5300 = 0.60377
    // Fair share P1 = 4153.9 * 0.60377 = 2508.5
    // Financial P1 = 2508.5 - 346.2 = 2162.3
    // Financial P2 = 3000 - 2162.3 = 837.7
    expect(result.m2_income_ratio.p1Contribution).toBeCloseTo(2162, 0);
    expect(result.m2_income_ratio.p2Contribution).toBeCloseTo(838, 0);
    expect(
      result.m2_income_ratio.p1Contribution + result.m2_income_ratio.p2Contribution
    ).toBeCloseTo(3000, 0);
  });

  it("uses midpoint when P2 sliders provided (couple mode)", () => {
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
    const resultCouple = computeDomesticOverlays(coupleMode);
    const resultSolo = computeDomesticOverlays(soloMode);
    // Midpoint reduces domestic effect → P1 contribution closer to base ratio
    expect(resultCouple.m2_income_ratio.p1Contribution).toBeGreaterThan(
      resultSolo.m2_income_ratio.p1Contribution
    );
  });

  it("exposes domestic value for each person", () => {
    const result = computeDomesticOverlays(base);
    expect(result.p1DomesticMonthlyValue).toBeGreaterThan(0);
    expect(result.p2DomesticMonthlyValue).toBeGreaterThan(0);
  });

  it("M2+domestic contributions sum to total charges", () => {
    const result = computeDomesticOverlays(base);
    expect(
      result.m2_income_ratio.p1Contribution + result.m2_income_ratio.p2Contribution
    ).toBeCloseTo(3000, 2);
  });

  it("warns and shows transfer when contribution is negative", () => {
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
    const result = computeDomesticOverlays(input);
    expect(result.m2_income_ratio.p2Contribution).toBeLessThan(0);
    expect(result.m2_income_ratio.warnings.length).toBeGreaterThan(0);
    expect(result.m2_income_ratio.warnings[0]).toContain("verser");
    expect(result.m2_income_ratio.isViable).toBe(true);
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
    const result = computeDomesticOverlays(input);
    expect(result.m2_income_ratio.p1Contribution).toBeGreaterThan(2000);
    expect(result.m2_income_ratio.isViable).toBe(false);
    expect(result.m2_income_ratio.warnings[0]).toContain("dépasse");
  });

  it("warns when hourly rate is 0", () => {
    const input: SimulationInput = { ...base, hourlyRate: 0 };
    const result = computeDomesticOverlays(input);
    expect(result.m2_income_ratio.warnings.some((w) => w.includes("valeur horaire"))).toBe(true);
  });
});

describe("Domestic overlay — M3", () => {
  it("M3+domestic contributions sum to total charges", () => {
    const result = computeDomesticOverlays(base);
    expect(result.m3_equal_rav.p1Contribution + result.m3_equal_rav.p2Contribution).toBeCloseTo(
      3000,
      2
    );
  });

  it("person doing more domestic work pays less financially (equal incomes)", () => {
    const equalIncomes: SimulationInput = {
      ...base,
      p1: { ...base.p1, income: 3000 },
      p2: { ...base.p2, income: 3000, fullTimeIncome: 3000, workQuota: 1 },
      domesticSliders: { p1: p1Heavy },
    };
    const result = computeDomesticOverlays(equalIncomes);
    // P1 does more domestic (80% of most categories) → pays less financially
    expect(result.m3_equal_rav.p1Contribution).toBeLessThan(result.m3_equal_rav.p2Contribution);
  });

  it("M3+domestic equals base M3 when hourly rate is 0", () => {
    const input: SimulationInput = {
      ...base,
      hourlyRate: 0,
      p1: { ...base.p1, personalCharges: 200 },
      p2: { ...base.p2, personalCharges: 100 },
    };
    const result = computeDomesticOverlays(input);
    // With rate=0, effective charges = common charges, so overlay = base M3
    const p1Available = input.p1.income - input.p1.personalCharges;
    const p2Available = input.p2.income - input.p2.personalCharges;
    const expectedP1 = (input.commonCharges + p1Available - p2Available) / 2;
    expect(result.m3_equal_rav.p1Contribution).toBeCloseTo(expectedP1, 5);
  });
});

describe("Domestic overlay — M4", () => {
  it("M4+domestic applies to both options", () => {
    const result = computeDomesticOverlays(base);
    expect(result.m4_adjusted_time.optionA.p1Contribution).toBeDefined();
    expect(result.m4_adjusted_time.optionB.p1Contribution).toBeDefined();
    // Both options' contributions sum to common charges
    expect(
      result.m4_adjusted_time.optionA.p1Contribution +
        result.m4_adjusted_time.optionA.p2Contribution
    ).toBeCloseTo(3000, 2);
    expect(
      result.m4_adjusted_time.optionB.p1Contribution +
        result.m4_adjusted_time.optionB.p2Contribution
    ).toBeCloseTo(3000, 2);
  });

  it("M4+domestic isSameAsM2 when both work full-time", () => {
    const fullTime: SimulationInput = {
      ...base,
      p1: { ...base.p1, workQuota: 1, fullTimeIncome: 3200 },
      p2: { ...base.p2, workQuota: 1, fullTimeIncome: 2100 },
    };
    const result = computeDomesticOverlays(fullTime);
    expect(result.m4_adjusted_time.isSameAsM2).toBe(true);
  });
});
