"use client";

import React from "react";
import { useWhatIf } from "@/context/WhatIfContext";
import { displayName } from "@/lib/names";
import { DeltaRow } from "./DeltaRow";
import type { ModelId } from "@/domain/types";

const MODEL_LABELS: Record<ModelId, string> = {
  m1_5050: "50/50",
  m2_income_ratio: "Au prorata des revenus",
  m3_equal_rav: "Reste à vivre égal",
  m4_adjusted_time: "Ajusté temps partiel",
  m5_total_contribution: "Contribution totale",
};

function getModelResult(
  results: ReturnType<typeof useWhatIf>["beforeResults"],
  id: ModelId
): { p1Contribution: number; p2Contribution: number; equityScore: number } {
  if (id === "m4_adjusted_time") return results.m4_adjusted_time.optionB;
  if (id === "m5_total_contribution") return results.m5_total_contribution.modelResult;
  return results[id];
}

export function SnapshotPanel(): React.JSX.Element {
  const { beforeInput, beforeResults, afterResults } = useWhatIf();

  const p1Name = displayName(beforeInput.p1?.name ?? "", "Personne 1");
  const p2Name = displayName(beforeInput.p2?.name ?? "", "Personne 2");

  const modelIds: ModelId[] = [
    "m1_5050",
    "m2_income_ratio",
    "m3_equal_rav",
    "m4_adjusted_time",
    "m5_total_contribution",
  ];

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg">Situation actuelle</h3>

      <div className="text-xs text-text-dim space-y-1">
        <div>
          {p1Name} : {beforeInput.p1.income} €/mois
        </div>
        <div>
          {p2Name} : {beforeInput.p2.income} €/mois
        </div>
        <div>Charges communes : {beforeInput.commonCharges} €/mois</div>
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-2">
          Contribution {p1Name}
        </h4>
        {modelIds.map((id) => {
          const before = getModelResult(beforeResults, id);
          const after = getModelResult(afterResults, id);
          return (
            <DeltaRow
              key={id}
              label={MODEL_LABELS[id]}
              before={before.p1Contribution}
              after={after.p1Contribution}
              changed={before.p1Contribution !== after.p1Contribution}
            />
          );
        })}
      </div>

      <div className="space-y-1">
        <h4 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-2">
          Score d&apos;équité
        </h4>
        {modelIds.map((id) => {
          const before = getModelResult(beforeResults, id);
          const after = getModelResult(afterResults, id);
          return (
            <DeltaRow
              key={`eq-${id}`}
              label={MODEL_LABELS[id]}
              before={before.equityScore}
              after={after.equityScore}
              format={(v) => `${Math.round(v * 100)}%`}
              reverseColors
              changed={before.equityScore !== after.equityScore}
            />
          );
        })}
      </div>
    </div>
  );
}
