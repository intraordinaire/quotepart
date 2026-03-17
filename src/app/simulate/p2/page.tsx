"use client";

import React, { Suspense, useEffect, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useSimulation } from "@/context/useSimulation";
import { decodeP2Payload } from "@/lib/shareLink";
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
    <div className="flex flex-col min-h-screen bg-[#FAFAF8] items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="font-[Instrument_Serif,serif] text-2xl text-[#1A1A1A]">Lien invalide</h1>
        <p className="text-text-secondary">
          Ce lien de partage est invalide ou a expiré. Demandez à votre partenaire de vous envoyer
          un nouveau lien.
        </p>
        <Link
          href="/simulate"
          className="inline-block rounded bg-[#D4593A] px-4 py-2 text-sm font-medium text-white hover:bg-[#c44f33]"
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
  const payload = useMemo(() => (dataParam ? decodeP2Payload(dataParam) : null), [dataParam]);

  useEffect(() => {
    if (!payload) return;

    dispatch({ type: "SET_MODE", payload: "shared" });
    dispatch({
      type: "UPDATE_INPUT",
      payload: {
        commonCharges: payload.commonCharges,
        hasChildren: payload.hasChildren,
        hourlyRate: payload.hourlyRate,
      },
    });
    dispatch({ type: "SET_TIER", payload: 1 });
  }, [payload, dispatch]);

  if (!payload) return <InvalidLink />;

  const tier1Complete = state.completedTiers.has(1);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF8]">
      <header className="h-14 bg-white border-b border-[#E8E8E4] flex items-center px-6 gap-4 shrink-0">
        <Link
          href="/"
          className="font-[Instrument_Serif,serif] text-xl text-[#1A1A1A] hover:opacity-80 transition-opacity"
        >
          Quote<span className="text-[#D4593A]">Part</span>
        </Link>
        <span className="text-[#E8E8E4] select-none">|</span>
        <span className="text-sm text-text-secondary">Mode partagé — P2</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {state.activeTier > 0 && <TierNav />}

        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <P2Banner p1Name={payload.p1Name} />

            {tier1Complete ? <ResultsShell /> : <TierContent activeTier={state.activeTier} />}
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
