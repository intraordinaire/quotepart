"use client";

import React, { useState } from "react";
import InseeModal from "./InseeModal";

export default function Footer(): React.JSX.Element {
  const [inseeOpen, setInseeOpen] = useState(false);

  return (
    <>
      <footer className="mx-auto flex max-w-[1200px] items-center justify-between border-t border-border px-6 py-6 md:px-10">
        <span className="font-display text-[15px] text-text">
          Quote<span className="text-accent">Part</span>
        </span>
        <span className="text-xs text-text-muted">
          <button
            onClick={() => setInseeOpen(true)}
            className="cursor-pointer underline underline-offset-2 transition-colors hover:text-text-dim"
          >
            Données INSEE
          </button>
          {" · Aucune donnée stockée · "}
          <a
            href="https://github.com/intraordinaire/quotepart"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer underline underline-offset-2 transition-colors hover:text-text-dim"
          >
            Code source ouvert
          </a>
        </span>
      </footer>

      <InseeModal open={inseeOpen} onClose={() => setInseeOpen(false)} />
    </>
  );
}
