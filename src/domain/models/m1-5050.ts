import type { SimulationInput, ModelResult } from "../types";
import { computeEquityScore } from "../validators";

export function computeM1(input: SimulationInput): ModelResult {
  const contribution = input.commonCharges / 2;
  const p1Disposable = input.p1.income - contribution;
  const p2Disposable = input.p2.income - contribution;

  const warnings: string[] = [];
  if (contribution > input.p1.income) {
    warnings.push(`Dans ce modèle, ${input.p1.name} devrait contribuer plus que son revenu.`);
  }
  if (contribution > input.p2.income) {
    warnings.push(`Dans ce modèle, ${input.p2.name} devrait contribuer plus que son revenu.`);
  }

  return {
    p1Contribution: contribution,
    p2Contribution: contribution,
    p1DisposableIncome: p1Disposable,
    p2DisposableIncome: p2Disposable,
    equityScore: computeEquityScore(p1Disposable, p2Disposable),
    isViable: warnings.length === 0,
    warnings,
  };
}
