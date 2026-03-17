"use client";

import React from "react";
import { useSimulation } from "@/context/useSimulation";

// ─── Icons ─────────────────────────────────────────────────────────────────

function EditIcon(): React.JSX.Element {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 1-2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function UsersIcon(): React.JSX.Element {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ─── Component ─────────────────────────────────────────────────────────────

export function ModeChoice(): React.JSX.Element {
  const { dispatch } = useSimulation();

  function handleSelect(mode: "full" | "shared"): void {
    dispatch({ type: "SET_MODE", payload: mode });
    dispatch({ type: "SET_TIER", payload: 1 });
  }

  return (
    <div>
      <h2 className="font-[Instrument_Serif,serif] text-[28px] mb-2">
        Comment souhaitez-vous remplir&nbsp;?
      </h2>
      <p className="text-sm text-[#7A7A75] mb-9 leading-relaxed">
        Vous pourrez changer d&apos;avis à tout moment.
      </p>

      <div className="flex flex-col gap-3">
        {/* Full mode: one person fills for both */}
        <button
          type="button"
          onClick={(): void => handleSelect("full")}
          className="flex items-start gap-4 w-full p-6 bg-white border-[1.5px] border-[#E8E8E4] rounded-[10px] cursor-pointer text-left transition-colors duration-150 hover:border-[#1A1A1A]"
        >
          <span className="w-10 h-10 rounded-[10px] bg-[#FAFAF8] flex items-center justify-center shrink-0 text-[#1A1A1A]">
            <EditIcon />
          </span>
          <div>
            <div className="text-[15px] font-semibold mb-1 font-[Manrope,sans-serif]">
              Je remplis pour nous deux
            </div>
            <div className="text-[13px] text-[#7A7A75] leading-relaxed font-[Manrope,sans-serif]">
              Vous saisissez les données des deux personnes. Résultats immédiats. Vous pourrez
              ensuite partager un lien pour que votre partenaire ajuste ses données.
            </div>
          </div>
        </button>

        {/* Shared mode: each person fills their own data */}
        <button
          type="button"
          onClick={(): void => handleSelect("shared")}
          className="flex items-start gap-4 w-full p-6 bg-white border-[1.5px] border-[#E8E8E4] rounded-[10px] cursor-pointer text-left transition-colors duration-150 hover:border-[#D4593A]"
        >
          <span className="w-10 h-10 rounded-[10px] bg-[#FDF2EF] flex items-center justify-center shrink-0 text-[#D4593A]">
            <UsersIcon />
          </span>
          <div>
            <div className="text-[15px] font-semibold mb-1 font-[Manrope,sans-serif]">
              On remplit chacun·e nos données
            </div>
            <div className="text-[13px] text-[#7A7A75] leading-relaxed font-[Manrope,sans-serif]">
              Vous saisissez vos données et les charges communes. Votre partenaire recevra un lien
              pour compléter les siennes. Plus juste, notamment pour la charge domestique.
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#D4593A] uppercase tracking-[0.04em] font-[Manrope,sans-serif]">
              Recommandé pour la confrontation des perceptions
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
