"use client";

import React, { useState } from "react";
import { useSimulation } from "@/context/useSimulation";
import { getUnlockedModels } from "@/context/SimulationContext";
import { calculate } from "@/domain/calculate";
import type { ModelId, SimulationInput } from "@/domain/types";
import { ComparisonTable } from "./ComparisonTable";
import { EquityGauges } from "./EquityGauges";
import { TemporalProjection } from "./TemporalProjection";
import { ModelDetailPanel } from "./ModelDetailPanel";
import { PerceptionConfrontation } from "./PerceptionConfrontation";
import { displayName } from "@/lib/names";
import type { DomesticSliders } from "@/domain/types";

const DEFAULT_SLIDERS: DomesticSliders = {
  groceries: 50,
  cooking: 50,
  cleaning: 50,
  admin: 50,
  childrenAppointments: 50,
  schoolSupport: 50,
  maintenance: 50,
  planning: 50,
};

export function ResultsShell(): React.JSX.Element {
  const { state, dispatch } = useSimulation();
  const [selectedModel, setSelectedModel] = useState<ModelId | null>(null);

  const rawInput = state.input;
  const unlockedModels = getUnlockedModels(state);

  if (!state.completedTiers.has(1) || !rawInput.p1 || !rawInput.p2) {
    return (
      <div className="text-text-dim text-sm py-8 text-center">
        Complétez le palier 1 pour voir vos résultats.
      </div>
    );
  }

  const p1 = rawInput.p1;
  const p2 = rawInput.p2;

  const input: SimulationInput = {
    p1: {
      name: p1.name ?? "",
      income: p1.income ?? 0,
      personalCharges: p1.personalCharges ?? 0,
      workQuota: p1.workQuota ?? 1.0,
      fullTimeIncome: p1.fullTimeIncome ?? p1.income ?? 0,
      partTimeReason: p1.partTimeReason ?? null,
    },
    p2: {
      name: p2.name ?? "",
      income: p2.income ?? 0,
      personalCharges: p2.personalCharges ?? 0,
      workQuota: p2.workQuota ?? 1.0,
      fullTimeIncome: p2.fullTimeIncome ?? p2.income ?? 0,
      partTimeReason: p2.partTimeReason ?? null,
    },
    commonCharges: rawInput.commonCharges ?? 0,
    hasChildren: rawInput.hasChildren ?? false,
    domesticSliders: rawInput.domesticSliders ?? { p1: DEFAULT_SLIDERS },
    hourlyRate: rawInput.hourlyRate ?? 9.57,
  };

  const results = calculate(input);
  const p1Name = displayName(input.p1?.name ?? "", "Personne 1");
  const p2Name = displayName(input.p2?.name ?? "", "Personne 2");

  const tier4Done = state.completedTiers.has(4) || state.skippedTiers.has(4);

  return (
    <div className="space-y-10">
      {/* Comparison table */}
      <section>
        <h2 className="font-display text-[28px] font-normal mb-6">Comparaison des modèles</h2>
        <ComparisonTable
          results={results}
          unlockedModels={unlockedModels}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          p1Name={p1Name}
          p2Name={p2Name}
        />
      </section>

      {/* Detail panel (opens when a model is selected) */}
      {selectedModel && (
        <ModelDetailPanel
          modelId={selectedModel}
          results={results}
          input={input}
          onClose={() => setSelectedModel(null)}
        />
      )}

      {/* Equity gauges */}
      <section>
        <h2 className="font-display text-[28px] font-normal mb-6">Score d&apos;équité</h2>
        <EquityGauges results={results} unlockedModels={unlockedModels} />
      </section>

      {/* Temporal projection */}
      <section>
        <h2 className="font-display text-[28px] font-normal mb-6">Projection dans le temps</h2>
        <TemporalProjection
          results={results}
          unlockedModels={unlockedModels}
          p1Name={p1Name}
          p2Name={p2Name}
        />
      </section>

      {/* Perception confrontation (couple mode only) */}
      {state.mode === "shared" && tier4Done && (
        <section>
          <h2 className="font-display text-[28px] font-normal mb-6">
            Perception du travail domestique
          </h2>
          <PerceptionConfrontation
            mode={state.mode}
            p1Sliders={input.domesticSliders?.p1 as DomesticSliders}
            p2Sliders={input.domesticSliders?.p2}
            hasChildren={input.hasChildren ?? false}
            p1Name={p1Name}
            p2Name={p2Name}
          />
        </section>
      )}

      {/* Et si... CTA */}
      <div className="pt-4 border-t border-border flex justify-end">
        <button
          type="button"
          onClick={() => dispatch({ type: "SET_TAB", payload: "etsi" })}
          className="inline-flex items-center gap-2 bg-text text-bg px-5 py-2.5 rounded-md text-sm font-medium transition-colors hover:opacity-80"
        >
          Et si... explorer des scénarios
        </button>
      </div>
    </div>
  );
}
