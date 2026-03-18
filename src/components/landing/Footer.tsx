import React from "react";

export default function Footer(): React.JSX.Element {
  return (
    <footer className="mx-auto flex max-w-[1200px] items-center justify-between border-t border-border px-6 py-6 md:px-10">
      <span className="font-display text-[15px] text-text">
        Quote<span className="text-accent">Part</span>
      </span>
      <span className="text-xs text-text-muted">
        Données INSEE · Aucune donnée stockée · Code source ouvert
      </span>
    </footer>
  );
}
