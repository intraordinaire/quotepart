"use client";

import React from "react";

export interface PillToggleProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function PillToggle({ label, active, onClick }: PillToggleProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "text-xs font-medium px-[14px] py-[5px] rounded-full cursor-pointer transition-colors",
        active
          ? "bg-accent text-white border-transparent"
          : "bg-surface text-text-dim border border-border",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
