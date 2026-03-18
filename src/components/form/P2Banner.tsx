"use client";

import React from "react";

interface P2BannerProps {
  p1Name: string;
}

export function P2Banner({ p1Name }: P2BannerProps): React.JSX.Element {
  const displayName = p1Name.trim() || "Personne 1";

  return (
    <div className="rounded-lg bg-accent-dim border border-accent/20 p-4 mb-6">
      <p className="text-sm text-text">
        <strong>{displayName}</strong> vous invite à compléter votre partie de la simulation. Les
        charges communes ont été pré-remplies — entrez maintenant vos données personnelles.
      </p>
    </div>
  );
}
