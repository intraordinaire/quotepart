import type { SimulationInput, ModelResult } from "../types";
import { computeEquityScore } from "../validators";

export function computeM3(input: SimulationInput): ModelResult {
  const p1Available = input.p1.income - input.p1.personalCharges;
  const p2Available = input.p2.income - input.p2.personalCharges;

  if (p1Available <= 0 || p2Available <= 0) {
    const who = p1Available <= 0 ? input.p1.name : input.p2.name;
    return {
      p1Contribution: 0,
      p2Contribution: 0,
      p1DisposableIncome: p1Available,
      p2DisposableIncome: p2Available,
      equityScore: 0,
      isViable: false,
      warnings: [
        `Les charges personnelles de ${who} dépassent son revenu. Ce modèle ne peut pas s'appliquer tel quel.`,
      ],
    };
  }

  // To achieve equal disposable income: solve A1 - C1 = A2 - C2 with C1 + C2 = C
  // → C1 = (C + A1 - A2) / 2, C2 = (C + A2 - A1) / 2
  const p1Contribution = (input.commonCharges + p1Available - p2Available) / 2;
  const p2Contribution = input.commonCharges - p1Contribution;

  const p1Disposable = p1Available - p1Contribution;
  const p2Disposable = p2Available - p2Contribution;

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
