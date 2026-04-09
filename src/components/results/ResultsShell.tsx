"use client";

import React, { useState } from "react";
import { useSimulation } from "@/context/useSimulation";
import { getUnlockedModels, isDomesticAvailable } from "@/context/SimulationContext";
import { calculate } from "@/domain/calculate";
import type { ModelId } from "@/domain/types";
import { ComparisonTable } from "./ComparisonTable";
import { EquityGauges } from "./EquityGauges";
import { TemporalProjection } from "./TemporalProjection";
import { ModelDetailPanel } from "./ModelDetailPanel";
import { PerceptionConfrontation } from "./PerceptionConfrontation";
import { displayName } from "@/lib/names";
import type { DomesticSliders } from "@/domain/types";
import { toFullInput } from "@/lib/inputDefaults";
import { Switch } from "@/components/ui/Switch";
import { FormField } from "@/components/ui/FormField";
import { ResultsSummary } from "./ResultsSummary";
import { formatCurrency } from "@/lib/format";
import { ShareLinkPanel } from "@/components/form/ShareLinkPanel";

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

  // P1 in shared mode: show waiting screen with invite link
  if (state.role === "p1" && state.mode === "shared") {
    const fullInput = toFullInput(rawInput);
    const p2DisplayName = displayName(fullInput.p2?.name ?? "", "Personne 2");
    return (
      <div className="max-w-lg mx-auto py-12 text-center space-y-6">
        <h2 className="font-display text-2xl">En attente de {p2DisplayName}</h2>
        <p className="text-sm text-text-dim">
          Vous avez terminé votre partie. Envoyez ce lien à votre partenaire pour qu&apos;il
          complète ses données et découvre les résultats.
        </p>
        <ShareLinkPanel input={fullInput} mode="shared" role="p1" />
        <div className="text-xs text-text-dim space-y-1 pt-4">
          <p className="font-medium">Paliers complétés</p>
          {[1, 2, 3, 4].map((t) => {
            const tier = t as 1 | 2 | 3 | 4;
            const done = state.completedTiers.has(tier);
            const skipped = tier !== 1 && state.skippedTiers.has(tier);
            return (
              <p key={tier}>
                Palier {tier} : {done ? "complété" : skipped ? "passé" : "—"}
              </p>
            );
          })}
        </div>
      </div>
    );
  }

  const input = toFullInput(rawInput);

  const results = calculate(input);
  const p1Name = displayName(input.p1?.name ?? "", "Personne 1");
  const p2Name = displayName(input.p2?.name ?? "", "Personne 2");

  const domesticAvailable = isDomesticAvailable(state);
  const domesticEnabled = state.domesticEnabled;

  return (
    <div className="space-y-10">
      {/* Context summary */}
      <ResultsSummary
        p1Name={p1Name}
        p2Name={p2Name}
        p1Income={input.p1.income}
        p2Income={input.p2.income}
        p1PersonalCharges={input.p1.personalCharges}
        p2PersonalCharges={input.p2.personalCharges}
        commonCharges={input.commonCharges}
      />

      {/* Domestic toggle */}
      {domesticAvailable && (
        <div className="bg-surface border border-border rounded-xl p-5 md:px-7 md:py-5 space-y-4">
          <Switch
            checked={domesticEnabled}
            onChange={(v) => dispatch({ type: "TOGGLE_DOMESTIC", payload: v })}
            label="Valoriser le travail domestique"
          />
          {domesticEnabled && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-end gap-3">
                <FormField
                  label="Taux horaire"
                  value={String(input.hourlyRate)}
                  onChange={(v) =>
                    dispatch({ type: "UPDATE_INPUT", payload: { hourlyRate: Number(v) || 0 } })
                  }
                  suffix="€/h"
                  numeric
                />
                <span className="text-xs text-text-dim pb-3">SMIC net 2026</span>
              </div>
              {results.domestic && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted mb-2">
                    Répartition estimée
                  </p>
                  <p className="text-sm text-text-dim">
                    {p1Name} : {results.domestic.p1WeeklyDomesticHours.toFixed(1)}h/sem
                    {" · "}
                    {formatCurrency(results.domestic.p1DomesticMonthlyValue)}/mois
                  </p>
                  <p className="text-sm text-text-dim">
                    {p2Name} : {results.domestic.p2WeeklyDomesticHours.toFixed(1)}h/sem
                    {" · "}
                    {formatCurrency(results.domestic.p2DomesticMonthlyValue)}/mois
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Comparison table */}
      <section>
        <h2 className="font-display text-xl md:text-[28px] font-normal mb-4 md:mb-6">
          Comparaison des modèles
        </h2>
        <ComparisonTable
          results={results}
          unlockedModels={unlockedModels}
          selectedModel={selectedModel}
          onModelSelect={setSelectedModel}
          p1Name={p1Name}
          p2Name={p2Name}
          domesticEnabled={domesticEnabled}
        />
      </section>

      {/* Detail panel (opens when a model is selected) */}
      {selectedModel && (
        <ModelDetailPanel
          modelId={selectedModel}
          results={results}
          p1Name={p1Name}
          p2Name={p2Name}
          onClose={() => setSelectedModel(null)}
          domesticEnabled={domesticEnabled}
        />
      )}

      {/* Equity gauges */}
      <section>
        <h2 className="font-display text-xl md:text-[28px] font-normal mb-4 md:mb-6">
          Score d&apos;équité
        </h2>
        <EquityGauges
          results={results}
          unlockedModels={unlockedModels}
          domesticEnabled={domesticEnabled}
        />
      </section>

      {/* Temporal projection */}
      <section>
        <h2 className="font-display text-xl md:text-[28px] font-normal mb-4 md:mb-6">
          Projection dans le temps
        </h2>
        <TemporalProjection
          results={results}
          unlockedModels={unlockedModels}
          p1Name={p1Name}
          p2Name={p2Name}
          domesticEnabled={domesticEnabled}
        />
      </section>

      {/* Perception confrontation (when domestic enabled + couple mode) */}
      {domesticEnabled && state.mode === "shared" && (
        <section>
          <h2 className="font-display text-xl md:text-[28px] font-normal mb-4 md:mb-6">
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

      {/* Share link panel */}
      <section>
        <h2 className="font-display text-xl md:text-[28px] font-normal mb-4 md:mb-6">Partager</h2>
        <ShareLinkPanel input={input} mode={state.mode ?? "full"} role={state.role} />
      </section>
    </div>
  );
}
