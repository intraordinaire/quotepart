import { describe, it, expect, beforeEach, vi } from "vitest";
import { saveState, loadState, clearState, STORAGE_KEY } from "@/lib/persistState";
import type { SimulationState } from "@/context/SimulationContext";

function makeState(overrides: Partial<SimulationState> = {}): SimulationState {
  return {
    mode: "full",
    role: null,
    activeTier: 1,
    completedTiers: new Set<1 | 2 | 3 | 4>([1]),
    skippedTiers: new Set<2 | 3 | 4>(),
    input: {
      commonCharges: 1500,
      hasChildren: false,
      hourlyRate: 9.52,
    },
    activeTab: "saisie",
    domesticEnabled: false,
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

  it("persists and restores domesticEnabled", () => {
    const state = makeState({ domesticEnabled: true });
    saveState(state);
    const loaded = loadState();
    expect(loaded!.domesticEnabled).toBe(true);
  });

  it("backward compat: missing domesticEnabled defaults based on tier 4 completion", () => {
    // Simulate old format without domesticEnabled
    const oldFormat = {
      mode: "full",
      activeTier: 1,
      completedTiers: [1, 2, 3, 4],
      skippedTiers: [],
      input: { commonCharges: 1500, hasChildren: false, hourlyRate: 9.52 },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldFormat));
    const loaded = loadState();
    // Tier 4 was completed → domesticEnabled should be true
    expect(loaded!.domesticEnabled).toBe(true);
  });

  it("backward compat: missing domesticEnabled without tier 4 defaults to false", () => {
    const oldFormat = {
      mode: "full",
      activeTier: 1,
      completedTiers: [1, 2],
      skippedTiers: [],
      input: { commonCharges: 1500, hasChildren: false, hourlyRate: 9.52 },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(oldFormat));
    const loaded = loadState();
    expect(loaded!.domesticEnabled).toBe(false);
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
