import type { SimulationInput } from "@/domain/types";
import { encodeState } from "@/lib/urlState";

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
 * Generates a P2 invite link containing the full SimulationInput.
 * P1's financial data IS in the URL (soft privacy — UI hides it, not encoding).
 * Real encryption is planned for v1.1.
 */
export function getP2InviteLink(input: SimulationInput): string {
  const encoded = encodeState(input);
  return `${getOrigin()}/simulate/p2?data=${encoded}`;
}
