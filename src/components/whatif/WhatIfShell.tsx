"use client";

import React from "react";
import { WhatIfProvider, useWhatIf } from "@/context/WhatIfContext";
import { WhatIfPanel } from "./WhatIfPanel";
import { SnapshotPanel } from "./SnapshotPanel";
import { WhatIfSummary } from "./WhatIfSummary";
import { displayName } from "@/lib/names";
import { getFullLink } from "@/lib/shareLink";
import type { SimulationInput } from "@/domain/types";

interface WhatIfShellProps {
  input: SimulationInput;
}

function WhatIfInner(): React.JSX.Element {
  const { input, beforeResults, afterResults, isDirty } = useWhatIf();

  const p1Name = displayName(input.p1?.name ?? "", "Personne 1");
  const p2Name = displayName(input.p2?.name ?? "", "Personne 2");

  // Use M2 (income ratio) as the reference model for the summary gap
  const beforeGap = Math.abs(
    beforeResults.m2_income_ratio.p1DisposableIncome -
      beforeResults.m2_income_ratio.p2DisposableIncome
  );
  const afterGap = Math.abs(
    afterResults.m2_income_ratio.p1DisposableIncome -
      afterResults.m2_income_ratio.p2DisposableIncome
  );

  function handleCopyLink(): void {
    const link = getFullLink(input);
    void navigator.clipboard.writeText(link);
  }

  return (
    <div className="space-y-8">
      {/* Summary */}
      <WhatIfSummary p1Name={p1Name} p2Name={p2Name} beforeGap={beforeGap} afterGap={afterGap} />

      {/* Split layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Before (snapshot) */}
        <div className="rounded-lg border border-border bg-surface p-5">
          <SnapshotPanel />
        </div>

        {/* Arrow */}
        <div
          data-testid="whatif-arrow"
          className="hidden lg:flex items-center justify-center text-text-dim text-2xl pt-12"
          aria-hidden="true"
        >
          →
        </div>
        <div
          data-testid="whatif-arrow"
          className="flex lg:hidden items-center justify-center text-text-dim text-2xl"
          aria-hidden="true"
        >
          ↓
        </div>

        {/* After (editable) */}
        <div className="rounded-lg border border-accent/30 bg-surface p-5">
          <WhatIfPanel />
        </div>
      </div>

      {/* Copy link CTA */}
      {isDirty && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 bg-text text-bg px-5 py-2.5 rounded-md text-sm font-medium transition-colors hover:opacity-80"
          >
            Copier le lien de ce scénario
          </button>
        </div>
      )}
    </div>
  );
}

export function WhatIfShell({ input }: WhatIfShellProps): React.JSX.Element {
  return (
    <WhatIfProvider initialInput={input}>
      <WhatIfInner />
    </WhatIfProvider>
  );
}
