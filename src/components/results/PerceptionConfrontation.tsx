"use client";

import React from "react";
import type { DomesticSliders } from "@/domain/types";
import { DOMESTIC_CATEGORIES } from "@/domain/domestic";

interface PerceptionConfrontationProps {
  mode: "full" | "shared";
  p1Sliders: DomesticSliders;
  p2Sliders?: DomesticSliders;
  hasChildren: boolean;
  p1Name: string;
  p2Name: string;
}

export function PerceptionConfrontation({
  mode,
  p1Sliders,
  p2Sliders,
  hasChildren,
  p1Name,
  p2Name,
}: PerceptionConfrontationProps): React.JSX.Element | null {
  if (mode !== "shared" || p2Sliders === undefined) {
    return null;
  }

  const visibleCategories = DOMESTIC_CATEGORIES.filter(
    ({ childrenOnly }) => !childrenOnly || hasChildren
  );

  const hasSignificantGap = visibleCategories.some(({ key }) => {
    const gap = Math.abs(p1Sliders[key] - p2Sliders[key]);
    return gap > 15;
  });

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-base font-semibold text-text-primary">
        Perception du travail domestique
      </h3>

      {hasSignificantGap && (
        <div role="alert" className="rounded-lg bg-accent-dim px-4 py-3 text-sm text-accent">
          Des écarts significatifs ont été détectés dans votre perception du travail domestique. Ces
          différences méritent une discussion ouverte.
        </div>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-text-dim">
            <th className="pb-2 font-medium">Catégorie</th>
            <th className="pb-2 font-medium text-right">{p1Name}</th>
            <th className="pb-2 font-medium text-right">{p2Name}</th>
            <th className="pb-2 font-medium text-right">Écart</th>
          </tr>
        </thead>
        <tbody>
          {visibleCategories.map(({ key, shortLabel }) => {
            const p1Value = p1Sliders[key];
            const p2Value = p2Sliders[key];
            const gap = Math.abs(p1Value - p2Value);
            const isHighlighted = gap > 15;

            return (
              <tr
                key={key}
                data-testid={`row-${key}`}
                className={`border-t border-border ${isHighlighted ? "bg-accent-dim" : ""}`}
              >
                <td className="py-2 text-text-dim">{shortLabel}</td>
                <td className="py-2 text-right font-medium text-text-primary">{p1Value} %</td>
                <td className="py-2 text-right font-medium text-text-primary">{p2Value} %</td>
                <td
                  className={`py-2 text-right font-semibold ${isHighlighted ? "text-accent" : "text-text-dim"}`}
                >
                  {gap}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}
