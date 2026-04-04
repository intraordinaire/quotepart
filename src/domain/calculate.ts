import type { SimulationInput } from "./types";
import { computeM1 } from "./models/m1-5050";
import { computeM2 } from "./models/m2-income-ratio";
import { computeM3 } from "./models/m3-equal-rav";
import { computeM4, type M4Result } from "./models/m4-adjusted-time";
import { computeDomesticOverlays, type DomesticOverlays } from "./domestic-overlay";
import { validateInput, type ValidationError } from "./validators";
import type { ModelResult } from "./types";

interface ProjectionRow {
  year1: number;
  year5: number;
  year10: number;
}

export interface CalculationResults {
  m1_5050: ModelResult;
  m2_income_ratio: ModelResult;
  m3_equal_rav: ModelResult;
  m4_adjusted_time: M4Result;
  domestic: DomesticOverlays | null;
  projections: Record<string, ProjectionRow>;
  domesticProjections: Record<string, ProjectionRow>;
  validationErrors: ValidationError[];
}

function savingsGapProjection(monthlyGap: number): ProjectionRow {
  const annual = Math.abs(monthlyGap) * 12;
  return { year1: annual, year5: annual * 5, year10: annual * 10 };
}

export function calculate(input: SimulationInput): CalculationResults {
  const validationErrors = validateInput(input);

  const m1 = computeM1(input);
  const m2 = computeM2(input);
  const m3 = computeM3(input);
  const m4 = computeM4(input);

  const domestic = computeDomesticOverlays(input);

  return {
    m1_5050: m1,
    m2_income_ratio: m2,
    m3_equal_rav: m3,
    m4_adjusted_time: m4,
    domestic,
    projections: {
      m1_5050: savingsGapProjection(m1.p1DisposableIncome - m1.p2DisposableIncome),
      m2_income_ratio: savingsGapProjection(m2.p1DisposableIncome - m2.p2DisposableIncome),
      m3_equal_rav: savingsGapProjection(m3.p1DisposableIncome - m3.p2DisposableIncome),
      m4_adjusted_time: savingsGapProjection(
        m4.optionB.p1DisposableIncome - m4.optionB.p2DisposableIncome
      ),
    },
    domesticProjections: {
      m1_5050: savingsGapProjection(m1.p1DisposableIncome - m1.p2DisposableIncome),
      m2_income_ratio: savingsGapProjection(
        domestic.m2_income_ratio.p1DisposableIncome - domestic.m2_income_ratio.p2DisposableIncome
      ),
      m3_equal_rav: savingsGapProjection(
        domestic.m3_equal_rav.p1DisposableIncome - domestic.m3_equal_rav.p2DisposableIncome
      ),
      m4_adjusted_time: savingsGapProjection(
        domestic.m4_adjusted_time.optionB.p1DisposableIncome -
          domestic.m4_adjusted_time.optionB.p2DisposableIncome
      ),
    },
    validationErrors,
  };
}
