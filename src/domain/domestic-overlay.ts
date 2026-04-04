import type { SimulationInput, ModelResult } from "./types";
import { computeEquityScore } from "./validators";
import { computeDomesticValue, mergeDomesticSliders } from "./domestic";
import { computeM2 } from "./models/m2-income-ratio";
import { computeM3 } from "./models/m3-equal-rav";
import { computeM4 } from "./models/m4-adjusted-time";
import { DEFAULT_SLIDERS } from "./constants";

export interface DomesticOverlays {
  m2_income_ratio: ModelResult;
  m3_equal_rav: ModelResult;
  m4_adjusted_time: {
    optionA: ModelResult;
    optionB: ModelResult;
    partTimeCostMonthly: number;
    isSameAsM2: boolean;
  };
  p1DomesticMonthlyValue: number;
  p2DomesticMonthlyValue: number;
  p1WeeklyDomesticHours: number;
  p2WeeklyDomesticHours: number;
}

function adjustForDomestic(
  rawResult: ModelResult,
  p1DomesticValue: number,
  p2DomesticValue: number,
  input: SimulationInput
): ModelResult {
  const p1Contribution = rawResult.p1Contribution - p1DomesticValue;
  const p2Contribution = rawResult.p2Contribution - p2DomesticValue;
  // Keep the raw disposable income: it was computed by the model on inflated
  // charges and already accounts for the total contribution (financial + domestic).
  // Recalculating as income − financialContribution would ignore the time cost
  // of domestic work and produce misleading equity scores.
  const p1Disposable = rawResult.p1DisposableIncome;
  const p2Disposable = rawResult.p2DisposableIncome;

  const warnings: string[] = [];
  let isViable = true;

  if (input.hourlyRate === 0) {
    warnings.push(
      "La valeur horaire est à 0\u00A0€ — le travail domestique n'est pas valorisé. Les résultats sont identiques au modèle sans ajustement domestique."
    );
  }

  if (p1Contribution > input.p1.income) {
    isViable = false;
    warnings.push(
      `Dans ce modèle, la contribution financière de ${input.p1.name} (${Math.round(p1Contribution)}\u00A0€) dépasserait son revenu (${Math.round(input.p1.income)}\u00A0€). Le modèle n'est pas viable en l'état.`
    );
  }
  if (p2Contribution > input.p2.income) {
    isViable = false;
    warnings.push(
      `Dans ce modèle, la contribution financière de ${input.p2.name} (${Math.round(p2Contribution)}\u00A0€) dépasserait son revenu (${Math.round(input.p2.income)}\u00A0€). Le modèle n'est pas viable en l'état.`
    );
  }

  if (p1Contribution < 0) {
    warnings.push(
      `La contribution domestique de ${input.p1.name} (${Math.round(p1DomesticValue)}\u00A0€/mois) dépasse sa part équitable. ${input.p2.name} couvrirait la totalité des charges et devrait verser ${Math.round(Math.abs(p1Contribution))}\u00A0€/mois à ${input.p1.name}. Ce transfert est une traduction en euros de l'asymétrie domestique\u00A0— c'est un outil de dialogue, pas une obligation.`
    );
  } else if (p2Contribution < 0) {
    warnings.push(
      `La contribution domestique de ${input.p2.name} (${Math.round(p2DomesticValue)}\u00A0€/mois) dépasse sa part équitable. ${input.p1.name} couvrirait la totalité des charges et devrait verser ${Math.round(Math.abs(p2Contribution))}\u00A0€/mois à ${input.p2.name}. Ce transfert est une traduction en euros de l'asymétrie domestique\u00A0— c'est un outil de dialogue, pas une obligation.`
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

export function computeDomesticOverlays(input: SimulationInput): DomesticOverlays {
  const mergedSliders = mergeDomesticSliders(
    input.domesticSliders?.p1 ?? DEFAULT_SLIDERS,
    input.domesticSliders?.p2
  );

  const domestic = computeDomesticValue(mergedSliders, input.hasChildren, input.hourlyRate);

  const effectiveCharges = input.commonCharges + domestic.p1MonthlyValue + domestic.p2MonthlyValue;

  const inflatedInput: SimulationInput = { ...input, commonCharges: effectiveCharges };

  // Run models with inflated charges, then subtract domestic credit
  const m2Raw = computeM2(inflatedInput);
  const m2Adjusted = adjustForDomestic(
    m2Raw,
    domestic.p1MonthlyValue,
    domestic.p2MonthlyValue,
    input
  );

  const m3Raw = computeM3(inflatedInput);
  const m3Adjusted = adjustForDomestic(
    m3Raw,
    domestic.p1MonthlyValue,
    domestic.p2MonthlyValue,
    input
  );

  const m4Raw = computeM4(inflatedInput);
  const m4AdjustedA = adjustForDomestic(
    m4Raw.optionA,
    domestic.p1MonthlyValue,
    domestic.p2MonthlyValue,
    input
  );
  const m4AdjustedB = adjustForDomestic(
    m4Raw.optionB,
    domestic.p1MonthlyValue,
    domestic.p2MonthlyValue,
    input
  );

  return {
    m2_income_ratio: m2Adjusted,
    m3_equal_rav: m3Adjusted,
    m4_adjusted_time: {
      optionA: m4AdjustedA,
      optionB: m4AdjustedB,
      partTimeCostMonthly: Math.abs(m4AdjustedA.p2Contribution - m4AdjustedB.p2Contribution),
      isSameAsM2: input.p1.workQuota === 1 && input.p2.workQuota === 1,
    },
    p1DomesticMonthlyValue: domestic.p1MonthlyValue,
    p2DomesticMonthlyValue: domestic.p2MonthlyValue,
    p1WeeklyDomesticHours: domestic.p1WeeklyHours,
    p2WeeklyDomesticHours: domestic.p2WeeklyHours,
  };
}
