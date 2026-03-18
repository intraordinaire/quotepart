import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveState, loadState, clearState, STORAGE_KEY } from "@/lib/persistState";
import type { SimulationState } from "@/context/SimulationContext";

function makeState(overrides: Partial<SimulationState> = {}): SimulationState {
  return {
    mode: "full",
    activeTier: 1,
    completedTiers: new Set<1 | 2 | 3 | 4>([1]),
    skippedTiers: new Set<2 | 3 | 4>(),
    input: {
      commonCharges: 1500,
      hasChildren: false,
      hourlyRate: 9.52,
    },
    activeTab: "saisie",
    ...overrides,
  };
}

describe("persistState", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("saves state to localStorage", () => {
    const state = makeState();
    saveState(state);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it("loads saved state from localStorage", () => {
    const state = makeState();
    saveState(state);
    const loaded = loadState();
    expect(loaded).not.toBeNull();
    expect(loaded!.mode).toBe("full");
    expect(loaded!.activeTier).toBe(1);
    expect(loaded!.input.commonCharges).toBe(1500);
  });

  it("restores Set fields correctly (completedTiers, skippedTiers)", () => {
    const state = makeState();
    saveState(state);
    const loaded = loadState();
    expect(loaded!.completedTiers).toBeInstanceOf(Set);
    expect(loaded!.completedTiers.has(1)).toBe(true);
    expect(loaded!.skippedTiers).toBeInstanceOf(Set);
  });

  it("returns null when localStorage is empty", () => {
    expect(loadState()).toBeNull();
  });

  it("returns null for corrupted localStorage data", () => {
    localStorage.setItem(STORAGE_KEY, "not-valid-json{{{{");
    expect(loadState()).toBeNull();
  });

  it("returns null when stored data has wrong shape", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: "bar" }));
    expect(loadState()).toBeNull();
  });

  it("clears state from localStorage", () => {
    saveState(makeState());
    clearState();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("saveState silently handles localStorage quota errors", () => {
    const original = localStorage.setItem.bind(localStorage);
    vi.spyOn(localStorage, "setItem").mockImplementationOnce(() => {
      throw new Error("QuotaExceededError");
    });
    // Should not throw
    expect(() => saveState(makeState())).not.toThrow();
    localStorage.setItem = original;
  });
});
