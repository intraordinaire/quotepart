"use client";

import React, { useState } from "react";
import { useSimulation } from "@/context/useSimulation";
import { SliderField } from "@/components/ui/SliderField";
import { displayName } from "@/lib/names";
import { getP2InviteLink } from "@/lib/shareLink";
import type { DomesticCategory, DomesticSliders, SimulationInput } from "@/domain/types";
import { DEFAULT_SLIDERS } from "@/domain/constants";
import { DOMESTIC_CATEGORIES } from "@/domain/domestic";

export function Tier4Domestic(): React.JSX.Element {
  const { state, dispatch } = useSimulation();
  const role = state.role;
  const isP2 = role === "p2";
  const isP1Shared = role === "p1" && state.mode === "shared";
  const input = state.input;
  const hasChildren = input.hasChildren ?? false;

  const p1Name = displayName(input.p1?.name ?? "", "Personne 1");
  const p2Name = displayName(input.p2?.name ?? "", "Personne 2");

  // For P2: init sliders from P1's values (pre-fill), otherwise use defaults
  const [sliders, setSliders] = useState<DomesticSliders>(
    () => (isP2 ? input.domesticSliders?.p1 : undefined) ?? DEFAULT_SLIDERS
  );
  const [copied, setCopied] = useState(false);

  const visibleCategories = DOMESTIC_CATEGORIES.filter((cat) => !cat.childrenOnly || hasChildren);

  function handleSliderChange(key: DomesticCategory, value: number): void {
    const updated = { ...sliders, [key]: value };
    setSliders(updated);

    // P2 writes to domesticSliders.p2, P1 writes to domesticSliders.p1
    const existing = input.domesticSliders;
    dispatch({
      type: "UPDATE_INPUT",
      payload: {
        domesticSliders: isP2
          ? { p1: existing?.p1 ?? DEFAULT_SLIDERS, p2: updated }
          : { ...existing, p1: updated },
      },
    });
  }

  function handleRetour(): void {
    dispatch({ type: "SET_TIER", payload: 3 });
  }

  function handleComplete(): void {
    dispatch({ type: "COMPLETE_TIER", payload: 4 });
    dispatch({ type: "SET_TAB", payload: "resultats" });
  }

  function handleCopyLink(): void {
    dispatch({ type: "COMPLETE_TIER", payload: 4 });
    if (!input.p1) return;
    const link = getP2InviteLink(input as SimulationInput);
    void navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

  const subtitle = isP2
    ? `Votre perception de la répartition. ${p1Name} a déjà rempli la sienne.`
    : isP1Shared
      ? `Votre perception. ${p2Name} remplira la sienne via le lien partagé.`
      : "Estimez la répartition. Votre partenaire pourra ajuster via le lien de correction.";

  return (
    <div className="animate-tier-in">
      <h2 className="font-display text-2xl mb-1">Répartition domestique</h2>
      <p className="text-sm text-text-dim mb-1.5">
        Qui fait quoi à la maison ? Active la valorisation du travail domestique dans les résultats.
      </p>
      <p className="text-xs italic text-text-dim mb-8">{subtitle}</p>

      <div className="flex flex-col gap-5 mb-8">
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

      <div className="p-3 px-4 bg-surface rounded-lg text-xs text-text-dim mb-6 leading-relaxed border-l-[3px] border-border">
        Heures de référence basées sur l&apos;Enquête Emploi du Temps (INSEE). Valorisation : SMIC
        net horaire (9,52 €/h).
      </div>

      <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-between md:items-start">
        <button
          type="button"
          onClick={handleRetour}
          className="text-sm font-medium px-5 py-2.5 bg-transparent text-text-dim border border-border rounded-md cursor-pointer"
        >
          Retour
        </button>

        {isP1Shared ? (
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-sm font-semibold px-7 py-3.5 bg-accent text-white border-none rounded-lg cursor-pointer flex flex-col items-center gap-1"
          >
            {copied ? <span>Lien copié !</span> : <span>Copier le lien pour {p2Name}</span>}
            <span className="text-[11px] font-normal text-white/70">
              Elle complétera ses données et verra les résultats
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            className="text-sm font-semibold px-6 py-3.5 bg-accent text-white border-none rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            Voir les résultats
          </button>
        )}
      </div>
    </div>
  );
}
