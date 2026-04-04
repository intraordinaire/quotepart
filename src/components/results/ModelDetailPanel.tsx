"use client";

import React from "react";
import type { ModelId } from "@/domain/types";
import type { CalculationResults } from "@/domain/calculate";
import { MODEL_CONTENT } from "@/lib/modelContent";

interface ModelDetailPanelProps {
  modelId: ModelId | null;
  results: CalculationResults;
  p1Name: string;
  p2Name: string;
  onClose: () => void;
  domesticEnabled?: boolean;
}

function formatMoney(value: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " €";
}

export function ModelDetailPanel({
  modelId,
  results,
  p1Name,
  p2Name,
  onClose,
  domesticEnabled = false,
}: ModelDetailPanelProps): React.ReactElement | null {
  if (modelId === null) return null;

  const content = MODEL_CONTENT[modelId];
  const domestic = results.domestic;

  return (
    <div className="bg-bg border border-border rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-xl font-normal">{content.label}</h2>
        <button
          type="button"
          aria-label="Fermer"
          onClick={onClose}
          className="text-text-dim hover:text-text transition-colors text-lg leading-none shrink-0 mt-0.5 cursor-pointer"
        >
          ✕
        </button>
      </div>

      {/* Formula */}
      <div className="bg-surface border border-border rounded-lg px-4 py-3">
        <p className="text-sm font-mono text-text-dim">{content.formula}</p>
      </div>

      {/* Philosophy */}
      <p className="text-sm text-text-dim leading-relaxed">{content.philosophy}</p>

      {/* Advantages */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-2">
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
        <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-2">
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
        <p className="text-sm text-text-dim italic">
          Avec des revenus à temps plein identiques, ce modèle est identique au M2.
        </p>
      )}

      {/* M4 options */}
      {modelId === "m4_adjusted_time" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-surface border border-border rounded-lg px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-2">
              Option A — revenus réels
            </h3>
            <p className="text-sm">
              {p1Name}&nbsp;: {formatMoney(results.m4_adjusted_time.optionA.p1Contribution)}
              {" — "}
              {p2Name}&nbsp;: {formatMoney(results.m4_adjusted_time.optionA.p2Contribution)}
            </p>
          </div>
          <div className="bg-surface border border-border rounded-lg px-4 py-3">
            <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-2">
              Option B — temps plein théorique
            </h3>
            <p className="text-sm">
              {p1Name}&nbsp;: {formatMoney(results.m4_adjusted_time.optionB.p1Contribution)}
              {" — "}
              {p2Name}&nbsp;: {formatMoney(results.m4_adjusted_time.optionB.p2Contribution)}
            </p>
          </div>
        </div>
      )}

      {/* Domestic adjustment section (when toggle is on, for M2/M3/M4) */}
      {domesticEnabled && modelId !== "m1_5050" && domestic && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-2">
            Ajustement domestique
          </h3>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-1.5 font-medium text-text-dim">Personne</th>
                <th className="text-right py-1.5 font-medium text-text-dim">Heures/sem</th>
                <th className="text-right py-1.5 font-medium text-text-dim">Valeur mensuelle</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border">
                <td className="py-1.5">{p1Name}</td>
                <td className="py-1.5 text-right">{domestic.p1WeeklyDomesticHours.toFixed(1)}h</td>
                <td className="py-1.5 text-right">
                  {formatMoney(domestic.p1DomesticMonthlyValue)}
                </td>
              </tr>
              <tr>
                <td className="py-1.5">{p2Name}</td>
                <td className="py-1.5 text-right">{domestic.p2WeeklyDomesticHours.toFixed(1)}h</td>
                <td className="py-1.5 text-right">
                  {formatMoney(domestic.p2DomesticMonthlyValue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
