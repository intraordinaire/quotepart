import type { SimulationInput, ModelResult } from "../types";
import { computeEquityScore } from "../validators";
import { computeDomesticValue, mergeDomesticSliders } from "../domestic";
import { computeM2 } from "./m2-income-ratio";

export interface M5Result {
  modelResult: ModelResult;
  p1DomesticMonthlyValue: number;
  p2DomesticMonthlyValue: number;
  p1WeeklyDomesticHours: number;
  p2WeeklyDomesticHours: number;
  ratioBeforeDomestic: number; // P1 share based on income only (M2)
  ratioAfterDomestic: number; // P1 share after domestic integration
  isSameAsM2: boolean;
}

const SAME_AS_M2_THRESHOLD = 0.01;

export function computeM5(input: SimulationInput): M5Result {
  const mergedSliders = mergeDomesticSliders(input.domesticSliders.p1, input.domesticSliders.p2);

  const domestic = computeDomesticValue(mergedSliders, input.hasChildren, input.hourlyRate);

  // Base: M2 income-ratio contributions
  const m2 = computeM2(input);

  // Adjust by half the domestic imbalance:
  // if P1 does more domestic, P1 pays less financially (and vice versa)
  const domesticImbalance = domestic.p1MonthlyValue - domestic.p2MonthlyValue;
  const p1FinancialContribution = m2.p1Contribution - domesticImbalance / 2;
  const p2FinancialContribution = input.commonCharges - p1FinancialContribution;

  const p1Disposable = input.p1.income - p1FinancialContribution;
  const p2Disposable = input.p2.income - p2FinancialContribution;

  const ratioIncomeBefore = m2.p1Contribution / input.commonCharges;
  const ratioAfter = p1FinancialContribution / input.commonCharges;

  const isSameAsM2 = Math.abs(ratioAfter - ratioIncomeBefore) < SAME_AS_M2_THRESHOLD;

  return {
    modelResult: {
      p1Contribution: p1FinancialContribution,
      p2Contribution: p2FinancialContribution,
      p1DisposableIncome: p1Disposable,
      p2DisposableIncome: p2Disposable,
      equityScore: computeEquityScore(p1Disposable, p2Disposable),
      isViable: true,
      warnings: [],
    },
    p1DomesticMonthlyValue: domestic.p1MonthlyValue,
    p2DomesticMonthlyValue: domestic.p2MonthlyValue,
    p1WeeklyDomesticHours: domestic.p1WeeklyHours,
    p2WeeklyDomesticHours: domestic.p2WeeklyHours,
    ratioBeforeDomestic: ratioIncomeBefore,
    ratioAfterDomestic: ratioAfter,
    isSameAsM2,
  };
}
