"use client";

import React, { useState } from "react";
import InseeModal from "./InseeModal";

export default function Footer(): React.JSX.Element {
  const [inseeOpen, setInseeOpen] = useState(false);

  return (
    <>
      <footer className="mx-auto flex max-w-[1200px] flex-col items-center gap-3 border-t border-border px-6 py-6 md:flex-row md:justify-between md:px-10">
        <span className="font-display text-[15px] text-text">
          Quote<span className="text-accent">Part</span>
        </span>
        <span className="flex flex-wrap justify-center gap-x-1.5 text-xs text-text-muted">
          <button
            onClick={() => setInseeOpen(true)}
            className="cursor-pointer underline underline-offset-2 transition-colors hover:text-text-dim"
          >
            Données INSEE
          </button>
          <span aria-hidden="true">·</span>
          <span>Aucune donnée stockée</span>
        </span>
      </footer>

      <InseeModal open={inseeOpen} onClose={() => setInseeOpen(false)} />
    </>
  );
}
