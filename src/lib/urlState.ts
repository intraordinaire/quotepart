import type { SimulationInput } from "@/domain/types";

/**
 * Encodes a SimulationInput to a URL-safe base64 string.
 * Uses standard base64 with URL-safe substitutions: +→- /→_ = stripped.
 * NOTE: This is NOT cryptographic — P1 personal data is present in the URL.
 * Real encryption is planned for v1.1.
 */
export function encodeState(input: SimulationInput): string {
  const json = JSON.stringify(input);
  const bytes = new TextEncoder().encode(json);
  return btoa(String.fromCodePoint(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Decodes a URL-safe base64 string back to a SimulationInput.
 * Returns null if the string is malformed or has an unexpected shape.
 */
export function decodeState(encoded: string): SimulationInput | null {
  if (!encoded) return null;
  try {
    // Restore standard base64 padding
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = new TextDecoder().decode(Uint8Array.from(atob(padded), (c) => c.codePointAt(0)!));
    const parsed: unknown = JSON.parse(json);
    if (!isSimulationInput(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isSimulationInput(value: unknown): value is SimulationInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    isPerson(v.p1) &&
    isPerson(v.p2) &&
    typeof v.commonCharges === "number" &&
    typeof v.hasChildren === "boolean" &&
    isDomesticSliders(v.domesticSliders) &&
    typeof v.hourlyRate === "number"
  );
}

function isPerson(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === "string" &&
    typeof v.income === "number" &&
    typeof v.personalCharges === "number" &&
    typeof v.workQuota === "number" &&
    typeof v.fullTimeIncome === "number" &&
    (v.partTimeReason === null ||
      v.partTimeReason === "couple-choice" ||
      v.partTimeReason === "personal-choice" ||
      v.partTimeReason === "medical")
  );
}

function isDomesticSliders(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return isSliderRecord(v.p1);
}

function isSliderRecord(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const categories = [
    "groceries",
    "cooking",
    "cleaning",
    "admin",
    "childrenAppointments",
    "schoolSupport",
    "maintenance",
    "planning",
  ];
  return categories.every((cat) => typeof v[cat] === "number");
}
