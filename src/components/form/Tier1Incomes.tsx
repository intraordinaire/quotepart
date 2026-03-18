"use client";

import React, { useState } from "react";
import { useSimulation } from "@/context/useSimulation";
import { FormField } from "@/components/ui/FormField";
import { PillToggle } from "@/components/ui/PillToggle";
import { LockedField } from "@/components/form/LockedField";
import { randomPlaceholderPair } from "@/lib/names";
import type { Person } from "@/domain/types";

export function Tier1Incomes(): React.JSX.Element {
  const { state, dispatch } = useSimulation();
  const [placeholders] = useState<[string, string]>(() => randomPlaceholderPair());
  const [chargesMode, setChargesMode] = useState<"global" | "detail">("global");
  const [attempted, setAttempted] = useState(false);

  const isShared = state.mode === "shared";
  const input = state.input;
  const p1 = input.p1;
  const p2 = input.p2;

  function updateP1(partial: Partial<Person>): void {
    dispatch({
      type: "UPDATE_INPUT",
      payload: { p1: { ...p1, ...partial } as Person },
    });
  }

  function updateP2(partial: Partial<Person>): void {
    dispatch({
      type: "UPDATE_INPUT",
      payload: { p2: { ...p2, ...partial } as Person },
    });
  }

  const p1IncomeValid = (p1?.income ?? 0) > 0;
  const p2IncomeValid = isShared || (p2?.income ?? 0) > 0;

  function handleSuivant(): void {
    setAttempted(true);
    if (!p1IncomeValid || !p2IncomeValid) return;
    dispatch({ type: "COMPLETE_TIER", payload: 1 });
    dispatch({ type: "SET_TIER", payload: 2 });
  }

  function handleRetour(): void {
    dispatch({ type: "SET_TIER", payload: 0 });
  }

  const p2DisplayName = p2?.name?.trim() || "Personne 2";

  return (
    <div className="animate-tier-in">
      <h2 className="font-display text-2xl mb-1">Revenus & charges communes</h2>
      <p className="text-sm text-text-dim mb-8">
        L&apos;essentiel pour démarrer. Débloque les modèles 50/50 et Prorata.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-7">
        <FormField
          id="p1-name"
          label="Prénom personne 1"
          placeholder={placeholders[0]}
          value={p1?.name ?? ""}
          onChange={(v) => updateP1({ name: v })}
        />
        <FormField
          id="p2-name"
          label="Prénom personne 2"
          placeholder={placeholders[1]}
          value={p2?.name ?? ""}
          onChange={(v) => updateP2({ name: v })}
        />
        <div>
          <FormField
            id="p1-income"
            label="Revenu net mensuel P1"
            placeholder="3 200"
            suffix="€"
            numeric
            value={p1?.income != null ? String(p1.income) : ""}
            onChange={(v) => updateP1({ income: Number(v) || 0 })}
          />
          {attempted && !p1IncomeValid && (
            <p className="text-accent text-xs mt-1">Le revenu de la personne 1 est requis.</p>
          )}
        </div>
        {isShared ? (
          <div>
            <label className="block text-xs font-medium text-text-dim mb-1">
              Revenu net mensuel P2
            </label>
            <LockedField name={p2DisplayName} />
          </div>
        ) : (
          <div>
            <FormField
              id="p2-income"
              label="Revenu net mensuel P2"
              placeholder="2 100"
              suffix="€"
              numeric
              value={p2?.income != null ? String(p2.income) : ""}
              onChange={(v) => updateP2({ income: Number(v) || 0 })}
            />
            {attempted && !p2IncomeValid && (
              <p className="text-accent text-xs mt-1">Le revenu de la personne 2 est requis.</p>
            )}
          </div>
        )}
      </div>

      <div className="mb-5">
        <div className="text-sm font-semibold mb-3">Charges communes mensuelles</div>
        <div className="flex gap-2 mb-4 flex-wrap">
          <PillToggle
            label="Montant global"
            active={chargesMode === "global"}
            onClick={() => setChargesMode("global")}
          />
          <PillToggle
            label="Détail par catégorie"
            active={chargesMode === "detail"}
            onClick={() => setChargesMode("detail")}
          />
        </div>
        <FormField
          placeholder="3 000"
          suffix="€/mois"
          numeric
          value={input.commonCharges != null ? String(input.commonCharges) : ""}
          onChange={(v) =>
            dispatch({ type: "UPDATE_INPUT", payload: { commonCharges: Number(v) || 0 } })
          }
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-text-dim cursor-pointer mb-8">
        <input
          type="checkbox"
          checked={input.hasChildren ?? false}
          onChange={(e) =>
            dispatch({ type: "UPDATE_INPUT", payload: { hasChildren: e.target.checked } })
          }
          className="accent-accent"
        />
        Nous avons des enfants
      </label>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleRetour}
          className="text-sm font-medium px-5 py-2.5 bg-transparent text-text-dim border border-border rounded-md cursor-pointer"
        >
          Retour
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
  );
}
