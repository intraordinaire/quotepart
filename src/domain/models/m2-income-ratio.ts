import type { SimulationInput, ModelResult } from "../types";
import { computeEquityScore } from "../validators";

export function computeM2(input: SimulationInput): ModelResult {
  const total = input.p1.income + input.p2.income;
  const p1Ratio = input.p1.income / total;

  const p1Contribution = input.commonCharges * p1Ratio;
  const p2Contribution = input.commonCharges * (1 - p1Ratio);

  const p1Disposable = input.p1.income - p1Contribution;
  const p2Disposable = input.p2.income - p2Contribution;

  return {
    p1Contribution,
    p2Contribution,
    p1DisposableIncome: p1Disposable,
    p2DisposableIncome: p2Disposable,
    equityScore: computeEquityScore(p1Disposable, p2Disposable),
    isViable: true,
    warnings: [],
  };
}
