"use client";

import React from "react";
import Link from "next/link";
import { useSimulation } from "@/context/useSimulation";
import type { TabId } from "@/context/SimulationContext";
import { ModeChoice } from "@/components/form/ModeChoice";
import { Tier1Incomes } from "@/components/form/Tier1Incomes";
import { Tier2PersonalCharges } from "@/components/form/Tier2PersonalCharges";
import { Tier3WorkTime } from "@/components/form/Tier3WorkTime";
import { Tier4Domestic } from "@/components/form/Tier4Domestic";
import { TierNav } from "@/components/form/TierNav";
import { ResultsShell } from "@/components/results/ResultsShell";
import { WhatIfShell } from "@/components/whatif/WhatIfShell";
import { toFullInput } from "@/lib/inputDefaults";

// ─── Icons ─────────────────────────────────────────────────────────────────

function EditIcon(): React.JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ResultsIcon(): React.JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}

function WhatIfIcon(): React.JSX.Element {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
      <polyline points="21 7 18 4 15 7" />
    </svg>
  );
}

// ─── Mode badge ─────────────────────────────────────────────────────────────

function ModeBadge({ mode }: { mode: "full" | "shared" | null }): React.JSX.Element | null {
  if (!mode) return null;

  if (mode === "full") {
    return (
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-bg text-text border border-border">
        On remplit ensemble
      </span>
    );
  }

  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent-dim text-accent">
      Chacun·e ses données
    </span>
  );
}

// ─── Tier content ──────────────────────────────────────────────────────────

function TierContent({ activeTier }: { activeTier: 0 | 1 | 2 | 3 | 4 }): React.JSX.Element {
  switch (activeTier) {
    case 0:
      return <ModeChoice />;
    case 1:
      return <Tier1Incomes />;
    case 2:
      return <Tier2PersonalCharges />;
    case 3:
      return <Tier3WorkTime />;
    case 4:
      return <Tier4Domestic />;
  }
}

// ─── Et si... tab content ─────────────────────────────────────────────────

function EtSiContent(): React.JSX.Element {
  const { state } = useSimulation();
  const rawInput = state.input;

  if (!state.completedTiers.has(1) || !rawInput.p1 || !rawInput.p2) {
    return (
      <div className="text-text-dim text-sm py-8 text-center">
        Complétez le palier 1 pour explorer des scénarios.
      </div>
    );
  }

  const input = toFullInput(rawInput);

  return <WhatIfShell input={input} />;
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function SimulatePage(): React.JSX.Element {
  const { state, dispatch } = useSimulation();

  const activeTab: TabId = state.activeTab;
  const tier1Complete = state.completedTiers.has(1);

  function setActiveTab(tab: TabId): void {
    dispatch({ type: "SET_TAB", payload: tab });
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg">
      {/* ── Top header ─────────────────────────────────────────────────────── */}
      <header className="min-h-14 bg-surface border-b border-border flex flex-wrap items-center px-4 md:px-6 gap-2 md:gap-4 py-2 shrink-0">
        <Link
          href="/"
          className="font-display text-xl text-text hover:opacity-80 transition-opacity"
        >
          Quote<span className="text-accent">Part</span>
        </Link>

        <span className="text-border select-none hidden md:inline">|</span>

        <span className="text-sm text-text-dim hidden md:inline">Nouvelle simulation</span>

        {state.mode && (
          <>
            <span className="text-border select-none hidden md:inline">|</span>
            <ModeBadge mode={state.mode} />
          </>
        )}
      </header>

      {/* ── Tab navigation ─────────────────────────────────────────────────── */}
      <nav
        role="tablist"
        className="bg-surface border-b border-border flex px-2 md:px-6 shrink-0 overflow-x-auto"
      >
        <button
          role="tab"
          type="button"
          aria-selected={activeTab === "saisie"}
          aria-controls="panel-saisie"
          onClick={() => setActiveTab("saisie")}
          className={[
            "flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "saisie"
              ? "border-accent text-text"
              : "border-transparent text-text-dim hover:text-text",
          ].join(" ")}
        >
          <EditIcon />
          Saisie
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activeTab === "resultats"}
          aria-controls="panel-resultats"
          aria-disabled={!tier1Complete}
          onClick={() => {
            if (tier1Complete) setActiveTab("resultats");
          }}
          className={[
            "flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "resultats"
              ? "border-accent text-text"
              : "border-transparent text-text-dim hover:text-text",
            !tier1Complete ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
          ]
            .join(" ")
            .trim()}
        >
          <ResultsIcon />
          Résultats
        </button>

        <button
          role="tab"
          type="button"
          aria-selected={activeTab === "etsi"}
          aria-controls="panel-etsi"
          aria-disabled={!tier1Complete}
          onClick={() => {
            if (tier1Complete) setActiveTab("etsi");
          }}
          className={[
            "flex items-center gap-1.5 px-3 md:px-4 py-3 text-xs md:text-sm font-medium border-b-2 transition-colors whitespace-nowrap",
            activeTab === "etsi"
              ? "border-accent text-text"
              : "border-transparent text-text-dim hover:text-text",
            !tier1Complete ? "opacity-50 cursor-not-allowed pointer-events-none" : "",
          ]
            .join(" ")
            .trim()}
        >
          <WhatIfIcon />
          Et si...
        </button>
      </nav>

      {/* ── Content area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar: hidden on mobile, visible on md+ */}
        {state.activeTier > 0 && (
          <div className="hidden md:block">
            <TierNav />
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8">
          <div role="tabpanel" id="panel-saisie" hidden={activeTab !== "saisie"}>
            <div className="max-w-2xl mx-auto">
              <TierContent activeTier={state.activeTier} />
            </div>
          </div>
          <div role="tabpanel" id="panel-resultats" hidden={activeTab !== "resultats"}>
            <div className="max-w-2xl mx-auto">
              <ResultsShell />
            </div>
          </div>
          <div role="tabpanel" id="panel-etsi" hidden={activeTab !== "etsi"}>
            <div className="max-w-5xl mx-auto">
              <EtSiContent />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
