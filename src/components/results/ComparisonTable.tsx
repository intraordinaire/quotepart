"use client";

import React from "react";
import type { ModelId } from "@/domain/types";
import type { CalculationResults } from "@/domain/calculate";
import { LockedModelOverlay } from "./LockedModelOverlay";
import {
  MODEL_CONFIGS,
  getModelResult,
  isRedundantModel,
  isNonViableModel,
} from "@/lib/modelUtils";
import { formatCurrency } from "@/lib/format";

export interface ComparisonTableProps {
  results: CalculationResults;
  unlockedModels: Set<ModelId>;
  selectedModel: ModelId | null;
  onModelSelect: (id: ModelId) => void;
  p1Name: string;
  p2Name: string;
}

function formatContribution(
  amount: number,
  personName: string,
  otherName: string
): React.ReactNode {
  if (amount < 0) {
    const absFormatted = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(
      Math.abs(amount)
    );
    return (
      <span className="text-accent text-[10px]">
        {otherName} → {personName}&nbsp;: {absFormatted}&nbsp;€
      </span>
    );
  }
  return formatCurrency(amount);
}

function isDimmedColumn(results: CalculationResults, id: ModelId): boolean {
  return isRedundantModel(results, id) || isNonViableModel(results, id);
}

interface FootnoteEntry {
  shortLabel: string;
  message: string;
  variant: "redundant" | "nonViable";
}

const REDUNDANT_MESSAGES: Partial<Record<ModelId, string>> = {
  m4_adjusted_time: "Les deux personnes travaillent à temps plein : identique au M2.",
  m5_total_contribution: "Répartition domestique équilibrée : identique au M2.",
};

