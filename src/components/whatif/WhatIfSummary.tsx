"use client";

import React from "react";

interface WhatIfSummaryProps {
  p1Name: string;
  p2Name: string;
  beforeGap: number;
  afterGap: number;
}

function formatNumber(n: number): string {
  return n.toLocaleString("fr-FR");
}

export function WhatIfSummary({
  p1Name,
  p2Name,
  beforeGap,
  afterGap,
}: WhatIfSummaryProps): React.ReactElement {
  const diff = afterGap - beforeGap;
  const annualDiff = Math.abs(diff) * 12;
  const isImproved = diff < 0;

  if (diff === 0) {
    return (
      <div className="rounded-lg border border-border bg-surface p-4">
        <p className="text-sm text-text-dim">
          Aucun changement sur l&apos;écart de revenu disponible.
        </p>
      </div>
    );
  }

  const boxClasses = isImproved
    ? "rounded-lg border border-green bg-green-dim p-4"
    : "rounded-lg border border-amber bg-amber-dim p-4";

  const direction = isImproved ? "en moins" : "en plus";

  return (
    <div className={boxClasses}>
      <p className="text-sm text-text">
        L&apos;écart de revenu disponible entre {p1Name} et {p2Name} passe de{" "}
        {formatNumber(beforeGap)} € à {formatNumber(afterGap)} € par mois
      </p>
      <p className="mt-1 text-xs text-text-dim">
        soit {formatNumber(annualDiff)} € d&apos;écart {direction} par an
      </p>
    </div>
  );
}
