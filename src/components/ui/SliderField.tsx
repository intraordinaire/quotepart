"use client";

import React from "react";

export interface SliderFieldProps {
  label: string;
  leftName: string;
  rightName: string;
  value: number; // 0-100, P1 share
  hours?: string;
  onChange: (v: number) => void;
}

export function SliderField({
  label,
  leftName,
  rightName,
  value,
  hours,
  onChange,
}: SliderFieldProps): React.JSX.Element {
  const p2Share = 100 - value;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[13px] font-medium">{label}</span>
        {hours && <span className="text-[11px] text-text-muted">{hours}</span>}
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-[11px] font-semibold text-text-dim w-[55px] text-right">
          {leftName}
        </span>

        <div className="flex-1 relative">
          <input
            type="range"
            min="0"
            max="100"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={label}
            className="w-full h-1 appearance-none rounded-sm outline-none cursor-pointer touch-manipulation py-3"
            style={{
              background: `linear-gradient(to right, var(--color-text) 0%, var(--color-text) ${value}%, var(--color-accent) ${value}%, var(--color-accent) 100%)`,
            }}
          />
        </div>

        <span className="text-[11px] font-semibold text-accent w-[55px]">{rightName}</span>
      </div>

      <div className="text-center text-[11px] text-text-muted mt-0.5">
        {value}% / {p2Share}%
      </div>
    </div>
  );
}
