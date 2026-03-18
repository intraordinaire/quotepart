export interface Person {
  name: string;
  income: number; // net monthly income in EUR
  personalCharges: number; // monthly non-negotiable personal expenses
  workQuota: number; // 0.5 = 50%, 1.0 = 100%
  fullTimeIncome: number; // theoretical full-time income (= income if quota = 1.0)
  partTimeReason: "couple-choice" | "personal-choice" | "medical" | null;
}

export type DomesticCategory =
  | "groceries"
  | "cooking"
  | "cleaning"
  | "admin"
  | "childrenAppointments"
  | "schoolSupport"
  | "maintenance"
  | "planning";

export type DomesticSliders = Record<DomesticCategory, number>; // 0–100, P1 share

export interface SimulationInput {
  p1: Person;
  p2: Person;
  commonCharges: number;
  hasChildren: boolean;
  domesticSliders: {
    p1: DomesticSliders;
    p2?: DomesticSliders; // only in couple mode
  };
  hourlyRate: number; // default DEFAULT_HOURLY_RATE (SMIC net horaire 2026)
}

export interface ModelResult {
  p1Contribution: number;
  p2Contribution: number;
  p1DisposableIncome: number;
  p2DisposableIncome: number;
  equityScore: number; // 0–1
  isViable: boolean;
  warnings: string[];
}

export type ModelId =
  | "m1_5050"
  | "m2_income_ratio"
  | "m3_equal_rav"
  | "m4_adjusted_time"
  | "m5_total_contribution";

export type SimulationResults = Record<ModelId, ModelResult>;
