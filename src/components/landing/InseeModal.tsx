"use client";

import React, { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

interface InseeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function InseeModal({ open, onClose }: InseeModalProps): React.JSX.Element | null {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      trackEvent("modal/insee");
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 m-auto h-fit w-[calc(100%-2rem)] max-w-lg rounded-lg border border-border bg-surface p-0 text-text backdrop:bg-black/60"
    >
      <div className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-text">Données INSEE utilisées</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-text-dim transition-colors hover:text-text"
            aria-label="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 text-sm leading-relaxed text-text-dim">
          <p>
            QuotePart s&apos;appuie sur les données de l&apos;enquête{" "}
            <strong className="text-text">Emploi du temps 2010</strong> de l&apos;INSEE pour estimer
            le volume de travail domestique non rémunéré dans les foyers français.
          </p>

          <div>
            <h3 className="mb-1 font-medium text-text">Heures de référence</h3>
            <ul className="list-inside list-disc space-y-1">
              <li>
                Couples avec enfants : <strong className="text-text">28h/semaine</strong> de travail
                domestique
              </li>
              <li>
                Couples sans enfants : <strong className="text-text">23h/semaine</strong>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-1 font-medium text-text">8 catégories de tâches</h3>
            <p>
              Courses, cuisine, ménage &amp; linge, administratif, RDV enfants, accompagnement
              scolaire, bricolage &amp; entretien, organisation &amp; planification. Le total des
              heures par catégorie correspond au périmètre restreint de l&apos;enquête INSEE (28h
              avec enfants, 23h sans).
            </p>
          </div>

          <div>
            <h3 className="mb-1 font-medium text-text">Valorisation</h3>
            <p>
              Le travail domestique est valorisé au SMIC horaire net (~9,52 €/h), paramètre
              modifiable dans le simulateur.
            </p>
          </div>

          <p className="text-xs italic text-text-muted">
            C&apos;est la dernière enquête publiée à ce jour. Une nouvelle édition (2025-2026) est
            en cours de collecte — résultats attendus en 2027.
          </p>

          <div className="rounded border border-border bg-bg px-4 py-3">
            <p className="text-xs text-text-muted">
              Source :{" "}
              <a
                href="https://www.insee.fr/fr/statistiques/2123967"
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer text-accent underline underline-offset-2 transition-colors hover:text-text"
              >
                INSEE Première n°1423 — Le travail domestique : 60 milliards d&apos;heures en 2010
              </a>
            </p>
          </div>
        </div>
      </div>
    </dialog>
  );
}
