import type { ModelId, ModelResult } from "@/domain/types";
import type { CalculationResults } from "@/domain/calculate";

export interface ModelConfig {
  id: ModelId;
  shortLabel: string;
  fullLabel: string;
  tierRequired: 2 | 3 | null;
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
];

export const MODEL_ORDER: ModelId[] = MODEL_CONFIGS.map((c) => c.id);

export const MODEL_LABELS: Record<ModelId, string> = Object.fromEntries(
  MODEL_CONFIGS.map((c) => [c.id, c.fullLabel])
) as Record<ModelId, string>;

export function getModelResult(results: CalculationResults, id: ModelId): ModelResult {
  if (id === "m4_adjusted_time") return results.m4_adjusted_time.optionB;
  return results[id];
}

/**
 * Returns the domestic-adjusted ModelResult for a given model.
 * Returns null for M1 (always brut) or when domestic data is unavailable.
 */
export function getDomesticResult(results: CalculationResults, id: ModelId): ModelResult | null {
  if (!results.domestic || id === "m1_5050") return null;
  if (id === "m4_adjusted_time") return results.domestic.m4_adjusted_time.optionB;
  if (id === "m2_income_ratio") return results.domestic.m2_income_ratio;
  if (id === "m3_equal_rav") return results.domestic.m3_equal_rav;
  return null;
}

/**
 * Returns the active ModelResult: domestic-adjusted if toggle is on, base otherwise.
 */
export function getActiveResult(
  results: CalculationResults,
  id: ModelId,
  domesticEnabled: boolean
): ModelResult {
  if (domesticEnabled) {
    const domestic = getDomesticResult(results, id);
    if (domestic) return domestic;
  }
  return getModelResult(results, id);
}

export function isRedundantModel(
  results: CalculationResults,
  id: ModelId,
  domesticEnabled?: boolean
): boolean {
  if (id === "m4_adjusted_time") {
    if (domesticEnabled && results.domestic) {
      return results.domestic.m4_adjusted_time.isSameAsM2;
    }
    return results.m4_adjusted_time.isSameAsM2;
  }
  return false;
}

export function isNonViableModel(
  results: CalculationResults,
  id: ModelId,
  domesticEnabled?: boolean
): boolean {
  return !getActiveResult(results, id, domesticEnabled ?? false).isViable;
}
