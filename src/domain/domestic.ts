import { DOMESTIC_HOURS, CHILD_CATEGORIES, WEEKS_PER_MONTH } from "./constants";
import type { DomesticCategory, DomesticSliders } from "./types";

export interface DomesticCategoryConfig {
  key: DomesticCategory;
  label: string;
  shortLabel: string;
  hours: string;
  childrenOnly: boolean;
}

export const DOMESTIC_CATEGORIES: DomesticCategoryConfig[] = [
  {
    key: "groceries",
    label: "Courses alimentaires",
    shortLabel: "Courses",
    hours: "3h/sem",
    childrenOnly: false,
  },
  {
    key: "cooking",
    label: "Préparation des repas",
    shortLabel: "Cuisine",
    hours: "7h/sem",
    childrenOnly: false,
  },
  {
    key: "cleaning",
    label: "Ménage & linge",
    shortLabel: "Ménage",
    hours: "6h/sem",
    childrenOnly: false,
  },
  {
    key: "admin",
    label: "Admin & paperasse",
    shortLabel: "Administratif",
    hours: "2h/sem",
    childrenOnly: false,
  },
  {
    key: "childrenAppointments",
    label: "RDV enfants",
    shortLabel: "RDV enfants",
    hours: "2h/sem",
    childrenOnly: true,
  },
  {
    key: "schoolSupport",
    label: "Accompagnement scolaire",
    shortLabel: "Aide scolaire",
    hours: "3h/sem",
    childrenOnly: true,
  },
  {
    key: "maintenance",
    label: "Bricolage & entretien",
    shortLabel: "Bricolage",
    hours: "2h/sem",
    childrenOnly: false,
  },
  {
    key: "planning",
    label: "Organisation & planification",
    shortLabel: "Organisation",
    hours: "3h/sem",
    childrenOnly: false,
  },
];

export function mergeDomesticSliders(
  p1: DomesticSliders,
  p2: DomesticSliders | undefined
): DomesticSliders {
  if (!p2) return p1;

  return Object.fromEntries(
    (Object.keys(p1) as DomesticCategory[]).map((key) => [key, (p1[key] + p2[key]) / 2])
  ) as DomesticSliders;
}

export interface DomesticValueResult {
  p1MonthlyValue: number;
  p2MonthlyValue: number;
  p1WeeklyHours: number;
  p2WeeklyHours: number;
}

export function computeDomesticValue(
  sliders: DomesticSliders,
  hasChildren: boolean,
  hourlyRate: number
): DomesticValueResult {
  const categories = (Object.keys(DOMESTIC_HOURS) as DomesticCategory[]).filter(
    (cat) => hasChildren || !CHILD_CATEGORIES.includes(cat)
  );

  let p1Hours = 0;
  let p2Hours = 0;

  for (const cat of categories) {
    const refHours = DOMESTIC_HOURS[cat];
    const p1Share = sliders[cat] / 100;
    p1Hours += refHours * p1Share;
    p2Hours += refHours * (1 - p1Share);
  }

  return {
    p1WeeklyHours: p1Hours,
    p2WeeklyHours: p2Hours,
    p1MonthlyValue: p1Hours * hourlyRate * WEEKS_PER_MONTH,
    p2MonthlyValue: p2Hours * hourlyRate * WEEKS_PER_MONTH,
  };
}
