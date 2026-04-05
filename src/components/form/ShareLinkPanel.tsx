"use client";

import React, { useState } from "react";
import type { SimulationInput } from "@/domain/types";
import { getFullLink, getP2InviteLink } from "@/lib/shareLink";

interface ShareLinkPanelProps {
  input: SimulationInput;
  mode: "full" | "shared";
  role: "p1" | "p2" | null;
}

export function ShareLinkPanel({ input, mode, role }: ShareLinkPanelProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard(text: string): Promise<void> {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // P2: single "copy results link" using full link
  if (role === "p2") {
    const link = getFullLink(input);
    return (
      <div>
        <label className="block text-sm font-medium text-text mb-1">
          Lien des résultats (à partager avec votre partenaire)
        </label>
        <p className="text-xs text-text-dim mb-2">
          Ce lien contient toutes les données de la simulation.
        </p>
        <div className="flex gap-2">
          <input
            suppressHydrationWarning
            type="text"
            readOnly
            value={link}
            className="flex-1 rounded border border-border px-3 py-2 text-sm bg-surface"
          />
          <button
            onClick={() => copyToClipboard(link)}
            className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
      </div>
    );
  }

  // P1 shared: invite link for P2
  if (role === "p1" && mode === "shared") {
    const link = getP2InviteLink(input);
    return (
      <div>
        <label className="block text-sm font-medium text-text mb-1">Inviter votre partenaire</label>
        <p className="text-xs text-text-dim mb-2">
          Envoyez ce lien pour que votre partenaire complète ses données.
        </p>
        <div className="flex gap-2">
          <input
            suppressHydrationWarning
            type="text"
            readOnly
            value={link}
            className="flex-1 rounded border border-border px-3 py-2 text-sm bg-surface"
          />
          <button
            onClick={() => copyToClipboard(link)}
            className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
          >
            {copied ? "Copié !" : "Copier"}
          </button>
        </div>
      </div>
    );
  }

  // Solo (full mode): full simulation link
  const fullLink = getFullLink(input);
  return (
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
          onClick={() => copyToClipboard(fullLink)}
          className="shrink-0 rounded bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          {copied ? "Copié !" : "Copier"}
        </button>
      </div>
    </div>
  );
}
