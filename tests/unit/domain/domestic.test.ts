import { describe, it, expect } from "vitest";
import { computeDomesticValue, mergeDomesticSliders } from "@/domain/domestic";
import type { DomesticSliders } from "@/domain/types";

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

describe("mergeDomesticSliders", () => {
  it("returns p1 sliders when p2 is absent (solo mode)", () => {
    const merged = mergeDomesticSliders(allFifty, undefined);
    expect(merged.cooking).toBe(50);
  });

  it("returns midpoint when both p1 and p2 sliders are provided (couple mode)", () => {
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
    const merged = mergeDomesticSliders(p1Heavy, p2Sliders);
    expect(merged.cooking).toBe(50); // (80 + 20) / 2
    expect(merged.groceries).toBe(50); // (80 + 20) / 2
  });
});

describe("computeDomesticValue", () => {
  it("returns equal values when sliders are at 50% (with children)", () => {
    const result = computeDomesticValue(allFifty, true, 9.57);
    expect(result.p1MonthlyValue).toBeCloseTo(result.p2MonthlyValue, 1);
  });

  it("computes correct P1 monthly value at 50% with children", () => {
    // 28h/week * 0.50 * 9.57 EUR/h * 4.33 weeks/month
    const expected = 28 * 0.5 * 9.57 * 4.33;
    const result = computeDomesticValue(allFifty, true, 9.57);
    expect(result.p1MonthlyValue).toBeCloseTo(expected, 1);
  });

  it("excludes child categories when hasChildren is false", () => {
    const resultWith = computeDomesticValue(allFifty, true, 9.57);
    const resultWithout = computeDomesticValue(allFifty, false, 9.57);
    expect(resultWithout.p1MonthlyValue).toBeLessThan(resultWith.p1MonthlyValue);
  });

  it("assigns more value to P1 when P1 carries heavier domestic load", () => {
    const result = computeDomesticValue(p1Heavy, true, 9.57);
    expect(result.p1MonthlyValue).toBeGreaterThan(result.p2MonthlyValue);
  });

  it("returns weekly hours breakdown", () => {
    const result = computeDomesticValue(allFifty, true, 9.57);
    expect(result.p1WeeklyHours).toBeCloseTo(14, 1); // 28 * 0.5
    expect(result.p2WeeklyHours).toBeCloseTo(14, 1);
  });
});
