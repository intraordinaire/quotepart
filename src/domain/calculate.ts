import type { SimulationInput } from "./types";
import { computeM1 } from "./models/m1-5050";
import { computeM2 } from "./models/m2-income-ratio";
import { computeM3 } from "./models/m3-equal-rav";
import { computeM4, type M4Result } from "./models/m4-adjusted-time";
import { computeM5, type M5Result } from "./models/m5-total-contribution";
import { validateInput, type ValidationError } from "./validators";
import type { ModelResult } from "./types";

export interface ProjectionRow {
  year1: number;
  year5: number;
  year10: number;
}

export interface CalculationResults {
  m1_5050: ModelResult;
  m2_income_ratio: ModelResult;
  m3_equal_rav: ModelResult;
  m4_adjusted_time: M4Result;
  m5_total_contribution: M5Result;
  projections: Record<string, ProjectionRow>;
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
  const m5 = computeM5(input);

  return {
    m1_5050: m1,
    m2_income_ratio: m2,
    m3_equal_rav: m3,
    m4_adjusted_time: m4,
    m5_total_contribution: m5,
    projections: {
      m1_5050: savingsGapProjection(m1.p1DisposableIncome - m1.p2DisposableIncome),
      m2_income_ratio: savingsGapProjection(m2.p1DisposableIncome - m2.p2DisposableIncome),
      m3_equal_rav: savingsGapProjection(m3.p1DisposableIncome - m3.p2DisposableIncome),
      m4_adjusted_time: savingsGapProjection(
        m4.optionB.p1DisposableIncome - m4.optionB.p2DisposableIncome
      ),
      m5_total_contribution: savingsGapProjection(
        m5.modelResult.p1DisposableIncome - m5.modelResult.p2DisposableIncome
      ),
    },
    validationErrors,
  };
}
