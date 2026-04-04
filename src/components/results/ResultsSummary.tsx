"use client";

import React from "react";
import { formatCurrency } from "@/lib/format";

export interface ResultsSummaryProps {
  p1Name: string;
  p2Name: string;
  p1Income: number;
  p2Income: number;
  p1PersonalCharges: number;
  p2PersonalCharges: number;
  commonCharges: number;
}

export function ResultsSummary({
  p1Name,
  p2Name,
  p1Income,
  p2Income,
  p1PersonalCharges,
  p2PersonalCharges,
  commonCharges,
}: ResultsSummaryProps): React.JSX.Element {
  return (
    <div className="bg-surface border border-border rounded-xl p-5 md:px-7 md:py-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-muted mb-4">
        Vos données
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
        <div>
          <p className="text-sm font-medium text-text">{p1Name}</p>
          <p className="text-[13px] font-mono text-text-dim">Revenu : {formatCurrency(p1Income)}</p>
          {p1PersonalCharges > 0 && (
            <p className="text-[13px] font-mono text-text-dim">
              Ch. perso : {formatCurrency(p1PersonalCharges)}
            </p>
          )}
        </div>
        <div className="mt-3 md:mt-0">
          <p className="text-sm font-medium text-text">{p2Name}</p>
          <p className="text-[13px] font-mono text-text-dim">Revenu : {formatCurrency(p2Income)}</p>
          {p2PersonalCharges > 0 && (
            <p className="text-[13px] font-mono text-text-dim">
              Ch. perso : {formatCurrency(p2PersonalCharges)}
            </p>
          )}
        </div>
      </div>
      <div className="h-px bg-border my-3" />
      <p className="text-sm text-text-dim text-center">
        Charges communes : {formatCurrency(commonCharges)}
      </p>
    </div>
  );
}
