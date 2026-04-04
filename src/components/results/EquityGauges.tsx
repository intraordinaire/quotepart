"use client";

import React from "react";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelId } from "@/domain/types";
import {
  MODEL_CONFIGS,
  getActiveResult,
  isRedundantModel,
  isNonViableModel,
} from "@/lib/modelUtils";

interface EquityGaugesProps {
  results: CalculationResults;
  unlockedModels: Set<ModelId>;
  domesticEnabled?: boolean;
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

export function EquityGauges({
  results,
  unlockedModels,
  domesticEnabled = false,
}: EquityGaugesProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      {MODEL_CONFIGS.map(({ id, shortLabel, fullLabel }) => {
        const isLocked = !unlockedModels.has(id);
        const isRedundant = !isLocked && isRedundantModel(results, id, domesticEnabled);
        const nonViable =
          !isLocked && !isRedundant && isNonViableModel(results, id, domesticEnabled);
        const score = getActiveResult(results, id, domesticEnabled).equityScore;
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
