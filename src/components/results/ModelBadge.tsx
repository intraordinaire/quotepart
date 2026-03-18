"use client";

import React from "react";

export interface ModelBadgeProps {
  label: string;
  variant?: "default" | "best" | "locked" | "warning";
}

export function ModelBadge({ label, variant = "default" }: ModelBadgeProps): React.JSX.Element {
  const variantClasses: Record<NonNullable<ModelBadgeProps["variant"]>, string> = {
    default: "bg-surface text-text-dim",
    best: "bg-accent-dim text-accent",
    locked: "bg-surface text-text-muted opacity-50",
    warning: "bg-amber-dim text-amber",
  };

  return (
    <span
      className={[
        "inline-block px-1.5 py-0.5 rounded",
        "text-[10px] font-bold uppercase tracking-[0.08em]",
        variantClasses[variant],
      ].join(" ")}
    >
      {label}
    </span>
  );
}
