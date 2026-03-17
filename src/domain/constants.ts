import type { DomesticCategory } from "./types";

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
