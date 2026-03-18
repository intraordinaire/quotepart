"use client";

import React from "react";
import { useWhatIf } from "@/context/WhatIfContext";
import { FormField } from "@/components/ui/FormField";
import { SliderField } from "@/components/ui/SliderField";
import { displayName } from "@/lib/names";
import type { DomesticCategory, DomesticSliders } from "@/domain/types";
import { DEFAULT_SLIDERS } from "@/domain/constants";
import { DOMESTIC_CATEGORIES } from "@/domain/domestic";

export function WhatIfPanel(): React.JSX.Element {
  const { input, isDirty, dispatch, reset } = useWhatIf();

  const p1Name = displayName(input.p1?.name ?? "", "Personne 1");
  const p2Name = displayName(input.p2?.name ?? "", "Personne 2");
  const hasChildren = input.hasChildren ?? false;

  const visibleCategories = DOMESTIC_CATEGORIES.filter((cat) => !cat.childrenOnly || hasChildren);

  const sliders: DomesticSliders = input.domesticSliders?.p1 ?? DEFAULT_SLIDERS;

  function updateField(path: string[], value: unknown): void {
    dispatch({ type: "UPDATE_FIELD", path, value });
  }

  function handleSliderChange(key: DomesticCategory, value: number): void {
    const updated = { ...sliders, [key]: value };
    updateField(["domesticSliders", "p1"], updated);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">Scénario modifié</h3>
        {isDirty && (
          <button
            type="button"
            onClick={reset}
            className="text-xs font-medium px-3 py-1.5 rounded-md border border-border text-text-dim hover:text-text transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>

      {/* ── Incomes ─────────────────────────────────────────────────────── */}
      <section>
        <h4 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-3">
          Revenus & charges
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={`Revenu ${p1Name}`}
            value={String(input.p1.income)}
            onChange={(v) => updateField(["p1", "income"], Number(v) || 0)}
            suffix="€"
            numeric
          />
          <FormField
            label={`Revenu ${p2Name}`}
            value={String(input.p2.income)}
            onChange={(v) => updateField(["p2", "income"], Number(v) || 0)}
            suffix="€"
            numeric
          />
          <FormField
            label={`Charges perso ${p1Name}`}
            value={String(input.p1.personalCharges)}
            onChange={(v) => updateField(["p1", "personalCharges"], Number(v) || 0)}
            suffix="€"
            numeric
          />
          <FormField
            label={`Charges perso ${p2Name}`}
            value={String(input.p2.personalCharges)}
            onChange={(v) => updateField(["p2", "personalCharges"], Number(v) || 0)}
            suffix="€"
            numeric
          />
          <div className="md:col-span-2">
            <FormField
              label="Charges communes"
              value={String(input.commonCharges)}
              onChange={(v) => updateField(["commonCharges"], Number(v) || 0)}
              suffix="€"
              numeric
            />
          </div>
        </div>
      </section>

      {/* ── Work time ──────────────────────────────────────────────────── */}
      <section>
        <h4 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-3">
          Temps de travail
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label={`Quotité ${p1Name}`}
            value={String(Math.round(input.p1.workQuota * 100))}
            onChange={(v) => updateField(["p1", "workQuota"], (Number(v) || 100) / 100)}
            suffix="%"
            numeric
          />
          <FormField
            label={`Quotité ${p2Name}`}
            value={String(Math.round(input.p2.workQuota * 100))}
            onChange={(v) => updateField(["p2", "workQuota"], (Number(v) || 100) / 100)}
            suffix="%"
            numeric
          />
          <FormField
            label={`Salaire temps plein ${p1Name}`}
            value={String(input.p1.fullTimeIncome)}
            onChange={(v) => updateField(["p1", "fullTimeIncome"], Number(v) || 0)}
            suffix="€"
            numeric
          />
          <FormField
            label={`Salaire temps plein ${p2Name}`}
            value={String(input.p2.fullTimeIncome)}
            onChange={(v) => updateField(["p2", "fullTimeIncome"], Number(v) || 0)}
            suffix="€"
            numeric
          />
        </div>
      </section>

      {/* ── Domestic sliders ───────────────────────────────────────────── */}
      <section>
        <h4 className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-3">
          Répartition domestique
        </h4>
        <div className="flex flex-col gap-4">
          {visibleCategories.map((cat) => (
            <SliderField
              key={cat.key}
              label={cat.label}
              leftName={p1Name}
              rightName={p2Name}
              value={sliders[cat.key]}
              hours={cat.hours}
              onChange={(v) => handleSliderChange(cat.key, v)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
