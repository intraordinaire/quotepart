import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { randomPlaceholderPair, displayName } from "@/lib/names";
import {
  simulationReducer,
  getUnlockedModels,
  isDomesticAvailable,
  initialState,
  SimulationProvider,
} from "@/context/SimulationContext";
import { useSimulation } from "@/context/useSimulation";
import type { SimulationState } from "@/context/SimulationContext";

// ─── Part A: names.ts ──────────────────────────────────────────────────────

const ALLOWED_NAMES = ["Alice", "Mehdi", "Sam", "Yasmine", "Jordan", "Léa", "Thomas", "Chloé"];

describe("randomPlaceholderPair", () => {
  it("returns two different strings from the allowed list", () => {
    const [a, b] = randomPlaceholderPair();
    expect(ALLOWED_NAMES).toContain(a);
    expect(ALLOWED_NAMES).toContain(b);
    expect(a).not.toBe(b);
  });
});

describe("displayName", () => {
  it("returns the name when non-empty", () => {
    expect(displayName("Alice", "Personne 1")).toBe("Alice");
  });

  it("returns fallback when name is empty string", () => {
    expect(displayName("", "Personne 1")).toBe("Personne 1");
  });

  it("returns fallback when name is only whitespace", () => {
    expect(displayName("   ", "Personne 2")).toBe("Personne 2");
  });
});

// ─── Part B: Reducer ───────────────────────────────────────────────────────

describe("simulationReducer", () => {
  it("SET_MODE sets the mode", () => {
    const next = simulationReducer(initialState, { type: "SET_MODE", payload: "full" });
    expect(next.mode).toBe("full");
  });

  it("SET_TIER sets activeTier", () => {
    const next = simulationReducer(initialState, { type: "SET_TIER", payload: 2 });
    expect(next.activeTier).toBe(2);
  });

  it("COMPLETE_TIER adds tier to completedTiers", () => {
    const next = simulationReducer(initialState, { type: "COMPLETE_TIER", payload: 1 });
    expect(next.completedTiers.has(1)).toBe(true);
  });

  it("COMPLETE_TIER does not mutate previous state", () => {
    const next = simulationReducer(initialState, { type: "COMPLETE_TIER", payload: 1 });
    expect(initialState.completedTiers.has(1)).toBe(false);
    expect(next.completedTiers).not.toBe(initialState.completedTiers);
  });

  it("SKIP_TIER adds tier to skippedTiers", () => {
    const next = simulationReducer(initialState, { type: "SKIP_TIER", payload: 2 });
    expect(next.skippedTiers.has(2)).toBe(true);
  });

  it("SKIP_TIER does not mutate previous state", () => {
    const next = simulationReducer(initialState, { type: "SKIP_TIER", payload: 2 });
    expect(initialState.skippedTiers.has(2)).toBe(false);
    expect(next.skippedTiers).not.toBe(initialState.skippedTiers);
  });

  it("UPDATE_INPUT merges input shallowly", () => {
    const next = simulationReducer(initialState, {
      type: "UPDATE_INPUT",
      payload: { commonCharges: 1200, hasChildren: true },
    });
    expect(next.input.commonCharges).toBe(1200);
    expect(next.input.hasChildren).toBe(true);
  });

  it("UPDATE_INPUT preserves existing input keys", () => {
    const stateWithInput: SimulationState = {
      ...initialState,
      input: { commonCharges: 800 },
    };
    const next = simulationReducer(stateWithInput, {
      type: "UPDATE_INPUT",
      payload: { hasChildren: false },
    });
    expect(next.input.commonCharges).toBe(800);
    expect(next.input.hasChildren).toBe(false);
  });

  it("TOGGLE_DOMESTIC sets domesticEnabled", () => {
    const next = simulationReducer(initialState, { type: "TOGGLE_DOMESTIC", payload: true });
    expect(next.domesticEnabled).toBe(true);
    const off = simulationReducer(next, { type: "TOGGLE_DOMESTIC", payload: false });
    expect(off.domesticEnabled).toBe(false);
  });

  it("COMPLETE_TIER 4 auto-enables domesticEnabled", () => {
    const next = simulationReducer(initialState, { type: "COMPLETE_TIER", payload: 4 });
    expect(next.domesticEnabled).toBe(true);
  });

  it("COMPLETE_TIER 1 does not change domesticEnabled", () => {
    const next = simulationReducer(initialState, { type: "COMPLETE_TIER", payload: 1 });
    expect(next.domesticEnabled).toBe(false);
  });
});

