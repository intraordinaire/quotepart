"use client";

import React from "react";
import { useWhatIf } from "@/context/WhatIfContext";
import { displayName } from "@/lib/names";
import { DeltaRow } from "./DeltaRow";
import { MODEL_LABELS, MODEL_ORDER, getModelResult } from "@/lib/modelUtils";

export function SnapshotPanel(): React.JSX.Element {
  const { beforeInput, beforeResults, afterResults } = useWhatIf();

  const p1Name = displayName(beforeInput.p1?.name ?? "", "Personne 1");
  const p2Name = displayName(beforeInput.p2?.name ?? "", "Personne 2");

  const modelIds = MODEL_ORDER;

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
