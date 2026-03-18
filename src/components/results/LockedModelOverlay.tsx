"use client";

import React from "react";

export interface LockedModelOverlayProps {
  tierRequired: 2 | 3 | 4;
}

export function LockedModelOverlay({ tierRequired }: LockedModelOverlayProps): React.JSX.Element {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
      <span className="text-xl mb-2" aria-hidden="true">
        🔒
      </span>
      <p className="text-xs text-text-dim leading-snug">
        Remplissez le palier {tierRequired} pour débloquer ce modèle
      </p>
    </div>
  );
}
