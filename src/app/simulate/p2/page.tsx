"use client";

import React, { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSimulation } from "@/context/useSimulation";
import { decodeState } from "@/lib/urlState";
import { P2Banner } from "@/components/form/P2Banner";
import { Tier1Incomes } from "@/components/form/Tier1Incomes";
import { Tier2PersonalCharges } from "@/components/form/Tier2PersonalCharges";
import { Tier3WorkTime } from "@/components/form/Tier3WorkTime";
import { Tier4Domestic } from "@/components/form/Tier4Domestic";
import { TierNav } from "@/components/form/TierNav";
import { ResultsShell } from "@/components/results/ResultsShell";

// ─── Tier content ────────────────────────────────────────────────────────────

function TierContent({ activeTier }: { activeTier: 0 | 1 | 2 | 3 | 4 }): React.JSX.Element | null {
  switch (activeTier) {
    case 1:
      return <Tier1Incomes />;
    case 2:
      return <Tier2PersonalCharges />;
    case 3:
      return <Tier3WorkTime />;
    case 4:
      return <Tier4Domestic />;
    default:
      return null;
  }
}

// ─── Invalid link view ───────────────────────────────────────────────────────

function InvalidLink(): React.JSX.Element {
  return (
    <div className="flex flex-col min-h-screen bg-bg items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-display text-2xl">Lien invalide</h1>
        <p className="text-text-dim">
          Ce lien de partage est invalide ou a expiré. Demandez à votre partenaire de vous envoyer
          un nouveau lien.
        </p>
        <Link
          href="/simulate"
          className="inline-block rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          Démarrer une nouvelle simulation
        </Link>
      </div>
    </div>
  );
}

// ─── Inner content (uses useSearchParams) ────────────────────────────────────

function P2PageContent(): React.JSX.Element {
  const searchParams = useSearchParams();
  const { state, dispatch } = useSimulation();

  const dataParam = searchParams.get("data");
  const decodedInput = useMemo(() => (dataParam ? decodeState(dataParam) : null), [dataParam]);

  useEffect(() => {
    if (!decodedInput) return;

    dispatch({ type: "SET_MODE", payload: "shared" });
    dispatch({ type: "SET_ROLE", payload: "p2" });
    dispatch({ type: "UPDATE_INPUT", payload: decodedInput });
    dispatch({ type: "SET_TIER", payload: 1 });
  }, [decodedInput, dispatch]);

  if (!decodedInput) return <InvalidLink />;

  const p1Name = decodedInput.p1?.name?.trim() || "Personne 1";
  const allTiersDone =
    state.completedTiers.has(1) &&
    (state.completedTiers.has(2) || state.skippedTiers.has(2)) &&
    (state.completedTiers.has(3) || state.skippedTiers.has(3)) &&
    (state.completedTiers.has(4) || state.skippedTiers.has(4));

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <header className="h-14 bg-surface border-b border-border flex items-center px-6 gap-4 shrink-0">
        <Link href="/" className="font-display text-xl hover:opacity-80 transition-opacity">
          Quote<span className="text-accent">Part</span>
        </Link>
        <span className="text-border select-none">|</span>
        <span className="text-sm text-text-dim">Mode partagé — P2</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {state.activeTier > 0 && <TierNav />}

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <P2Banner p1Name={p1Name} />

            {allTiersDone ? <ResultsShell /> : <TierContent activeTier={state.activeTier} />}
          </div>
        </main>
      </div>
    </div>
  );
}

// ─── Page (wraps with Suspense as required by Next.js) ───────────────────────

export default function P2Page(): React.JSX.Element {
  return (
    <Suspense
      fallback={<div className="flex min-h-screen items-center justify-center">Chargement…</div>}
    >
      <P2PageContent />
    </Suspense>
  );
}
