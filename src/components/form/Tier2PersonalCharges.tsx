"use client";

import React, { useState } from "react";
import { useSimulation } from "@/context/useSimulation";
import { FormField } from "@/components/ui/FormField";
import { LockedField } from "@/components/form/LockedField";
import { displayName } from "@/lib/names";

interface ChargeSubFields {
  transport: string;
  loan: string;
  mutuelle: string;
  other: string;
}

function sumCharges(fields: ChargeSubFields): number {
  return (
    (Number(fields.transport) || 0) +
    (Number(fields.loan) || 0) +
    (Number(fields.mutuelle) || 0) +
    (Number(fields.other) || 0)
  );
}

const EMPTY_CHARGES: ChargeSubFields = {
  transport: "",
  loan: "",
  mutuelle: "",
  other: "",
};

export function Tier2PersonalCharges(): React.JSX.Element {
  const { state, dispatch } = useSimulation();
  const [p1Fields, setP1Fields] = useState<ChargeSubFields>(EMPTY_CHARGES);
  const [p2Fields, setP2Fields] = useState<ChargeSubFields>(EMPTY_CHARGES);

  const isShared = state.mode === "shared";
  const input = state.input;
  const p2Name = displayName(input.p2?.name ?? "", "Personne 2");

  function handleP1Change(field: keyof ChargeSubFields, value: string): void {
    const updated = { ...p1Fields, [field]: value };
    setP1Fields(updated);
    dispatch({
      type: "UPDATE_INPUT",
      payload: {
        p1: { ...(input.p1 ?? {}), personalCharges: sumCharges(updated) } as typeof input.p1 &
          NonNullable<unknown>,
      },
    });
  }

  function handleP2Change(field: keyof ChargeSubFields, value: string): void {
    const updated = { ...p2Fields, [field]: value };
    setP2Fields(updated);
    dispatch({
      type: "UPDATE_INPUT",
      payload: {
        p2: { ...(input.p2 ?? {}), personalCharges: sumCharges(updated) } as typeof input.p2 &
          NonNullable<unknown>,
      },
    });
  }

  function handlePasser(): void {
    dispatch({ type: "SKIP_TIER", payload: 2 });
    dispatch({ type: "SET_TIER", payload: 3 });
  }

  function handleSuivant(): void {
    dispatch({ type: "COMPLETE_TIER", payload: 2 });
    dispatch({ type: "SET_TIER", payload: 3 });
  }

  function handleRetour(): void {
    dispatch({ type: "SET_TIER", payload: 1 });
  }

  return (
    <div>
      <h2 className="font-display text-2xl mb-1">Charges personnelles</h2>
      <p className="text-sm text-[#7A7A75] mb-1.5">
        Les dépenses qui grèvent le reste à vivre de chacun. Débloque le modèle Reste à vivre égal.
      </p>
      <p className="text-xs italic text-[#7A7A75] mb-8">
        Optionnel, vous pouvez passer cette étape.
      </p>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* P1 column */}
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#7A7A75] mb-3">
            {displayName(input.p1?.name ?? "", "Personne 1")}
          </div>
          <div className="flex flex-col gap-3">
            <FormField
              id="p1-transport"
              label="Transport domicile-travail"
              placeholder="80"
              suffix="€"
              value={p1Fields.transport}
              onChange={(v) => handleP1Change("transport", v)}
            />
            <FormField
              id="p1-loan"
              label="Prêt personnel"
              placeholder="0"
              suffix="€"
              value={p1Fields.loan}
              onChange={(v) => handleP1Change("loan", v)}
            />
            <FormField
              id="p1-mutuelle"
              label="Mutuelle individuelle"
              placeholder="45"
              suffix="€"
              value={p1Fields.mutuelle}
              onChange={(v) => handleP1Change("mutuelle", v)}
            />
            <FormField
              id="p1-other"
              label="Autre"
              placeholder="0"
              suffix="€"
              value={p1Fields.other}
              onChange={(v) => handleP1Change("other", v)}
            />
          </div>
        </div>

        {/* P2 column */}
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.06em] text-[#7A7A75] mb-3">
            {p2Name}
          </div>
          {isShared ? (
            <LockedField name={p2Name} />
          ) : (
            <div className="flex flex-col gap-3">
              <FormField
                id="p2-transport"
                label="Transport domicile-travail"
                placeholder="40"
                suffix="€"
                value={p2Fields.transport}
                onChange={(v) => handleP2Change("transport", v)}
              />
              <FormField
                id="p2-loan"
                label="Prêt personnel"
                placeholder="150"
                suffix="€"
                value={p2Fields.loan}
                onChange={(v) => handleP2Change("loan", v)}
              />
              <FormField
                id="p2-mutuelle"
                label="Mutuelle individuelle"
                placeholder="45"
                suffix="€"
                value={p2Fields.mutuelle}
                onChange={(v) => handleP2Change("mutuelle", v)}
              />
              <FormField
                id="p2-other"
                label="Autre"
                placeholder="0"
                suffix="€"
                value={p2Fields.other}
                onChange={(v) => handleP2Change("other", v)}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleRetour}
          className="text-sm font-medium px-5 py-2.5 bg-transparent text-[#7A7A75] border border-[#E8E8E4] rounded-md cursor-pointer"
        >
          Retour
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePasser}
            className="text-sm font-medium px-5 py-2.5 bg-transparent text-[#7A7A75] border border-[#E8E8E4] rounded-md cursor-pointer"
          >
            Passer
          </button>
          <button
            type="button"
            onClick={handleSuivant}
            className="text-sm font-semibold px-6 py-2.5 bg-neutral-900 text-white border-none rounded-md cursor-pointer flex items-center gap-1.5"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  );
}