export function ComparisonTable({
  results,
  unlockedModels,
  selectedModel,
  onModelSelect,
  p1Name,
  p2Name,
}: ComparisonTableProps): React.JSX.Element {
  const chargesAlert = results.validationErrors.find((e) => e.type === "charges_exceed_income");

  return (
    <div className="space-y-3 w-full">
      {chargesAlert && (
        <div
          role="alert"
          className="bg-accent-dim border border-accent text-accent rounded-md px-4 py-2 text-sm"
        >
          {chargesAlert.message}
        </div>
      )}
      <div className="overflow-x-auto w-full -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full min-w-[520px] border-collapse text-xs md:text-sm">
          <thead>
            <tr>
              <th className="text-left py-2 px-3 text-text-dim font-medium w-32" />
              {MODEL_CONFIGS.map((config) => {
                const isLocked = !unlockedModels.has(config.id);
                const isSelected = config.id === selectedModel;

                return (
                  <th
                    key={config.id}
                    data-model={config.id}
                    className={[
                      "py-2 px-3 text-center font-semibold border rounded-t-md border-border",
                      isLocked
                        ? "opacity-40 cursor-not-allowed text-text-dim"
                        : "cursor-pointer text-text-dim group/th transition-all duration-200 hover:bg-surface hover:text-text",
                      isSelected && !isLocked ? "bg-surface text-text" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    onClick={() => {
                      if (!isLocked) onModelSelect(config.id);
                    }}
                  >
                    {isLocked ? (
                      <span>{config.shortLabel}</span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span className="underline decoration-dotted underline-offset-4 decoration-text-muted group-hover/th:decoration-solid group-hover/th:decoration-accent">
                          {config.shortLabel}
                        </span>
                        <span
                          className="text-[10px] text-text-muted opacity-0 -translate-x-1 transition-all duration-200 group-hover/th:opacity-100 group-hover/th:translate-x-0"
                          aria-hidden="true"
                        >
                          ›
                        </span>
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Row: model full label */}
            <tr className="border-b border-border">
              <td className="py-2 px-3 text-text-dim text-xs">Modèle</td>
              {MODEL_CONFIGS.map((config) => {
                const isLocked = !unlockedModels.has(config.id);
                const dimmed = !isLocked && isDimmedColumn(results, config.id);

                return (
                  <td
                    key={config.id}
                    className={[
                      "py-2 px-3 text-center text-xs relative",
                      isLocked || dimmed ? "opacity-40" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {isLocked && config.tierRequired !== null ? (
                      <div className="relative min-h-8">
                        <LockedModelOverlay tierRequired={config.tierRequired} />
                      </div>
                    ) : (
                      <span className="text-text-dim">{config.fullLabel}</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Row: P1 contribution */}
            <tr className="border-b border-border">
              <td className="py-2 px-3 text-text-dim text-xs">Part {p1Name || "Personne 1"}</td>
              {MODEL_CONFIGS.map((config) => {
                const isLocked = !unlockedModels.has(config.id);
                const dimmed = !isLocked && isDimmedColumn(results, config.id);
                const result = isLocked ? null : getModelResult(results, config.id);

                return (
                  <td
                    key={config.id}
                    className={`py-2 px-3 text-center text-xs${dimmed ? " opacity-40" : ""}`}
                  >
                    {result ? formatContribution(result.p1Contribution, p1Name, p2Name) : "—"}
                  </td>
                );
              })}
            </tr>

            {/* Row: P2 contribution */}
            <tr className="border-b border-border">
              <td className="py-2 px-3 text-text-dim text-xs">Part {p2Name || "Personne 2"}</td>
              {MODEL_CONFIGS.map((config) => {
                const isLocked = !unlockedModels.has(config.id);
                const dimmed = !isLocked && isDimmedColumn(results, config.id);
                const result = isLocked ? null : getModelResult(results, config.id);

                return (
                  <td
                    key={config.id}
                    className={`py-2 px-3 text-center text-xs${dimmed ? " opacity-40" : ""}`}
                  >
                    {result ? formatContribution(result.p2Contribution, p2Name, p1Name) : "—"}
                  </td>
                );
              })}
            </tr>

            {/* Row: P1 disposable income */}
            <tr className="border-b border-border">
              <td className="py-2 px-3 text-text-dim text-xs">
                Reste à vivre {p1Name || "Personne 1"}
              </td>
              {MODEL_CONFIGS.map((config) => {
                const isLocked = !unlockedModels.has(config.id);
                const dimmed = !isLocked && isDimmedColumn(results, config.id);
                const result = isLocked ? null : getModelResult(results, config.id);

                return (
                  <td
                    key={config.id}
                    className={`py-2 px-3 text-center text-xs${dimmed ? " opacity-40" : ""}`}
                  >
                    {result ? formatCurrency(result.p1DisposableIncome) : "—"}
                  </td>
                );
              })}
            </tr>

            {/* Row: P2 disposable income */}
            <tr className="border-b border-border">
              <td className="py-2 px-3 text-text-dim text-xs">
                Reste à vivre {p2Name || "Personne 2"}
              </td>
              {MODEL_CONFIGS.map((config) => {
                const isLocked = !unlockedModels.has(config.id);
                const dimmed = !isLocked && isDimmedColumn(results, config.id);
                const result = isLocked ? null : getModelResult(results, config.id);

                return (
                  <td
                    key={config.id}
                    className={`py-2 px-3 text-center text-xs${dimmed ? " opacity-40" : ""}`}
                  >
                    {result ? formatCurrency(result.p2DisposableIncome) : "—"}
                  </td>
                );
              })}
            </tr>

            {/* Row: equity score */}
            <tr>
              <td className="py-2 px-3 text-text-dim text-xs">Score équité</td>
              {MODEL_CONFIGS.map((config) => {
                const isLocked = !unlockedModels.has(config.id);
                const dimmed = !isLocked && isDimmedColumn(results, config.id);
                const result = isLocked ? null : getModelResult(results, config.id);

                return (
                  <td
                    key={config.id}
                    className={`py-2 px-3 text-center text-xs${dimmed ? " opacity-40" : ""}`}
                  >
                    {result ? `${Math.round(result.equityScore * 100)}%` : "—"}
                  </td>
                );
              })}
            </tr>
          </tbody>
          {/* Footer: notes for redundant and non-viable models */}
          {((): React.ReactNode => {
            const footnotes: FootnoteEntry[] = [];
            MODEL_CONFIGS.forEach((c) => {
              if (!unlockedModels.has(c.id)) return;
              if (isRedundantModel(results, c.id)) {
                footnotes.push({
                  shortLabel: c.shortLabel,
                  message: REDUNDANT_MESSAGES[c.id] ?? "",
                  variant: "redundant",
                });
              } else if (isNonViableModel(results, c.id)) {
                const result = getModelResult(results, c.id);
                const warning = result.warnings[0] ?? "La contribution dépasse le revenu.";
                footnotes.push({
                  shortLabel: c.shortLabel,
                  message: `Non viable — ${warning}`,
                  variant: "nonViable",
                });
              }
            });
            if (footnotes.length === 0) return null;
            return (
              <tfoot>
                <tr>
                  <td colSpan={6} className="pt-3 px-3">
                    {footnotes.map((fn) => (
                      <p
                        key={fn.shortLabel}
                        className={`text-xs ${fn.variant === "nonViable" ? "text-accent" : "text-text-dim"}`}
                      >
                        <span className="font-semibold">{fn.shortLabel}</span> — {fn.message}
                      </p>
                    ))}
                  </td>
                </tr>
              </tfoot>
            );
          })()}
        </table>
      </div>
    </div>
  );
}
