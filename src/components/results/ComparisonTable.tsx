"use client";

import React from "react";
import type { ModelId, ModelResult } from "@/domain/types";
import type { CalculationResults } from "@/domain/calculate";
import { ModelBadge } from "./ModelBadge";
import { LockedModelOverlay } from "./LockedModelOverlay";

export interface ComparisonTableProps {
  results: CalculationResults;
  unlockedModels: Set<ModelId>;
  selectedModel: ModelId | null;
  onModelSelect: (id: ModelId) => void;
  p1Name: string;
  p2Name: string;
}

interface ModelConfig {
  id: ModelId;
  shortLabel: string;
  fullLabel: string;
  tierRequired: 2 | 3 | 4 | null;
}

const MODEL_CONFIGS: ModelConfig[] = [
  { id: "m1_5050", shortLabel: "M1", fullLabel: "M1 — 50/50", tierRequired: null },
  {
    id: "m2_income_ratio",
    shortLabel: "M2",
    fullLabel: "M2 — Revenu proportionnel",
    tierRequired: null,
  },
  { id: "m3_equal_rav", shortLabel: "M3", fullLabel: "M3 — RAV égal", tierRequired: 2 },
  { id: "m4_adjusted_time", shortLabel: "M4", fullLabel: "M4 — Temps ajusté", tierRequired: 3 },
  {
    id: "m5_total_contribution",
    shortLabel: "M5",
    fullLabel: "M5 — Contribution totale",
    tierRequired: 4,
  },
];

function formatAmount(amount: number): string {
  const formatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount);
  // Append non-breaking space + € for consistent display
  return `${formatted}\u00A0€`;
}

function getModelResult(results: CalculationResults, id: ModelId): ModelResult {
  if (id === "m4_adjusted_time") return results.m4_adjusted_time.optionB;
  if (id === "m5_total_contribution") return results.m5_total_contribution.modelResult;
  return results[id];
}

function findBestModelId(
  results: CalculationResults,
  unlockedModels: Set<ModelId>
): ModelId | null {
  let bestId: ModelId | null = null;
  let bestScore = -Infinity;

  for (const config of MODEL_CONFIGS) {
    if (!unlockedModels.has(config.id)) continue;
    const result = getModelResult(results, config.id);
    if (result.equityScore > bestScore) {
      bestScore = result.equityScore;
      bestId = config.id;
    }
  }

  return bestId;
}

export function ComparisonTable({
  results,
  unlockedModels,
  selectedModel,
  onModelSelect,
  p1Name,
  p2Name,
}: ComparisonTableProps): React.JSX.Element {
  const bestModelId = findBestModelId(results, unlockedModels);

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="text-left py-2 px-3 text-text-secondary font-medium w-32" />
            {MODEL_CONFIGS.map((config) => {
              const isLocked = !unlockedModels.has(config.id);
              const isBest = config.id === bestModelId;
              const isSelected = config.id === selectedModel;

              return (
                <th
                  key={config.id}
                  data-model={config.id}
                  className={[
                    "py-2 px-3 text-center font-semibold border rounded-t-md transition-colors",
                    isLocked ? "opacity-40 cursor-not-allowed" : "cursor-pointer hover:bg-surface",
                    isBest
                      ? "ring-2 ring-accent border-accent text-accent"
                      : "border-border text-text-secondary",
                    isSelected && !isLocked ? "bg-surface" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={() => {
                    if (!isLocked) onModelSelect(config.id);
                  }}
                >
                  <span>{config.shortLabel}</span>
                  {isBest && !isLocked && <ModelBadge label="Meilleur" variant="best" />}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {/* Row: model full label */}
          <tr className="border-b border-border">
            <td className="py-2 px-3 text-text-secondary text-xs">Modèle</td>
            {MODEL_CONFIGS.map((config) => {
              const isLocked = !unlockedModels.has(config.id);
              const result = isLocked ? null : getModelResult(results, config.id);

              return (
                <td
                  key={config.id}
                  className={[
                    "py-2 px-3 text-center text-xs relative",
                    isLocked ? "opacity-40" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isLocked && config.tierRequired !== null ? (
                    <div className="relative min-h-[2rem]">
                      <LockedModelOverlay tierRequired={config.tierRequired} />
                    </div>
                  ) : (
                    <>
                      {result && !result.isViable && (
                        <ModelBadge label="Non viable" variant="default" />
                      )}
                      <span className="text-text-secondary">{config.fullLabel}</span>
                    </>
                  )}
                </td>
              );
            })}
          </tr>

          {/* Row: P1 contribution */}
          <tr className="border-b border-border">
            <td className="py-2 px-3 text-text-secondary text-xs">Part {p1Name || "Personne 1"}</td>
            {MODEL_CONFIGS.map((config) => {
              const isLocked = !unlockedModels.has(config.id);
              const result = isLocked ? null : getModelResult(results, config.id);

              return (
                <td key={config.id} className="py-2 px-3 text-center text-xs">
                  {result ? formatAmount(result.p1Contribution) : "—"}
                </td>
              );
            })}
          </tr>

          {/* Row: P2 contribution */}
          <tr className="border-b border-border">
            <td className="py-2 px-3 text-text-secondary text-xs">Part {p2Name || "Personne 2"}</td>
            {MODEL_CONFIGS.map((config) => {
              const isLocked = !unlockedModels.has(config.id);
              const result = isLocked ? null : getModelResult(results, config.id);

              return (
                <td key={config.id} className="py-2 px-3 text-center text-xs">
                  {result ? formatAmount(result.p2Contribution) : "—"}
                </td>
              );
            })}
          </tr>

          {/* Row: P1 disposable income */}
          <tr className="border-b border-border">
            <td className="py-2 px-3 text-text-secondary text-xs">RAV {p1Name || "Personne 1"}</td>
            {MODEL_CONFIGS.map((config) => {
              const isLocked = !unlockedModels.has(config.id);
              const result = isLocked ? null : getModelResult(results, config.id);

              return (
                <td key={config.id} className="py-2 px-3 text-center text-xs">
                  {result ? formatAmount(result.p1DisposableIncome) : "—"}
                </td>
              );
            })}
          </tr>

          {/* Row: P2 disposable income */}
          <tr className="border-b border-border">
            <td className="py-2 px-3 text-text-secondary text-xs">RAV {p2Name || "Personne 2"}</td>
            {MODEL_CONFIGS.map((config) => {
              const isLocked = !unlockedModels.has(config.id);
              const result = isLocked ? null : getModelResult(results, config.id);

              return (
                <td key={config.id} className="py-2 px-3 text-center text-xs">
                  {result ? formatAmount(result.p2DisposableIncome) : "—"}
                </td>
              );
            })}
          </tr>

          {/* Row: equity score */}
          <tr>
            <td className="py-2 px-3 text-text-secondary text-xs">Score équité</td>
            {MODEL_CONFIGS.map((config) => {
              const isLocked = !unlockedModels.has(config.id);
              const result = isLocked ? null : getModelResult(results, config.id);

              return (
                <td key={config.id} className="py-2 px-3 text-center text-xs">
                  {result ? `${Math.round(result.equityScore * 100)}%` : "—"}
                </td>
              );
            })}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
