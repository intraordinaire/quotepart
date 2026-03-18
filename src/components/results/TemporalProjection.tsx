"use client";

import React from "react";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelId } from "@/domain/types";
import { MODEL_ORDER, MODEL_LABELS, isRedundantModel } from "@/lib/modelUtils";
import { formatCurrency } from "@/lib/format";

interface TemporalProjectionProps {
  results: CalculationResults;
  unlockedModels: Set<ModelId>;
  p1Name: string;
  p2Name: string;
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
      <p className="text-sm text-text-dim">
        Sur 10 ans, l&apos;écart cumulé entre <strong>{p1Name}</strong> et <strong>{p2Name}</strong>{" "}
        atteint <strong>{formatCurrency(m1Year1)}</strong> par an avec le M1. Comparez les modèles
        pour mesurer l&apos;impact dans le temps.
      </p>

      <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
        <table className="w-full min-w-[400px] text-xs md:text-sm border-collapse">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 pr-4 font-medium text-text-dim">Modèle</th>
              <th className="text-right py-2 px-4 font-medium text-text-dim">1 an</th>
              <th className="text-right py-2 px-4 font-medium text-text-dim">5 ans</th>
              <th className="text-right py-2 pl-4 font-medium text-text-dim">10 ans</th>
            </tr>
          </thead>
          <tbody>
            {MODEL_ORDER.map((modelId) => {
              const isLocked = !unlockedModels.has(modelId);
              const isRedundant = !isLocked && isRedundantModel(results, modelId);
              const isDimmed = isLocked || isRedundant;
              const row = results.projections[modelId];

              return (
                <tr
                  key={modelId}
                  aria-disabled={isDimmed ? "true" : undefined}
                  className={["border-b border-border last:border-0", isDimmed ? "opacity-40" : ""]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <td className="py-2 pr-4 font-medium">{MODEL_LABELS[modelId]}</td>
                  <td className="text-right py-2 px-4 tabular-nums">
                    {row ? formatCurrency(row.year1) : "—"}
                  </td>
                  <td className="text-right py-2 px-4 tabular-nums">
                    {row ? formatCurrency(row.year5) : "—"}
                  </td>
                  <td className="text-right py-2 pl-4 tabular-nums">
                    {row ? formatCurrency(row.year10) : "—"}
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
