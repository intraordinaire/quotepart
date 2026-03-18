"use client";

import React, { useState } from "react";
import { useSimulation } from "@/context/useSimulation";
import { SelectField } from "@/components/ui/SelectField";
import { FormField } from "@/components/ui/FormField";
import { LockedField } from "@/components/form/LockedField";
import { displayName } from "@/lib/names";
import type { Person } from "@/domain/types";

const QUOTA_OPTIONS = ["Temps plein (100%)", "90%", "80%", "Mi-temps (50%)", "Autre"];

const REASON_OPTIONS = ["Choix du couple (enfants)", "Choix personnel", "Contrainte médicale"];

const DEFAULT_QUOTA = "Temps plein (100%)";

function parseQuota(option: string): number {
  if (option === "Temps plein (100%)") return 1.0;
  if (option === "Mi-temps (50%)") return 0.5;
  const match = option.match(/^(\d+)%$/);
  if (match) return Number(match[1]) / 100;
  return 1.0;
}

function parseReason(option: string): Person["partTimeReason"] {
  if (option === "Choix du couple (enfants)") return "couple-choice";
  if (option === "Choix personnel") return "personal-choice";
  if (option === "Contrainte médicale") return "medical";
  return null;
}

function isPartTime(quota: string): boolean {
  return quota !== DEFAULT_QUOTA;
}

export function Tier3WorkTime(): React.JSX.Element {
  const { state, dispatch } = useSimulation();
  const isShared = state.mode === "shared";
  const input = state.input;

  const p1Name = displayName(input.p1?.name ?? "", "Personne 1");
  const p2Name = displayName(input.p2?.name ?? "", "Personne 2");

  const [p1Quota, setP1Quota] = useState(DEFAULT_QUOTA);
  const [p1FullTimeIncome, setP1FullTimeIncome] = useState("");
  const [p1Reason, setP1Reason] = useState(REASON_OPTIONS[0]!);

  const [p2Quota, setP2Quota] = useState(DEFAULT_QUOTA);
  const [p2FullTimeIncome, setP2FullTimeIncome] = useState("");
  const [p2Reason, setP2Reason] = useState(REASON_OPTIONS[0]!);

  function handleSuivant(): void {
    dispatch({
      type: "UPDATE_INPUT",
      payload: {
        p1: {
          ...(input.p1 ?? {}),
          workQuota: parseQuota(p1Quota),
          fullTimeIncome: isPartTime(p1Quota)
            ? Number(p1FullTimeIncome) || 0
            : (input.p1?.income ?? 0),
          partTimeReason: isPartTime(p1Quota) ? parseReason(p1Reason) : null,
        } as Person,
        ...(!isShared && {
          p2: {
            ...(input.p2 ?? {}),
            workQuota: parseQuota(p2Quota),
            fullTimeIncome: isPartTime(p2Quota)
              ? Number(p2FullTimeIncome) || 0
              : (input.p2?.income ?? 0),
            partTimeReason: isPartTime(p2Quota) ? parseReason(p2Reason) : null,
          } as Person,
        }),
      },
    });
    dispatch({ type: "COMPLETE_TIER", payload: 3 });
    dispatch({ type: "SET_TIER", payload: 4 });
  }

  function handlePasser(): void {
    dispatch({ type: "SKIP_TIER", payload: 3 });
    dispatch({ type: "SET_TIER", payload: 4 });
  }

  function handleRetour(): void {
    dispatch({ type: "SET_TIER", payload: 2 });
  }

  return (
    <div className="animate-tier-in">
      <h2 className="font-display text-2xl mb-1">Temps de travail</h2>
      <p className="text-sm text-text-dim mb-1.5">
        Le temps partiel a un coût. Ce palier le rend visible. Débloque le modèle Ajusté temps.
      </p>
      <p className="text-xs italic text-text-dim mb-8">
        Optionnel, vous pouvez passer cette étape.
      </p>

      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* P1 column */}
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-3">
            {p1Name}
          </div>
          <div className="flex flex-col gap-3">
            <SelectField
              label="Quotité"
              options={QUOTA_OPTIONS}
              value={p1Quota}
              onChange={setP1Quota}
            />
            {isPartTime(p1Quota) && (
              <>
                <FormField
                  label="Salaire théorique temps plein"
                  placeholder="2 500"
                  suffix="€"
                  numeric
                  value={p1FullTimeIncome}
                  onChange={setP1FullTimeIncome}
                />
                <SelectField
                  label="Motif"
                  options={REASON_OPTIONS}
                  value={p1Reason}
                  onChange={setP1Reason}
                />
              </>
            )}
          </div>
        </div>

        {/* P2 column */}
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.06em] text-text-dim mb-3">
            {p2Name}
          </div>
          {isShared ? (
            <LockedField name={p2Name} />
          ) : (
            <div className="flex flex-col gap-3">
              <SelectField
                label="Quotité"
                options={QUOTA_OPTIONS}
                value={p2Quota}
                onChange={setP2Quota}
              />
              {isPartTime(p2Quota) && (
                <>
                  <FormField
                    label="Salaire théorique temps plein"
                    placeholder="2 500"
                    suffix="€"
                    numeric
                    value={p2FullTimeIncome}
                    onChange={setP2FullTimeIncome}
                  />
                  <SelectField
                    label="Motif"
                    options={REASON_OPTIONS}
                    value={p2Reason}
                    onChange={setP2Reason}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleRetour}
          className="text-sm font-medium px-5 py-2.5 bg-transparent text-text-dim border border-border rounded-md cursor-pointer"
        >
          Retour
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handlePasser}
            className="text-sm font-medium px-5 py-2.5 bg-transparent text-text-dim border border-border rounded-md cursor-pointer"
          >
            Passer
          </button>
          <button
            type="button"
            onClick={handleSuivant}
            className="text-sm font-semibold px-6 py-2.5 bg-accent text-white border-none rounded-md cursor-pointer flex items-center gap-1.5"
          >
            Suivant →
          </button>
        </div>
      </div>
    </div>
  );
}
