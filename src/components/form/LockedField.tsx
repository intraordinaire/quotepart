"use client";

import React from "react";

export interface LockedFieldProps {
  name: string;
}

function UsersIcon(): React.JSX.Element {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function LockedField({ name }: LockedFieldProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1.5 px-3 py-[9px] border border-dashed border-[#E8E8E4] rounded-md bg-neutral-50 text-xs italic text-[#7A7A75]">
      <UsersIcon />
      <span>{name} complétera</span>
    </div>
  );
}
