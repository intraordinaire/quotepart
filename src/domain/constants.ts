import type { DomesticCategory, DomesticSliders } from "./types";

export const DOMESTIC_HOURS: Record<DomesticCategory, number> = {
  groceries: 3,
  cooking: 7,
  cleaning: 6,
  admin: 2,
  childrenAppointments: 2,
  schoolSupport: 3,
  maintenance: 2,
  planning: 3,
};

export const CHILD_CATEGORIES: DomesticCategory[] = ["childrenAppointments", "schoolSupport"];

export const DEFAULT_HOURLY_RATE = 9.52;
export const WEEKS_PER_MONTH = 4.33;

export const DEFAULT_SLIDERS: DomesticSliders = {
  groceries: 50,
  cooking: 50,
  cleaning: 50,
  admin: 50,
  childrenAppointments: 50,
  schoolSupport: 50,
  maintenance: 50,
  planning: 50,
};
