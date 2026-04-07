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
  return btoa(Array.from(bytes, (b) => String.fromCharCode(b)).join(""))
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

/**
 * Validates a decoded object looks like a SimulationInput.
 * Lenient on person fields — P2 invite links intentionally carry partial P2 data.
 * The caller should use toFullInput() to fill defaults before computing.
 */
function isSimulationInput(value: unknown): value is SimulationInput {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    isPersonLike(v.p1) &&
    isPersonLike(v.p2) &&
    typeof v.commonCharges === "number" &&
    typeof v.hasChildren === "boolean"
  );
}

/**
 * Accepts a person object with at least a name.
 * Other fields are optional — they get filled by toFullInput().
 */
function isPersonLike(value: unknown): boolean {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.name !== "string") return false;
  // Reject present-but-wrong-type numeric fields (toFullInput ?? won't fix them)
  for (const k of ["income", "personalCharges", "workQuota", "fullTimeIncome"]) {
    if (k in v && typeof v[k] !== "number") return false;
  }
  return true;
}
