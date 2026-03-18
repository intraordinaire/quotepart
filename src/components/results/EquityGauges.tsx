"use client";

import React from "react";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelId } from "@/domain/types";

interface EquityGaugesProps {
  results: CalculationResults;
  unlockedModels: Set<ModelId>;
}

interface ModelConfig {
  id: ModelId;
  shortLabel: string;
  fullLabel: string;
}

const MODEL_CONFIGS: ModelConfig[] = [
  { id: "m1_5050", shortLabel: "M1", fullLabel: "50/50" },
  { id: "m2_income_ratio", shortLabel: "M2", fullLabel: "Ratio revenus" },
  { id: "m3_equal_rav", shortLabel: "M3", fullLabel: "Reste à vivre égal" },
  { id: "m4_adjusted_time", shortLabel: "M4", fullLabel: "Temps ajusté" },
  { id: "m5_total_contribution", shortLabel: "M5", fullLabel: "Contribution totale" },
];

function getEquityScore(results: CalculationResults, modelId: ModelId): number {
  if (modelId === "m4_adjusted_time") {
    return results.m4_adjusted_time.optionB.equityScore;
  }
  if (modelId === "m5_total_contribution") {
    return results.m5_total_contribution.modelResult.equityScore;
  }
  return results[modelId].equityScore;
}

function isRedundantModel(results: CalculationResults, id: ModelId): boolean {
  if (id === "m4_adjusted_time") return results.m4_adjusted_time.isSameAsM2;
  if (id === "m5_total_contribution") return results.m5_total_contribution.isSameAsM2;
  return false;
}

function isNonViable(results: CalculationResults, id: ModelId): boolean {
  if (id === "m4_adjusted_time") return !results.m4_adjusted_time.optionB.isViable;
  if (id === "m5_total_contribution") return !results.m5_total_contribution.modelResult.isViable;
  return !results[id].isViable;
}

function getBarColorClass(
  equityScore: number,
  isLocked: boolean,
  isRedundant: boolean,
  nonViable: boolean
): string {
  if (isLocked || isRedundant || nonViable) {
    return "bg-surface";
  }
  if (equityScore > 0.6) {
    return "bg-green";
  }
  if (equityScore >= 0.3) {
    return "bg-amber";
  }
  return "bg-accent";
}

export function EquityGauges({ results, unlockedModels }: EquityGaugesProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {MODEL_CONFIGS.map(({ id, shortLabel, fullLabel }) => {
        const isLocked = !unlockedModels.has(id);
        const isRedundant = !isLocked && isRedundantModel(results, id);
        const nonViable = !isLocked && !isRedundant && isNonViable(results, id);
        const score = getEquityScore(results, id);
        const colorClass = getBarColorClass(score, isLocked, isRedundant, nonViable);
        const percentage = Math.round(score * 100);
        const barWidth = nonViable ? 0 : percentage;

        let scoreLabel: string;
        if (isLocked) scoreLabel = "—";
        else if (isRedundant) scoreLabel = "= M2";
        else if (nonViable) scoreLabel = "Non viable";
        else scoreLabel = `${percentage}%`;

        return (
          <div key={id} className="flex items-center gap-2 md:gap-3">
            <span className="w-6 shrink-0 text-xs md:text-sm font-semibold text-text-dim">
              {shortLabel}
            </span>
            <span className="hidden md:inline w-40 shrink-0 text-sm text-text-dim">
              {fullLabel}
            </span>
            <div className="relative flex-1 h-3 md:h-4 rounded-full bg-border overflow-hidden">
              <div
                data-testid={`gauge-${id}`}
                className={`h-full rounded-full transition-all duration-300 ${colorClass}`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
            <span
              className={`shrink-0 text-right text-sm font-medium${nonViable ? " w-20 text-accent" : " w-10 text-text-primary"}`}
            >
              {scoreLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
