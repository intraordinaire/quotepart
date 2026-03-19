import type { SimulationInput } from "@/domain/types";
import { encodeState } from "@/lib/urlState";

/**
 * Shared data payload sent to P2 — intentionally excludes P1's personal
 * financial data (income, personalCharges, sliders).
 * NOTE: The full simulation link still contains all P1 data; this is
 * soft privacy, not cryptographic. Encryption is planned for v1.1.
 */
export interface P2SharedPayload {
  commonCharges: number;
  hasChildren: boolean;
  hourlyRate: number;
  p1Name: string;
}

function getOrigin(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}

/**
 * Generates a full simulation link containing the entire SimulationInput.
 * Use this to let P1 bookmark or share their own complete simulation state.
 */
export function getFullLink(input: SimulationInput): string {
  const encoded = encodeState(input);
  return `${getOrigin()}/simulate?data=${encoded}`;
}

/**
 * Generates a P2 invite link containing only shared data (common charges,
 * hasChildren, hourlyRate, P1 name). P1 personal income and charges are
 * intentionally excluded from this link.
 */
export function getP2InviteLink(input: SimulationInput): string {
  const payload: P2SharedPayload = {
    commonCharges: input.commonCharges,
    hasChildren: input.hasChildren,
    hourlyRate: input.hourlyRate,
    p1Name: input.p1?.name ?? "",
  };
  const encoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
  return `${getOrigin()}/simulate/p2?data=${encoded}`;
}

/**
 * Decodes a P2 invite link payload. Returns null if invalid.
 */
export function decodeP2Payload(encoded: string): P2SharedPayload | null {
  if (!encoded) return null;
  try {
    const base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const parsed: unknown = JSON.parse(atob(padded));
    if (!isP2SharedPayload(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function isP2SharedPayload(value: unknown): value is P2SharedPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.commonCharges === "number" &&
    typeof v.hasChildren === "boolean" &&
    typeof v.hourlyRate === "number" &&
    typeof v.p1Name === "string"
  );
}
