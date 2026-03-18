"use client";

import React, { useState } from "react";
import type { SimulationInput } from "@/domain/types";
import { getFullLink, getP2InviteLink } from "@/lib/shareLink";

interface ShareLinkPanelProps {
  input: SimulationInput;
  mode: "full" | "shared";
}

export function ShareLinkPanel({ input, mode }: ShareLinkPanelProps): React.JSX.Element {
  const [fullCopied, setFullCopied] = useState(false);
  const [p2Copied, setP2Copied] = useState(false);

  // Computed synchronously — window.origin will differ between SSR and client;
  // suppressHydrationWarning on inputs handles that intentional difference.
  const fullLink = getFullLink(input);
  const p2Link = mode === "shared" ? getP2InviteLink(input) : null;

  async function copyToClipboard(text: string, setFn: (v: boolean) => void): Promise<void> {
    await navigator.clipboard.writeText(text);
    setFn(true);
    setTimeout(() => setFn(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text mb-1">Lien de votre simulation</label>
        <div className="flex gap-2">
          <input
            suppressHydrationWarning
            type="text"
            readOnly
            value={fullLink}
            className="flex-1 rounded border border-border px-3 py-2 text-sm bg-surface"
          />
          <button
            onClick={() => copyToClipboard(fullLink, setFullCopied)}
            className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            {fullCopied ? "Copié !" : "Copier"}
          </button>
        </div>
      </div>

      {mode === "shared" && p2Link && (
        <div>
          <label className="block text-sm font-medium text-text mb-1">
            Inviter votre partenaire (lien P2)
          </label>
          <p className="text-xs text-text-dim mb-2">
            Ce lien ne contient pas vos données personnelles.
          </p>
          <div className="flex gap-2">
            <input
              suppressHydrationWarning
              type="text"
              readOnly
              value={p2Link}
              className="flex-1 rounded border border-border px-3 py-2 text-sm bg-surface"
            />
            <button
              onClick={() => copyToClipboard(p2Link, setP2Copied)}
              className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
            >
              {p2Copied ? "Copié !" : "Copier"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
