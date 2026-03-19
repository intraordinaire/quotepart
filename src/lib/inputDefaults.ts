import type { SimulationInput, Person } from "@/domain/types";
import { DEFAULT_SLIDERS, DEFAULT_HOURLY_RATE } from "@/domain/constants";

interface PartialPerson {
  name?: string;
  income?: number;
  personalCharges?: number;
  workQuota?: number;
  fullTimeIncome?: number;
  partTimeReason?: Person["partTimeReason"];
}

export interface PartialInput {
  p1?: PartialPerson;
  p2?: PartialPerson;
  commonCharges?: number;
  hasChildren?: boolean;
  domesticSliders?: SimulationInput["domesticSliders"];
  hourlyRate?: number;
}

function fullPerson(p: PartialPerson | undefined): Person {
  return {
    name: p?.name ?? "",
    income: p?.income ?? 0,
    personalCharges: p?.personalCharges ?? 0,
    workQuota: p?.workQuota ?? 1.0,
    fullTimeIncome: p?.fullTimeIncome ?? p?.income ?? 0,
    partTimeReason: p?.partTimeReason ?? null,
  };
}

export function toFullInput(raw: PartialInput): SimulationInput {
  return {
    p1: fullPerson(raw.p1),
    p2: fullPerson(raw.p2),
    commonCharges: raw.commonCharges ?? 0,
    hasChildren: raw.hasChildren ?? false,
    domesticSliders: raw.domesticSliders ?? { p1: DEFAULT_SLIDERS },
    hourlyRate: raw.hourlyRate ?? DEFAULT_HOURLY_RATE,
  };
}
