"use client";

import React from "react";
import { useSimulation } from "@/context/useSimulation";

// ─── Tier data ─────────────────────────────────────────────────────────────

interface TierItem {
  n: 1 | 2 | 3 | 4;
  label: string;
  unlocks: string;
}

const TIERS: TierItem[] = [
  { n: 1, label: "Revenus & charges", unlocks: "Modèles 1-2" },
  { n: 2, label: "Charges perso", unlocks: "Modèle 3" },
  { n: 3, label: "Temps de travail", unlocks: "Modèle 4" },
  { n: 4, label: "Charge domestique", unlocks: "Modèle 5" },
];

// ─── Component ─────────────────────────────────────────────────────────────

export function TierNav(): React.JSX.Element {
  const { state, dispatch } = useSimulation();
  const { activeTier, completedTiers, mode } = state;

  const isLocked = mode === null;
  const completedCount = completedTiers.size;
  const progressPercent = Math.max(activeTier, 0) * 25;

  return (
    <nav
      aria-label="Étapes de saisie"
      className="w-60 shrink-0 bg-surface border-r border-border py-6"
    >
      {/* Progress section */}
      <div className="px-5 mb-5">
        <div className="font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-text-dim mb-2">
          Progression
        </div>
        <div
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={4}
          aria-label={`${completedCount} étape${completedCount > 1 ? "s" : ""} sur 4 complétée${completedCount > 1 ? "s" : ""}`}
          className="h-[3px] bg-border rounded-sm overflow-hidden"
        >
          <div
            data-testid="tier-progress-bar"
            className="h-full bg-accent rounded-sm transition-[width] duration-300 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tier buttons */}
      <ol className="list-none m-0 p-0">
        {TIERS.map((tier) => {
          const isActive = activeTier === tier.n;
          const isCompleted = completedTiers.has(tier.n);
          const isPastOrActive = tier.n <= activeTier;
          const showCheck = isCompleted && activeTier > tier.n;

          return (
            <li key={tier.n}>
              <button
                data-active={isActive ? "true" : "false"}
                aria-current={isActive ? "step" : undefined}
                aria-disabled={isLocked}
                onClick={(): void => {
                  if (!isLocked) {
                    dispatch({ type: "SET_TIER", payload: tier.n });
                    dispatch({ type: "SET_TAB", payload: "saisie" });
                  }
                }}
                className={[
                  "flex items-center gap-3 w-full px-5 min-h-12 py-3 text-left transition-colors duration-150",
                  "focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-[-2px]",
                  isActive
                    ? "bg-bg border-l-2 border-l-accent"
                    : "bg-transparent border-l-2 border-l-transparent",
                  isLocked ? "opacity-50 cursor-default" : "cursor-pointer hover:bg-surface-hover",
                ].join(" ")}
              >
                {/* Circle indicator */}
                <span
                  aria-hidden="true"
                  className={[
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    isPastOrActive
                      ? "bg-accent text-white"
                      : "bg-bg text-text-dim border border-border",
                  ].join(" ")}
                >
                  {showCheck ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    tier.n
                  )}
                </span>

                {/* Label and subtitle */}
                <div>
                  <div className="text-sm font-semibold text-text leading-tight">
                    {tier.label}
                    {showCheck && <span className="sr-only"> (complétée)</span>}
                  </div>
                  <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-text-dim mt-0.5">
                    Débloque {tier.unlocks}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
