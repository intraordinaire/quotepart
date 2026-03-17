"use client";

import React from "react";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelId } from "@/domain/types";

interface TemporalProjectionProps {
  results: CalculationResults;
  unlockedModels: Set<ModelId>;
  p1Name: string;
  p2Name: string;
}

const MODEL_ORDER: ModelId[] = [
  "m1_5050",
  "m2_income_ratio",
  "m3_equal_rav",
  "m4_adjusted_time",
  "m5_total_contribution",
];

const MODEL_LABELS: Record<ModelId, string> = {
  m1_5050: "M1 — 50/50",
  m2_income_ratio: "M2 — Revenu proportionnel",
  m3_equal_rav: "M3 — RAV égal",
  m4_adjusted_time: "M4 — Temps ajusté",
  m5_total_contribution: "M5 — Contribution totale",
};

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(amount) + " €";
}

export function TemporalProjection({
  results,
  unlockedModels,
  p1Name,
  p2Name,
}: TemporalProjectionProps): React.ReactElement {
  const m1Year1 = results.projections.m1_5050?.year1 ?? 0;

  return (
    <section className="space-y-4">
      <p className="text-sm text-text-secondary">
        Sur 10 ans, l&apos;écart cumulé entre <strong>{p1Name}</strong> et <strong>{p2Name}</strong>{" "}
        atteint <strong>{formatAmount(m1Year1)}</strong> par an avec le M1. Comparez les modèles
        pour mesurer l&apos;impact dans le temps.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-medium text-text-secondary">Modèle</th>
              <th className="text-right py-2 px-4 font-medium text-text-secondary">1 an</th>
              <th className="text-right py-2 px-4 font-medium text-text-secondary">5 ans</th>
              <th className="text-right py-2 pl-4 font-medium text-text-secondary">10 ans</th>
            </tr>
          </thead>
          <tbody>
            {MODEL_ORDER.map((modelId) => {
              const isLocked = !unlockedModels.has(modelId);
              const row = results.projections[modelId];

              return (
                <tr
                  key={modelId}
                  aria-disabled={isLocked ? "true" : undefined}
                  className={["border-b border-border last:border-0", isLocked ? "opacity-40" : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <td className="py-2 pr-4 font-medium">{MODEL_LABELS[modelId]}</td>
                  <td className="text-right py-2 px-4 tabular-nums">
                    {row ? formatAmount(row.year1) : "—"}
                  </td>
                  <td className="text-right py-2 px-4 tabular-nums">
                    {row ? formatAmount(row.year5) : "—"}
                  </td>
                  <td className="text-right py-2 pl-4 tabular-nums">
                    {row ? formatAmount(row.year10) : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
