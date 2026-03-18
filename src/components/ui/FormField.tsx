"use client";

import React from "react";

export interface FormFieldProps {
  id?: string;
  label?: string;
  placeholder?: string;
  suffix?: string;
  value: string;
  onChange: (v: string) => void;
  numeric?: boolean;
}

export function FormField({
  id,
  label,
  placeholder,
  suffix,
  value,
  onChange,
  numeric = false,
}: FormFieldProps): React.JSX.Element {
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-text-dim mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type="text"
          inputMode={numeric ? "numeric" : undefined}
          pattern={numeric ? "[0-9 ]*" : undefined}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "w-full text-sm py-3 px-3 border border-border rounded-md bg-surface",
            "outline-none focus:border-accent transition-colors",
            suffix ? "pr-10" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-dim pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}
