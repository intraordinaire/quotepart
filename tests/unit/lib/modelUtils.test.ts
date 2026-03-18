import { describe, it, expect } from "vitest";
import {
  MODEL_CONFIGS,
  MODEL_LABELS,
  MODEL_ORDER,
  getModelResult,
  isRedundantModel,
  isNonViableModel,
} from "@/lib/modelUtils";
import type { CalculationResults } from "@/domain/calculate";

function makeResults(overrides: Partial<CalculationResults> = {}): CalculationResults {
  const base = {
    p1Contribution: 500,
    p2Contribution: 500,
    p1DisposableIncome: 1500,
    p2DisposableIncome: 1500,
    equityScore: 1,
    isViable: true,
    warnings: [],
  };
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
    m5_total_contribution: {
      modelResult: { ...base },
      isSameAsM2: false,
      p1DomesticMonthlyValue: 0,
      p2DomesticMonthlyValue: 0,
    },
    projections: {},
    validationErrors: [],
    ...overrides,
  } as CalculationResults;
}

describe("MODEL_CONFIGS", () => {
  it("has 5 model configs", () => {
    expect(MODEL_CONFIGS).toHaveLength(5);
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
  it("contains all 5 model IDs", () => {
    expect(MODEL_ORDER).toHaveLength(5);
  });
});

describe("MODEL_LABELS", () => {
  it("maps each model ID to its full label", () => {
    expect(MODEL_LABELS.m1_5050).toBe("50/50");
    expect(MODEL_LABELS.m5_total_contribution).toBe("Contribution totale");
  });
});

describe("getModelResult", () => {
  it("returns optionB for m4", () => {
    const results = makeResults();
    const r = getModelResult(results, "m4_adjusted_time");
    expect(r).toBe(results.m4_adjusted_time.optionB);
  });

  it("returns modelResult for m5", () => {
    const results = makeResults();
    const r = getModelResult(results, "m5_total_contribution");
    expect(r).toBe(results.m5_total_contribution.modelResult);
  });

  it("returns direct result for m1-m3", () => {
    const results = makeResults();
    expect(getModelResult(results, "m1_5050")).toBe(results.m1_5050);
  });
});

describe("isRedundantModel", () => {
  it("returns true for m4 when isSameAsM2", () => {
    const results = makeResults({
      m4_adjusted_time: {
        optionA: {
          p1Contribution: 0,
          p2Contribution: 0,
          p1DisposableIncome: 0,
          p2DisposableIncome: 0,
          equityScore: 0,
          isViable: true,
          warnings: [],
        },
        optionB: {
          p1Contribution: 0,
          p2Contribution: 0,
          p1DisposableIncome: 0,
          p2DisposableIncome: 0,
          equityScore: 0,
          isViable: true,
          warnings: [],
        },
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
