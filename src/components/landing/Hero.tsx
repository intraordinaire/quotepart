"use client";

import Link from "next/link";

export default function Hero(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-[900px] px-6 pt-24 pb-16 text-center md:px-10 md:pt-32 md:pb-20">
      <div className="mb-7 inline-flex items-center gap-1.5 rounded-full bg-accent-dim px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-widest text-accent">
        Simulateur d&apos;équité financière
      </div>

      <h1 className="mx-auto mb-6 max-w-[560px] font-display text-[clamp(36px,6vw,64px)] leading-[1.08] tracking-tight text-white">
        Vos dépenses communes,
        <br />
        <span className="italic text-accent">justement</span> réparties
      </h1>

      <p className="mx-auto mb-10 max-w-[520px] text-base leading-relaxed text-text-dim md:text-[17px]">
        4 modèles d&apos;équité appliqués à vos vrais chiffres. Pas une calculette, un outil pour
        choisir ensemble ce qui est juste pour vous.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3.5 text-[15px] font-semibold text-white transition-all hover:brightness-110"
        >
          Commencer la simulation
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
        <a
          href="#comment-ca-marche"
          className="inline-flex items-center rounded-lg border border-border px-8 py-3.5 text-[15px] font-medium text-text transition-colors hover:border-text-muted"
        >
          Comment ça marche
        </a>
      </div>
    </section>
  );
}