// ─── Part C: getUnlockedModels ─────────────────────────────────────────────

describe("getUnlockedModels", () => {
  it("empty state → no models unlocked", () => {
    expect(getUnlockedModels(initialState).size).toBe(0);
  });

  it("tier1 complete → m1_5050 + m2_income_ratio unlocked", () => {
    const state: SimulationState = {
      ...initialState,
      completedTiers: new Set([1]),
    };
    const unlocked = getUnlockedModels(state);
    expect(unlocked.has("m1_5050")).toBe(true);
    expect(unlocked.has("m2_income_ratio")).toBe(true);
    expect(unlocked.size).toBe(2);
  });

  it("tier1 + tier2 complete → also m3_equal_rav", () => {
    const state: SimulationState = {
      ...initialState,
      completedTiers: new Set([1, 2]),
    };
    const unlocked = getUnlockedModels(state);
    expect(unlocked.has("m3_equal_rav")).toBe(true);
    expect(unlocked.size).toBe(3);
  });

  it("tier2 skipped → m3 still unlocked (with tier1 complete)", () => {
    const state: SimulationState = {
      ...initialState,
      completedTiers: new Set([1]),
      skippedTiers: new Set([2]),
    };
    const unlocked = getUnlockedModels(state);
    expect(unlocked.has("m3_equal_rav")).toBe(true);
  });

  it("all tiers complete → all 4 models unlocked", () => {
    const state: SimulationState = {
      ...initialState,
      completedTiers: new Set([1, 2, 3, 4]),
    };
    const unlocked = getUnlockedModels(state);
    expect(unlocked.has("m1_5050")).toBe(true);
    expect(unlocked.has("m2_income_ratio")).toBe(true);
    expect(unlocked.has("m3_equal_rav")).toBe(true);
    expect(unlocked.has("m4_adjusted_time")).toBe(true);
    expect(unlocked.size).toBe(4);
  });
});

// ─── Part C-bis: isDomesticAvailable ──────────────────────────────────────

describe("isDomesticAvailable", () => {
  it("returns false when tier 4 not completed", () => {
    expect(isDomesticAvailable(initialState)).toBe(false);
  });

  it("returns true when tier 4 completed", () => {
    const state: SimulationState = {
      ...initialState,
      completedTiers: new Set([1, 2, 3, 4]),
    };
    expect(isDomesticAvailable(state)).toBe(true);
  });

  it("returns false when tier 4 only skipped (no data entered)", () => {
    const state: SimulationState = {
      ...initialState,
      completedTiers: new Set([1, 2, 3]),
      skippedTiers: new Set([4]),
    };
    expect(isDomesticAvailable(state)).toBe(false);
  });
});

// ─── Part D: useSimulation outside provider ────────────────────────────────

describe("useSimulation", () => {
  it("throws if used outside SimulationProvider", () => {
    function BrokenComponent(): null {
      useSimulation();
      return null;
    }

    // Suppress React error boundary output in test console
    const consoleError = console.error;
    console.error = (): void => {};

    expect(() => render(<BrokenComponent />)).toThrow(
      "useSimulation must be used inside SimulationProvider"
    );

    console.error = consoleError;
  });

  it("provides state and dispatch inside provider", () => {
    function ConsumerComponent(): React.JSX.Element {
      const { state } = useSimulation();
      return <div data-testid="ok" data-mode={state.mode ?? "null"} data-tier={state.activeTier} />;
    }

    render(
      <SimulationProvider>
        <ConsumerComponent />
      </SimulationProvider>
    );

    const el = screen.getByTestId("ok");
    expect(el).toBeTruthy();
    expect(el.getAttribute("data-mode")).toBe("null");
    expect(el.getAttribute("data-tier")).toBe("0");
  });
});
