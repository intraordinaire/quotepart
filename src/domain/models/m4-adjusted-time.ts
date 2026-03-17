import type { SimulationInput, ModelResult } from "../types";
import { computeEquityScore } from "../validators";

export interface M4Result {
  optionA: ModelResult; // based on real income (= M2)
  optionB: ModelResult; // based on full-time theoretical income
  partTimeCostMonthly: number;
  isSameAsM2: boolean;
}

function computeOption(
  totalCharges: number,
  p1RatioIncome: number,
  p2RatioIncome: number,
  p1RealIncome: number,
  p2RealIncome: number
): ModelResult {
  const total = p1RatioIncome + p2RatioIncome;
  const p1Contribution = totalCharges * (p1RatioIncome / total);
  const p2Contribution = totalCharges * (1 - p1RatioIncome / total);
  const p1Disposable = p1RealIncome - p1Contribution;
  const p2Disposable = p2RealIncome - p2Contribution;
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

export function computeM4(input: SimulationInput): M4Result {
  const optionA = computeOption(
    input.commonCharges,
    input.p1.income,
    input.p2.income,
    input.p1.income,
    input.p2.income
  );

  const optionB = computeOption(
    input.commonCharges,
    input.p1.fullTimeIncome,
    input.p2.fullTimeIncome,
    input.p1.income,
    input.p2.income
  );

  const isSameAsM2 = input.p1.workQuota === 1 && input.p2.workQuota === 1;

  return {
    optionA,
    optionB,
    partTimeCostMonthly: Math.abs(optionA.p2Contribution - optionB.p2Contribution),
    isSameAsM2,
  };
}
