"use client";

import React from "react";
import type { ModelId } from "@/domain/types";
import type { CalculationResults } from "@/domain/calculate";
import type { SimulationInput } from "@/domain/types";
import { MODEL_CONTENT } from "@/lib/modelContent";

interface ModelDetailPanelProps {
  modelId: ModelId | null;
  results: CalculationResults;
  input: SimulationInput;
  onClose: () => void;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " €";
}

export function ModelDetailPanel({
  modelId,
  results,
  onClose,
}: ModelDetailPanelProps): React.ReactElement | null {
  if (modelId === null) return null;

  const content = MODEL_CONTENT[modelId];

  return (
    <div className="bg-bg border border-border rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-xl font-normal">{content.label}</h2>
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="text-text-secondary hover:text-text transition-colors text-lg leading-none shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>

      {/* Formula */}
      <div className="bg-bg-elevated border border-border rounded-lg px-4 py-3">
        <p className="text-sm font-mono text-text-secondary">{content.formula}</p>
      </div>

      {/* Philosophy */}
      <p className="text-sm text-text-secondary leading-relaxed">{content.philosophy}</p>

      {/* Advantages */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-secondary mb-2">
          Avantages
        </h3>
        <ul className="space-y-1">
          {content.advantages.map((adv) => (
            <li key={adv} className="text-sm flex gap-2">
              <span className="text-green shrink-0">+</span>
              {adv}
            </li>
          ))}
        </ul>
      </div>

      {/* Limitations */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-secondary mb-2">
          Limites
        </h3>
        <ul className="space-y-1">
          {content.limitations.map((lim) => (
            <li key={lim} className="text-sm flex gap-2">
              <span className="text-accent shrink-0">–</span>
              {lim}
            </li>
          ))}
        </ul>
      </div>

      {/* M4 note */}
      {modelId === "m4_adjusted_time" && results.m4_adjusted_time.isSameAsM2 && (
        <p className="text-sm text-text-secondary italic">
          Avec des revenus à temps plein identiques, ce modèle est identique au M2.
        </p>
      )}

      {/* M4 options */}
      {modelId === "m4_adjusted_time" && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-bg-elevated border border-border rounded-lg px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-secondary mb-2">
              Option A — revenus réels
            </h3>
            <p className="text-sm">
              P1&nbsp;: {formatMoney(results.m4_adjusted_time.optionA.p1Contribution)}
              {" — "}
              P2&nbsp;: {formatMoney(results.m4_adjusted_time.optionA.p2Contribution)}
            </p>
          </div>
          <div className="bg-bg-elevated border border-border rounded-lg px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-secondary mb-2">
              Option B — temps plein théorique
            </h3>
            <p className="text-sm">
              P1&nbsp;: {formatMoney(results.m4_adjusted_time.optionB.p1Contribution)}
              {" — "}
              P2&nbsp;: {formatMoney(results.m4_adjusted_time.optionB.p2Contribution)}
            </p>
          </div>
        </div>
      )}

      {/* M5 note */}
      {modelId === "m5_total_contribution" && results.m5_total_contribution.isSameAsM2 && (
        <p className="text-sm text-text-secondary italic">
          Avec une répartition équilibrée des tâches domestiques, ce modèle est identique au M2.
        </p>
      )}

      {/* M5 domestic breakdown */}
      {modelId === "m5_total_contribution" && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-secondary mb-2">
            Valeur du travail domestique
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 font-medium text-text-secondary">Personne</th>
                <th className="text-right py-1.5 font-medium text-text-secondary">
                  Valeur mensuelle
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-1.5">P1</td>
                <td className="py-1.5 text-right">
                  {formatMoney(results.m5_total_contribution.p1DomesticMonthlyValue)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">P2</td>
                <td className="py-1.5 text-right">
                  {formatMoney(results.m5_total_contribution.p2DomesticMonthlyValue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
