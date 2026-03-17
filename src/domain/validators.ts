import type { SimulationInput } from "./types";

export interface ValidationError {
  type: "charges_exceed_income" | "missing_name" | "invalid_income";
  message: string;
}

export function validateInput(input: SimulationInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.p1.name.trim()) {
    errors.push({ type: "missing_name", message: "Le prénom de la personne 1 est requis." });
  }
  if (!input.p2.name.trim()) {
    errors.push({ type: "missing_name", message: "Le prénom de la personne 2 est requis." });
  }
  if (input.commonCharges > input.p1.income + input.p2.income) {
    errors.push({
      type: "charges_exceed_income",
      message: "Les charges communes dépassent les revenus combinés.",
    });
  }

  return errors;
}

export function computeEquityScore(rav1: number, rav2: number): number {
  const maxRav = Math.max(rav1, rav2);
  if (maxRav <= 0) return 0;
  return 1 - Math.abs(rav1 - rav2) / maxRav;
}
