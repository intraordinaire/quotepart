"use client";

import React, { useState } from "react";
import { useSimulation } from "@/context/useSimulation";
import { SliderField } from "@/components/ui/SliderField";
import { displayName } from "@/lib/names";
import type { DomesticCategory, DomesticSliders } from "@/domain/types";

interface DomesticCategoryConfig {
  key: DomesticCategory;
  label: string;
  hours: string;
  childrenOnly?: boolean;
}

const DOMESTIC_CATEGORIES: DomesticCategoryConfig[] = [
  { key: "groceries", label: "Courses alimentaires", hours: "3h/sem" },
  { key: "cooking", label: "Préparation des repas", hours: "7h/sem" },
  { key: "cleaning", label: "Ménage & linge", hours: "6h/sem" },
  { key: "admin", label: "Admin & paperasse", hours: "2h/sem" },
  { key: "childrenAppointments", label: "RDV enfants", hours: "2h/sem", childrenOnly: true },
  {
    key: "schoolSupport",
    label: "Accompagnement scolaire",
    hours: "3h/sem",
    childrenOnly: true,
  },
  { key: "maintenance", label: "Bricolage & entretien", hours: "2h/sem" },
  { key: "planning", label: "Organisation & planification", hours: "3h/sem" },
];

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

export function Tier4Domestic(): React.JSX.Element {
  const { state, dispatch } = useSimulation();
  const isShared = state.mode === "shared";
  const input = state.input;
  const hasChildren = input.hasChildren ?? false;

  const p1Name = displayName(input.p1?.name ?? "", "Personne 1");
  const p2Name = displayName(input.p2?.name ?? "", "Personne 2");

  const [sliders, setSliders] = useState<DomesticSliders>(DEFAULT_SLIDERS);

  const visibleCategories = DOMESTIC_CATEGORIES.filter((cat) => !cat.childrenOnly || hasChildren);

  function handleSliderChange(key: DomesticCategory, value: number): void {
    const updated = { ...sliders, [key]: value };
    setSliders(updated);
    dispatch({
      type: "UPDATE_INPUT",
      payload: {
        domesticSliders: {
          ...(input.domesticSliders ?? {}),
          p1: updated,
        },
      },
    });
  }

  function handleRetour(): void {
    dispatch({ type: "SET_TIER", payload: 3 });
  }

  function handleComplete(): void {
    dispatch({ type: "COMPLETE_TIER", payload: 4 });
  }

  return (
    <div className="animate-tier-in">
      <h2 className="font-display text-2xl mb-1">Répartition domestique</h2>
      <p className="text-sm text-text-secondary mb-1.5">
        Qui fait quoi à la maison ? Débloque le modèle Contribution totale.
      </p>
      <p className="text-xs italic text-text-secondary mb-8">
        {isShared
          ? `Votre perception. ${p2Name} remplira la sienne via le lien partagé.`
          : "Estimez la répartition. Votre partenaire pourra ajuster via le lien de correction."}
      </p>

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

      <div className="p-3 px-4 bg-neutral-50 rounded-lg text-xs text-text-secondary mb-6 leading-relaxed border-l-[3px] border-[#D4D4CC]">
        Heures de référence basées sur l&apos;Enquête Emploi du Temps (INSEE). Valorisation : SMIC
        net horaire (9,57 €/h).
      </div>

      <div className="flex justify-between items-start">
        <button
          type="button"
          onClick={handleRetour}
          className="text-sm font-medium px-5 py-2.5 bg-transparent text-text-secondary border border-[#E8E8E4] rounded-md cursor-pointer"
        >
          Retour
        </button>

        {isShared ? (
          <button
            type="button"
            onClick={handleComplete}
            className="text-sm font-semibold px-7 py-3.5 bg-[#D4593A] text-white border-none rounded-lg cursor-pointer flex flex-col items-center gap-1"
          >
            <span>Copier le lien pour {p2Name}</span>
            <span className="text-[11px] font-normal text-white/70">
              Elle complétera ses données et verra les résultats
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            className="text-sm font-semibold px-6 py-3.5 bg-neutral-900 text-white border-none rounded-lg cursor-pointer flex items-center gap-1.5"
          >
            Voir les résultats
          </button>
        )}
      </div>
    </div>
  );
}
