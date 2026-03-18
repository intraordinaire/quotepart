"use client";

import React from "react";

export interface DeltaRowProps {
  label: string;
  before: number;
  after: number;
  format?: (v: number) => string;
  changed?: boolean;
  reverseColors?: boolean;
}

function defaultFormat(v: number): string {
  return `${Math.round(v)} €`;
}

export function DeltaRow({
  label,
  before,
  after,
  format = defaultFormat,
  changed = false,
  reverseColors = false,
}: DeltaRowProps): React.JSX.Element {
  const diff = after - before;
  const hasDelta = diff !== 0;

  const isIncrease = diff > 0;
  // By default: decrease = green (improvement), increase = red (worse)
  // reverseColors flips this (for equity score: higher = better)
  const isPositive = reverseColors ? isIncrease : !isIncrease;

  const arrow = isIncrease ? "↑" : "↓";
  const sign = isIncrease ? "+" : "-";
  const colorClass = isPositive ? "text-green" : "text-red";

  return (
    <div
      className={[
        "flex items-center justify-between gap-2 px-3 py-2 rounded",
        changed ? "bg-accent-dim" : "",
      ].join(" ")}
    >
      <span className="text-sm text-text-dim">{label}</span>

      <div className="flex items-center gap-3 text-sm">
        <span className="text-text-muted">{format(before)}</span>
        <span className="text-text-muted">→</span>
        <span className="text-text">{format(after)}</span>

        {hasDelta && (
          <span data-testid="delta-indicator" className={colorClass}>
            {arrow}{" "}
            <span>
              {sign} {format(Math.abs(diff))}
            </span>
          </span>
        )}
      </div>
    </div>
  );
}
