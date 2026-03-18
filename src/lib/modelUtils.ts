import type { ModelId, ModelResult } from "@/domain/types";
import type { CalculationResults } from "@/domain/calculate";

export interface ModelConfig {
  id: ModelId;
  shortLabel: string;
  fullLabel: string;
  tierRequired: 2 | 3 | 4 | null;
}

export const MODEL_CONFIGS: ModelConfig[] = [
  { id: "m1_5050", shortLabel: "M1", fullLabel: "50/50", tierRequired: null },
  {
    id: "m2_income_ratio",
    shortLabel: "M2",
    fullLabel: "Revenu proportionnel",
    tierRequired: null,
  },
  { id: "m3_equal_rav", shortLabel: "M3", fullLabel: "Reste à vivre égal", tierRequired: 2 },
  { id: "m4_adjusted_time", shortLabel: "M4", fullLabel: "Temps ajusté", tierRequired: 3 },
  {
    id: "m5_total_contribution",
    shortLabel: "M5",
    fullLabel: "Contribution totale",
    tierRequired: 4,
  },
];

export const MODEL_ORDER: ModelId[] = MODEL_CONFIGS.map((c) => c.id);

export const MODEL_LABELS: Record<ModelId, string> = Object.fromEntries(
  MODEL_CONFIGS.map((c) => [c.id, c.fullLabel])
) as Record<ModelId, string>;

export function getModelResult(results: CalculationResults, id: ModelId): ModelResult {
  if (id === "m4_adjusted_time") return results.m4_adjusted_time.optionB;
  if (id === "m5_total_contribution") return results.m5_total_contribution.modelResult;
  return results[id];
}

export function isRedundantModel(results: CalculationResults, id: ModelId): boolean {
  if (id === "m4_adjusted_time") return results.m4_adjusted_time.isSameAsM2;
  if (id === "m5_total_contribution") return results.m5_total_contribution.isSameAsM2;
  return false;
}

export function isNonViableModel(results: CalculationResults, id: ModelId): boolean {
  return !getModelResult(results, id).isViable;
}
