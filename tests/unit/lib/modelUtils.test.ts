import { describe, it, expect } from "vitest";
import {
  MODEL_CONFIGS,
  MODEL_LABELS,
  MODEL_ORDER,
  getModelResult,
  getDomesticResult,
  getActiveResult,
  isRedundantModel,
  isNonViableModel,
} from "@/lib/modelUtils";
import type { CalculationResults } from "@/domain/calculate";

function makeModelResult(overrides: Record<string, unknown> = {}) {
  return {
    p1Contribution: 500,
    p2Contribution: 500,
    p1DisposableIncome: 1500,
    p2DisposableIncome: 1500,
    equityScore: 1,
    isViable: true,
    warnings: [],
    ...overrides,
  };
}

function makeResults(overrides: Partial<CalculationResults> = {}): CalculationResults {
  const base = makeModelResult();
  return {
    m1_5050: { ...base },
    m2_income_ratio: { ...base },
    m3_equal_rav: { ...base },
    m4_adjusted_time: {
      optionA: { ...base },
      optionB: { ...base },
      isSameAsM2: false,
      partTimeCostMonthly: 0,
    },
    domestic: {
      m2_income_ratio: makeModelResult({ p1Contribution: 400 }),
      m3_equal_rav: makeModelResult({ p1Contribution: 350 }),
      m4_adjusted_time: {
        optionA: makeModelResult({ p1Contribution: 450 }),
        optionB: makeModelResult({ p1Contribution: 380 }),
        isSameAsM2: false,
        partTimeCostMonthly: 0,
      },
      p1DomesticMonthlyValue: 200,
      p2DomesticMonthlyValue: 100,
      p1WeeklyDomesticHours: 14,
      p2WeeklyDomesticHours: 14,
    },
    projections: {},
    domesticProjections: {},
    validationErrors: [],
    ...overrides,
  } as CalculationResults;
}

describe("MODEL_CONFIGS", () => {
  it("has 4 model configs", () => {
    expect(MODEL_CONFIGS).toHaveLength(4);
  });

  it("each config has id, shortLabel, fullLabel, tierRequired", () => {
    MODEL_CONFIGS.forEach((c) => {
      expect(c.id).toBeTruthy();
      expect(c.shortLabel).toMatch(/^M\d$/);
      expect(c.fullLabel).toBeTruthy();
    });
  });
});

describe("MODEL_ORDER", () => {
  it("contains all 4 model IDs", () => {
    expect(MODEL_ORDER).toHaveLength(4);
  });
});

describe("MODEL_LABELS", () => {
  it("maps each model ID to its full label", () => {
    expect(MODEL_LABELS.m1_5050).toBe("50/50");
    expect(MODEL_LABELS.m2_income_ratio).toBe("Revenu proportionnel");
  });
});

describe("getModelResult", () => {
  it("returns optionB for m4", () => {
    const results = makeResults();
    const r = getModelResult(results, "m4_adjusted_time");
    expect(r).toBe(results.m4_adjusted_time.optionB);
  });

  it("returns direct result for m1-m3", () => {
    const results = makeResults();
    expect(getModelResult(results, "m1_5050")).toBe(results.m1_5050);
  });
});

describe("getDomesticResult", () => {
  it("returns null for m1 (always brut)", () => {
    const results = makeResults();
    expect(getDomesticResult(results, "m1_5050")).toBeNull();
  });

  it("returns domestic result for m2", () => {
    const results = makeResults();
    expect(getDomesticResult(results, "m2_income_ratio")).toBe(results.domestic!.m2_income_ratio);
  });

  it("returns domestic optionB for m4", () => {
    const results = makeResults();
    expect(getDomesticResult(results, "m4_adjusted_time")).toBe(
      results.domestic!.m4_adjusted_time.optionB
    );
  });

  it("returns null when domestic is null", () => {
    const results = makeResults({ domestic: null });
    expect(getDomesticResult(results, "m2_income_ratio")).toBeNull();
  });
});

describe("getActiveResult", () => {
  it("returns base result when domesticEnabled is false", () => {
    const results = makeResults();
    expect(getActiveResult(results, "m2_income_ratio", false).p1Contribution).toBe(500);
  });

  it("returns domestic result when domesticEnabled is true", () => {
    const results = makeResults();
    expect(getActiveResult(results, "m2_income_ratio", true).p1Contribution).toBe(400);
  });

  it("returns base result for m1 even when domesticEnabled is true", () => {
    const results = makeResults();
    expect(getActiveResult(results, "m1_5050", true).p1Contribution).toBe(500);
  });
});

describe("isRedundantModel", () => {
  it("returns true for m4 when isSameAsM2", () => {
    const results = makeResults({
      m4_adjusted_time: {
        optionA: makeModelResult(),
        optionB: makeModelResult(),
        isSameAsM2: true,
        partTimeCostMonthly: 0,
      },
    });
    expect(isRedundantModel(results, "m4_adjusted_time")).toBe(true);
  });

  it("returns false for m1-m3", () => {
    const results = makeResults();
    expect(isRedundantModel(results, "m1_5050")).toBe(false);
  });
});

describe("isNonViableModel", () => {
  it("returns true when model is not viable", () => {
    const results = makeResults();
    results.m3_equal_rav.isViable = false;
    expect(isNonViableModel(results, "m3_equal_rav")).toBe(true);
  });
});
