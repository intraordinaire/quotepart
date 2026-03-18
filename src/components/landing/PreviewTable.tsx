import React from "react";

const MODELS = ["50/50", "Prorata revenus", "Reste à vivre ="] as const;
const THOMAS = ["1 500 €", "1 811 €", "1 920 €"] as const;
const LEA = ["1 500 €", "1 189 €", "1 080 €"] as const;
const ECART = [
  { v: "1 100 €", style: "text-accent" },
  { v: "478 €", style: "text-amber" },
  { v: "260 €", style: "text-green" },
] as const;

export default function PreviewTable(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-[860px] px-6 py-16 md:px-10">
      <div className="overflow-hidden rounded-xl border border-border bg-surface p-6 md:p-8">
        <div className="mb-5 font-mono text-[11px] font-medium uppercase tracking-widest text-text-muted">
          Aperçu des résultats comparatifs
        </div>

        {/* Desktop grid */}
        <div className="hidden md:block">
          <div className="grid grid-cols-[120px_repeat(3,1fr)] text-[13px]">
            {/* Header */}
            <div className="border-b border-border pb-2.5 font-mono text-[11px] uppercase tracking-wider text-text-muted" />
            {MODELS.map((h) => (
              <div
                key={h}
                className="border-b border-border pb-2.5 text-right font-mono text-[11px] uppercase tracking-wider text-text-muted"
              >
                {h}
              </div>
            ))}

            {/* Thomas */}
            <div className="flex items-center gap-1.5 py-3.5 font-semibold text-text">
              <span className="inline-block h-2 w-2 rounded-full bg-text" />
              Thomas
            </div>
            {THOMAS.map((v, i) => (
              <div key={i} className="py-3.5 text-right font-medium tabular-nums text-text">
                {v}
              </div>
            ))}

            {/* Léa */}
            <div className="flex items-center gap-1.5 py-3.5 font-semibold text-text">
              <span className="inline-block h-2 w-2 rounded-full bg-accent" />
              Léa
            </div>
            {LEA.map((v, i) => (
              <div key={i} className="py-3.5 text-right font-medium tabular-nums text-text">
                {v}
              </div>
            ))}

            {/* Écart */}
            <div className="flex items-center border-t border-border pt-3.5 font-mono text-[11px] uppercase tracking-wider text-text-muted">
              Écart RAV
            </div>
            {ECART.map((item, i) => (
              <div
                key={i}
                className={`border-t border-border pt-3.5 text-right font-semibold tabular-nums ${item.style}`}
              >
                {item.v}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile stacked cards */}
        <div className="flex flex-col gap-3 md:hidden">
          {MODELS.map((model, i) => {
            const ecart = ECART[i];
            return (
              <div key={model} className="rounded-lg border border-border bg-bg p-4">
                <div className="mb-3 font-mono text-[11px] uppercase tracking-wider text-text-muted">
                  {model}
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-text" />
                    <span className="font-medium text-text">Thomas</span>
                    <span className="ml-2 tabular-nums text-text-dim">{THOMAS[i]}</span>
                  </div>
                  <div>
                    <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-accent" />
                    <span className="font-medium text-text">Léa</span>
                    <span className="ml-2 tabular-nums text-text-dim">{LEA[i]}</span>
                  </div>
                </div>
                {ecart && (
                  <div className="mt-2 border-t border-border pt-2 text-center">
                    <span className="font-mono text-xs text-text-muted">Écart : </span>
                    <span className={`font-semibold tabular-nums ${ecart.style}`}>{ecart.v}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-center text-xs text-text-muted">
          Thomas 3 200 €/mois · Léa 2 100 €/mois · Charges communes 3 000 €
        </p>
      </div>
    </section>
  );
}
