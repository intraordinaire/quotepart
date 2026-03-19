import React from "react";

const STEPS = [
  {
    step: "01",
    title: "Vos revenus & charges",
    desc: "Saisissez l'essentiel en 90 secondes. Deux modèles débloqués immédiatement.",
    accent: false,
  },
  {
    step: "02",
    title: "Votre contexte",
    desc: "Temps partiel, charges personnelles, répartition domestique. Chaque palier affine la simulation.",
    accent: false,
  },
  {
    step: "03",
    title: "Comparez 5 modèles",
    desc: "Du 50/50 à la contribution totale. Projections sur 1, 5 et 10 ans.",
    accent: false,
  },
  {
    step: "04",
    title: "Discutez & décidez",
    desc: "Remplissez ensemble ou envoyez le lien à votre partenaire. Comparez vos perceptions. Décidez en connaissance de cause.",
    accent: true,
  },
] as const;

export default function HowItWorks(): React.JSX.Element {
  return (
    <section id="comment-ca-marche" className="mx-auto max-w-[900px] px-6 py-16 md:px-10">
      <h2 className="mb-3 text-center font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
        Comment ça marche
      </h2>
      <p className="mx-auto mb-12 max-w-[500px] text-center text-[15px] text-text-dim">
        Une saisie progressive, chaque étape débloque de nouveaux modèles.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((item) => (
          <div
            key={item.step}
            className={`rounded-xl p-6 ${
              item.accent
                ? "border-[1.5px] border-accent bg-accent-dim"
                : "border border-border bg-surface"
            }`}
          >
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`font-mono text-[11px] font-bold tracking-wider ${
                  item.accent ? "text-accent" : "text-text-muted"
                }`}
              >
                {item.step}
              </span>
            </div>
            <h3 className="mb-2 text-[15px] font-semibold text-text">{item.title}</h3>
            <p className="text-[13px] leading-relaxed text-text-dim">{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
