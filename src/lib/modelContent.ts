import type { ModelId } from "@/domain/types";

interface ModelContent {
  label: string;
  formula: string;
  philosophy: string;
  advantages: string[];
  limitations: string[];
}

export const MODEL_CONTENT: Record<ModelId, ModelContent> = {
  m1_5050: {
    label: "M1 — 50/50",
    formula: "Chacun paie la moitié des charges communes.",
    philosophy: "Égalité parfaite entre les partenaires, indépendamment des revenus.",
    advantages: ["Simple et transparent", "Aucune négociation sur les montants"],
    limitations: ["Ignore les différences de revenus", "Peut créer des déséquilibres importants"],
  },
  m2_income_ratio: {
    label: "M2 — Revenu proportionnel",
    formula: "Contribution = Charges × (Revenu individuel / Revenu total du couple)",
    philosophy: "Chacun contribue selon ses moyens financiers.",
    advantages: ["Proportionnel aux revenus", "Équité financière directe"],
    limitations: [
      "Ne tient pas compte des charges personnelles",
      "Ajustable avec le toggle domestique",
    ],
  },
  m3_equal_rav: {
    label: "M3 — Reste à vivre égal",
    formula: "Chaque partenaire garde le même revenu disponible après charges communes.",
    philosophy: "Égaliser ce qu'il reste après avoir payé sa part.",
    advantages: ["Même niveau de vie pour les deux", "Prend en compte les charges perso"],
    limitations: [
      "Nécessite de connaître les charges personnelles",
      "Ajustable avec le toggle domestique",
    ],
  },
  m4_adjusted_time: {
    label: "M4 — Temps ajusté",
    formula: "Option B : Contribution basée sur le revenu théorique temps plein.",
    philosophy: "Neutralise l'impact du temps partiel sur la contribution.",
    advantages: [
      "Équitable pour les personnes à temps partiel",
      "Valorise le choix du temps partiel",
    ],
    limitations: [
      "Nécessite de connaître le revenu temps plein théorique",
      "Ajustable avec le toggle domestique",
    ],
  },
};
