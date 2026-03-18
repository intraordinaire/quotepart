"use client";

import React from "react";

export interface SelectFieldProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export function SelectField({
  label,
  options,
  value,
  onChange,
}: SelectFieldProps): React.JSX.Element {
  const inputId = label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div>
      <label htmlFor={inputId} className="block text-xs font-medium text-text-dim mb-1">
        {label}
      </label>
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm py-[9px] px-3 border border-border rounded-md bg-surface outline-none focus:border-accent transition-colors cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}
