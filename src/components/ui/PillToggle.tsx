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
          ? "bg-neutral-900 text-white border-transparent"
          : "bg-neutral-100 text-text-secondary border border-[#E8E8E4]",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
