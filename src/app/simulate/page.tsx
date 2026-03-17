"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSimulation } from "@/context/useSimulation";
import { ModeChoice } from "@/components/form/ModeChoice";
import { Tier1Incomes } from "@/components/form/Tier1Incomes";
import { Tier2PersonalCharges } from "@/components/form/Tier2PersonalCharges";
import { Tier3WorkTime } from "@/components/form/Tier3WorkTime";
import { Tier4Domestic } from "@/components/form/Tier4Domestic";
import { TierNav } from "@/components/form/TierNav";
import { ResultsShell } from "@/components/results/ResultsShell";

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
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAFAF8] text-[#1A1A1A] border border-[#E8E8E4]">
        Je remplis pour nous deux
      </span>
    );
  }

  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FDF2EF] text-[#D4593A]">
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

// ─── Page ──────────────────────────────────────────────────────────────────

type TabId = "saisie" | "resultats" | "etsi";

export default function SimulatePage(): React.JSX.Element {
  const { state } = useSimulation();
  const [activeTab, setActiveTab] = useState<TabId>("saisie");

  const tier1Complete = state.completedTiers.has(1);

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAF8]">
      {/* ── Top header ─────────────────────────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-[#E8E8E4] flex items-center px-6 gap-4 shrink-0">
        <Link
          href="/"
          className="font-[Instrument_Serif,serif] text-xl text-[#1A1A1A] hover:opacity-80 transition-opacity"
        >
          Quote<span className="text-[#D4593A]">Part</span>
        </Link>

        <span className="text-[#E8E8E4] select-none">|</span>

        <span className="text-sm text-text-secondary">Nouvelle simulation</span>

        {state.mode && (
          <>
            <span className="text-[#E8E8E4] select-none">|</span>
            <ModeBadge mode={state.mode} />
          </>
        )}
      </header>

      {/* ── Tab navigation ─────────────────────────────────────────────────── */}
      <nav role="tablist" className="bg-white border-b border-[#E8E8E4] flex px-6 shrink-0">
        <button
          role="tab"
          type="button"
          aria-selected={activeTab === "saisie"}
          aria-controls="panel-saisie"
          onClick={() => setActiveTab("saisie")}
          className={[
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "saisie"
              ? "border-[#D4593A] text-[#1A1A1A]"
              : "border-transparent text-text-secondary hover:text-[#1A1A1A]",
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
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "resultats"
              ? "border-[#D4593A] text-[#1A1A1A]"
              : "border-transparent text-text-secondary hover:text-[#1A1A1A]",
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
            "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
            activeTab === "etsi"
              ? "border-[#D4593A] text-[#1A1A1A]"
              : "border-transparent text-text-secondary hover:text-[#1A1A1A]",
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
        {/* Sidebar: only visible when a mode has been selected (tier > 0) */}
        {state.activeTier > 0 && <TierNav />}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <div role="tabpanel" id="panel-saisie" hidden={activeTab !== "saisie"}>
              <TierContent activeTier={state.activeTier} />
            </div>
            <div role="tabpanel" id="panel-resultats" hidden={activeTab !== "resultats"}>
              <ResultsShell />
            </div>
            <div role="tabpanel" id="panel-etsi" hidden={activeTab !== "etsi"}>
              <div className="text-text-secondary">Et si... — coming soon</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
