"use client";

import React from "react";

export interface SwitchProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
}

export function Switch({ checked, onChange, label }: SwitchProps): React.JSX.Element {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex items-center gap-3 min-h-12 cursor-pointer group"
    >
      <span
        className={[
          "relative inline-block w-9 h-5 rounded-full transition-colors duration-200",
          checked ? "bg-accent" : "bg-border border border-border",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-[2px] left-[2px] w-4 h-4 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)]",
            "transition-transform duration-200 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]",
            "motion-reduce:transition-none",
            checked ? "translate-x-4" : "translate-x-0",
          ].join(" ")}
        />
      </span>
      <span
        className={[
          "text-sm transition-colors duration-200",
          checked ? "text-text" : "text-text-dim",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}
