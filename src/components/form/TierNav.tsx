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
  const progressPercent = Math.max(activeTier, 0) * 25;

  return (
    <aside className="w-60 shrink-0 bg-white border-r border-[#E8E8E4] py-6">
      {/* Progress section */}
      <div className="px-5 mb-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#7A7A75] mb-1">
          Progression
        </div>
        <div className="h-[3px] bg-[#E8E8E4] rounded-sm overflow-hidden">
          <div
            data-testid="tier-progress-bar"
            className="h-full bg-[#D4593A] rounded-sm transition-[width] duration-300 ease-in-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Tier buttons */}
      {TIERS.map((tier) => {
        const isActive = activeTier === tier.n;
        const isCompleted = completedTiers.has(tier.n);
        const isPastOrActive = tier.n <= activeTier;

        return (
          <button
            key={tier.n}
            data-active={isActive ? "true" : "false"}
            onClick={(): void => {
              if (!isLocked) {
                dispatch({ type: "SET_TIER", payload: tier.n });
              }
            }}
            className={[
              "flex items-start gap-3 w-full px-5 py-3 text-left transition-all duration-150",
              isActive
                ? "bg-[#FAFAF8] border-l-2 border-l-[#D4593A]"
                : "bg-transparent border-l-2 border-l-transparent",
              isLocked ? "opacity-50 cursor-default" : "cursor-pointer",
            ].join(" ")}
          >
            {/* Circle indicator */}
            <span
              className={[
                "w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-[1px]",
                isPastOrActive
                  ? "bg-[#1A1A1A] text-white border-0"
                  : "bg-[#FAFAF8] text-[#7A7A75] border border-[#E8E8E4]",
              ].join(" ")}
            >
              {isCompleted && activeTier > tier.n ? "✓" : tier.n}
            </span>

            {/* Label and subtitle */}
            <div>
              <div className="text-[13px] font-semibold text-[#1A1A1A] font-[Manrope,sans-serif]">
                {tier.label}
              </div>
              <div className="text-[11px] text-[#7A7A75] mt-0.5 font-[Manrope,sans-serif]">
                Débloque {tier.unlocks}
              </div>
            </div>
          </button>
        );
      })}
    </aside>
  );
}
