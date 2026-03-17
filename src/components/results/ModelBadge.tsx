"use client";

import React from "react";

export interface ModelBadgeProps {
  label: string;
  variant?: "default" | "best" | "locked";
}

export function ModelBadge({ label, variant = "default" }: ModelBadgeProps): React.JSX.Element {
  const variantClasses: Record<NonNullable<ModelBadgeProps["variant"]>, string> = {
    default: "bg-surface text-text-secondary",
    best: "bg-accent-light text-accent",
    locked: "bg-surface text-text-tertiary opacity-50",
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
