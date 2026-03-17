import type { ModelId } from "@/domain/types";

export interface ModelContent {
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
    limitations: ["Ne tient pas compte des charges personnelles", "Ignore le travail domestique"],
  },
  m3_equal_rav: {
    label: "M3 — RAV égal",
    formula: "Chaque partenaire garde le même revenu disponible après charges communes.",
    philosophy: "Égaliser ce qu'il reste après avoir payé sa part.",
    advantages: ["Même niveau de vie pour les deux", "Prend en compte les charges perso"],
    limitations: ["Nécessite de connaître les charges personnelles", "Plus complexe à calculer"],
  },
  m4_adjusted_time: {
    label: "M4 — Temps ajusté",
    formula: "Option B : Contribution basée sur le revenu théorique temps plein.",
    philosophy: "Neutralise l'impact du temps partiel sur la contribution.",
    advantages: [
      "Équitable pour les personnes à temps partiel",
      "Valorise le choix du temps partiel",
    ],
    limitations: ["Nécessite de connaître le revenu temps plein théorique"],
  },
  m5_total_contribution: {
    label: "M5 — Contribution totale",
    formula: "Ajuste M2 en tenant compte de la valeur monétaire du travail domestique.",
    philosophy: "Reconnaît que le travail domestique a une valeur économique réelle.",
    advantages: ["Reconnaît toutes les formes de contribution", "Valorise le travail invisible"],
    limitations: ["Subjectif (évaluation des tâches)", "Dépend de la perception de chacun"],
  },
};
