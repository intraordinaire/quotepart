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
      <label htmlFor={inputId} className="block text-xs font-medium text-[#7A7A75] mb-1">
        {label}
      </label>
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm py-[9px] px-3 border border-[#E8E8E4] rounded-md bg-white outline-none focus:border-[#D4593A] transition-colors cursor-pointer"
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
