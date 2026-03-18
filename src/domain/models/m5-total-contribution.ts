import type { SimulationInput, ModelResult, DomesticSliders } from "../types";
import { computeEquityScore } from "../validators";
import { computeDomesticValue, mergeDomesticSliders } from "../domestic";
import { computeM2 } from "./m2-income-ratio";

const DEFAULT_SLIDERS: DomesticSliders = {
  groceries: 50,
  cooking: 50,
  cleaning: 50,
  admin: 50,
  childrenAppointments: 50,
  schoolSupport: 50,
  maintenance: 50,
  planning: 50,
};

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
  const mergedSliders = mergeDomesticSliders(
    input.domesticSliders?.p1 ?? DEFAULT_SLIDERS,
    input.domesticSliders?.p2
  );

  const domestic = computeDomesticValue(mergedSliders, input.hasChildren, input.hourlyRate);

  // Corrected formula: total household cost approach
  // Reference: docs/reference/quotepart-correctifs-calculs.md §Modèle 5
  const totalHouseholdCost =
    input.commonCharges + domestic.p1MonthlyValue + domestic.p2MonthlyValue;

  const incomeRatio = input.p1.income / (input.p1.income + input.p2.income);

  const p1FairShare = totalHouseholdCost * incomeRatio;
  const p2FairShare = totalHouseholdCost * (1 - incomeRatio);

  const p1FinancialContribution = p1FairShare - domestic.p1MonthlyValue;
  const p2FinancialContribution = p2FairShare - domestic.p2MonthlyValue;

  const p1Disposable = input.p1.income - p1FinancialContribution;
  const p2Disposable = input.p2.income - p2FinancialContribution;

  // M2 baseline for comparison
  const m2 = computeM2(input);
  const ratioIncomeBefore = m2.p1Contribution / input.commonCharges;
  const ratioAfter = input.commonCharges > 0 ? p1FinancialContribution / input.commonCharges : 0.5;

  const isSameAsM2 = Math.abs(ratioAfter - ratioIncomeBefore) < SAME_AS_M2_THRESHOLD;

  const warnings: string[] = [];
  let isViable = true;

  // Edge case ⑤: hourly rate = 0
  if (input.hourlyRate === 0) {
    warnings.push(
      "La valeur horaire est à 0\u00A0€ — le travail domestique n'est pas valorisé. Ce modèle donne le même résultat que le prorata des revenus."
    );
  }

  // Edge case ②: contribution > income (non-viable)
  if (p1FinancialContribution > input.p1.income) {
    isViable = false;
    warnings.push(
      `Dans ce modèle, la contribution financière de ${input.p1.name} (${Math.round(p1FinancialContribution)}\u00A0€) dépasserait son revenu (${Math.round(input.p1.income)}\u00A0€). Le modèle n'est pas viable en l'état.`
    );
  }
  if (p2FinancialContribution > input.p2.income) {
    isViable = false;
    warnings.push(
      `Dans ce modèle, la contribution financière de ${input.p2.name} (${Math.round(p2FinancialContribution)}\u00A0€) dépasserait son revenu (${Math.round(input.p2.income)}\u00A0€). Le modèle n'est pas viable en l'état.`
    );
  }

  // Edge case ①: negative contribution (transfer — still viable)
  if (p1FinancialContribution < 0) {
    warnings.push(
      `La contribution domestique de ${input.p1.name} (${Math.round(domestic.p1MonthlyValue)}\u00A0€/mois) dépasse sa part équitable. ${input.p2.name} couvrirait la totalité des charges et devrait verser ${Math.round(Math.abs(p1FinancialContribution))}\u00A0€/mois à ${input.p1.name}. Ce transfert est une traduction en euros de l'asymétrie domestique\u00A0— c'est un outil de dialogue, pas une obligation.`
    );
  } else if (p2FinancialContribution < 0) {
    warnings.push(
      `La contribution domestique de ${input.p2.name} (${Math.round(domestic.p2MonthlyValue)}\u00A0€/mois) dépasse sa part équitable. ${input.p1.name} couvrirait la totalité des charges et devrait verser ${Math.round(Math.abs(p2FinancialContribution))}\u00A0€/mois à ${input.p2.name}. Ce transfert est une traduction en euros de l'asymétrie domestique\u00A0— c'est un outil de dialogue, pas une obligation.`
    );
  }

  return {
    modelResult: {
      p1Contribution: p1FinancialContribution,
      p2Contribution: p2FinancialContribution,
      p1DisposableIncome: p1Disposable,
      p2DisposableIncome: p2Disposable,
      equityScore: computeEquityScore(p1Disposable, p2Disposable),
      isViable,
      warnings,
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
