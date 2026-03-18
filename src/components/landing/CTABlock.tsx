import React from "react";
import Link from "next/link";

export default function CTABlock(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-[600px] px-6 py-16 text-center md:px-10">
      <div className="rounded-2xl bg-white px-8 py-14 md:px-10">
        <h2 className="mb-3 font-display text-[28px] font-bold tracking-tight text-bg md:text-[32px]">
          Prêts à en discuter ?
        </h2>
        <p className="mx-auto mb-8 max-w-[400px] text-sm leading-relaxed text-text-muted">
          Zéro compte. Zéro stockage serveur. Vos données restent sur votre appareil.
        </p>
        <Link
          href="/simulate"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-9 py-3.5 text-[15px] font-semibold text-white transition-all hover:brightness-110"
        >
          Lancer la simulation
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
      </div>
    </section>
  );
}
