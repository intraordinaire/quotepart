import React from "react";

const MODELS = [
  {
    num: "01",
    name: "50/50",
    desc: "Chacun paie la moitié. Simple, mais rarement équitable quand les revenus diffèrent.",
    tag: "Baseline",
  },
  {
    num: "02",
    name: "Prorata revenus",
    desc: "Chacun contribue proportionnellement à ce qu'il gagne.",
    tag: "Classique",
  },
  {
    num: "03",
    name: "Reste à vivre égal",
    desc: "Après contribution, chacun garde le même montant disponible.",
    tag: "Équitable",
  },
  {
    num: "04",
    name: "Ajusté temps de travail",
    desc: "Le temps partiel choisi est compensé dans le calcul.",
    tag: "Contextuel",
  },
  {
    num: "05",
    name: "Contribution totale",
    desc: "Intègre la valeur du travail domestique dans la répartition.",
    tag: "Complet",
  },
] as const;

export default function ModelsOverview(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-[900px] px-6 py-16 md:px-10">
      <h2 className="mb-3 text-center font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
        5 façons de voir l&apos;équité
      </h2>
      <p className="mx-auto mb-12 max-w-[500px] text-center text-[15px] text-text-dim">
        Aucun modèle n&apos;est &quot;le bon&quot;. L&apos;outil vous les montre tous pour que vous
        choisissiez celui qui correspond à votre situation.
      </p>

      <div className="flex flex-col gap-px">
        {MODELS.map((m, i) => (
          <div
            key={m.num}
            className={`flex items-center gap-4 rounded-lg px-5 py-4 md:gap-5 md:px-6 md:py-5 ${
              i % 2 === 0 ? "bg-surface" : "bg-transparent"
            }`}
          >
            <span className="min-w-[36px] font-display text-[28px] font-light text-text-muted">
              {m.num}
            </span>
            <div className="flex-1">
              <div className="mb-0.5 flex flex-wrap items-center gap-2.5">
                <span className="text-[15px] font-semibold text-text">{m.name}</span>
                <span className="rounded bg-border px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-text-dim">
                  {m.tag}
                </span>
              </div>
              <span className="text-[13px] text-text-dim">{m.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
