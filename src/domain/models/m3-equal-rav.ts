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

  const warnings: string[] = [];
  let isViable = true;

  // Edge case ①: negative RAV (charges > combined available)
  if (p1Disposable < 0 && p2Disposable < 0) {
    warnings.push(
      `Vos charges communes dépassent vos revenus disponibles combinés. Le modèle reste à vivre égal aboutit à un reste à vivre négatif pour les deux (${Math.round(p1Disposable)}\u00A0€/mois).`
    );
  }

  // Edge case ③: contribution > income (non-viable)
  if (p1Contribution > input.p1.income) {
    isViable = false;
    warnings.push(
      `Dans ce modèle, la contribution de ${input.p1.name} (${Math.round(p1Contribution)}\u00A0€) dépasse son revenu (${Math.round(input.p1.income)}\u00A0€). Ce modèle n'est pas viable en l'état.`
    );
  }
  if (p2Contribution > input.p2.income) {
    isViable = false;
    warnings.push(
      `Dans ce modèle, la contribution de ${input.p2.name} (${Math.round(p2Contribution)}\u00A0€) dépasse son revenu (${Math.round(input.p2.income)}\u00A0€). Ce modèle n'est pas viable en l'état.`
    );
  }

  // Edge case ②: negative contribution (transfer — still viable)
  if (p1Contribution < 0) {
    warnings.push(
      `Pour égaliser le reste à vivre, ${input.p2.name} devrait couvrir la totalité des charges communes et verser ${Math.round(Math.abs(p1Contribution))}\u00A0€/mois à ${input.p1.name}. Ce transfert n'est pas une obligation\u00A0— c'est une option à discuter.`
    );
  } else if (p2Contribution < 0) {
    warnings.push(
      `Pour égaliser le reste à vivre, ${input.p1.name} devrait couvrir la totalité des charges communes et verser ${Math.round(Math.abs(p2Contribution))}\u00A0€/mois à ${input.p2.name}. Ce transfert n'est pas une obligation\u00A0— c'est une option à discuter.`
    );
  }

  return {
    p1Contribution,
    p2Contribution,
    p1DisposableIncome: p1Disposable,
    p2DisposableIncome: p2Disposable,
    equityScore: computeEquityScore(p1Disposable, p2Disposable),
    isViable,
    warnings,
  };
}
