import type { SimulationState } from "@/context/SimulationContext";

export const STORAGE_KEY = "quotepart-simulation";

/**
 * Serialized form of SimulationState — Sets become arrays for JSON.
 */
interface SerializedState {
  mode: SimulationState["mode"];
  activeTier: SimulationState["activeTier"];
  completedTiers: number[];
  skippedTiers: number[];
  input: SimulationState["input"];
}

function serialize(state: SimulationState): SerializedState {
  return {
    mode: state.mode,
    activeTier: state.activeTier,
    completedTiers: Array.from(state.completedTiers),
    skippedTiers: Array.from(state.skippedTiers),
    input: state.input,
  };
}

function deserialize(raw: SerializedState): SimulationState {
  return {
    mode: raw.mode,
    activeTier: raw.activeTier,
    completedTiers: new Set(raw.completedTiers as Array<1 | 2 | 3 | 4>),
    skippedTiers: new Set(raw.skippedTiers as Array<2 | 3 | 4>),
    input: raw.input,
    activeTab: "saisie",
  };
}

function isSerializedState(value: unknown): value is SerializedState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (v.mode === null || v.mode === "full" || v.mode === "shared") &&
    typeof v.activeTier === "number" &&
    Array.isArray(v.completedTiers) &&
    Array.isArray(v.skippedTiers) &&
    typeof v.input === "object"
  );
}

/**
 * Saves simulation state to localStorage.
 * Silently handles errors (quota exceeded, private browsing, etc.).
 */
export function saveState(state: SimulationState): void {
  try {
    const serialized = serialize(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // Silent: quota exceeded or storage unavailable
  }
}

/**
 * Loads simulation state from localStorage.
 * Returns null if no state is saved or if data is corrupted.
 */
export function loadState(): SimulationState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isSerializedState(parsed)) return null;
    return deserialize(parsed);
  } catch {
    return null;
  }
}

/**
 * Removes simulation state from localStorage.
 * Call when starting a new simulation.
 */
export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silent
  }
}
