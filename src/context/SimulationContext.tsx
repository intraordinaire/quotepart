"use client";

import React, { createContext, useEffect, useReducer, type ReactNode } from "react";
import { saveState, loadState } from "@/lib/persistState";
import type { SimulationInput, ModelId } from "@/domain/types";
import { DEFAULT_HOURLY_RATE } from "@/domain/constants";

// ─── State ─────────────────────────────────────────────────────────────────

export type TabId = "saisie" | "resultats" | "etsi";

export interface SimulationState {
  mode: "full" | "shared" | null;
  activeTier: 0 | 1 | 2 | 3 | 4;
  completedTiers: Set<1 | 2 | 3 | 4>;
  skippedTiers: Set<2 | 3 | 4>;
  input: Partial<SimulationInput>;
  activeTab: TabId;
}

// ─── Actions ───────────────────────────────────────────────────────────────

export type SimulationAction =
  | { type: "SET_MODE"; payload: "full" | "shared" }
  | { type: "SET_TIER"; payload: 0 | 1 | 2 | 3 | 4 }
  | { type: "SET_TAB"; payload: TabId }
  | { type: "COMPLETE_TIER"; payload: 1 | 2 | 3 | 4 }
  | { type: "SKIP_TIER"; payload: 2 | 3 | 4 }
  | { type: "UPDATE_INPUT"; payload: Partial<SimulationInput> }
  | { type: "HYDRATE"; payload: SimulationState };

// ─── Initial state ─────────────────────────────────────────────────────────

export const initialState: SimulationState = {
  mode: null,
  activeTier: 0,
  completedTiers: new Set(),
  skippedTiers: new Set(),
  input: { commonCharges: 0, hasChildren: false, hourlyRate: DEFAULT_HOURLY_RATE },
  activeTab: "saisie",
};

// ─── Reducer ───────────────────────────────────────────────────────────────

export function simulationReducer(
  state: SimulationState,
  action: SimulationAction
): SimulationState {
  switch (action.type) {
    case "SET_MODE":
      return { ...state, mode: action.payload };

    case "SET_TIER":
      return { ...state, activeTier: action.payload };

    case "SET_TAB":
      return { ...state, activeTab: action.payload };

    case "COMPLETE_TIER":
      return {
        ...state,
        completedTiers: new Set([...state.completedTiers, action.payload]),
      };

    case "SKIP_TIER":
      return {
        ...state,
        skippedTiers: new Set([...state.skippedTiers, action.payload]),
      };

    case "UPDATE_INPUT":
      return {
        ...state,
        input: { ...state.input, ...action.payload },
      };

    case "HYDRATE":
      return action.payload;

    default:
      return state;
  }
}

// ─── Unlock logic ──────────────────────────────────────────────────────────

export function getUnlockedModels(state: SimulationState): Set<ModelId> {
  const unlocked = new Set<ModelId>();

  const tier1Done = state.completedTiers.has(1);
  const tier2Done = state.completedTiers.has(2) || state.skippedTiers.has(2);
  const tier3Done = state.completedTiers.has(3) || state.skippedTiers.has(3);
  const tier4Done = state.completedTiers.has(4) || state.skippedTiers.has(4);

  if (tier1Done) {
    unlocked.add("m1_5050");
    unlocked.add("m2_income_ratio");
  }
  if (tier1Done && tier2Done) unlocked.add("m3_equal_rav");
  if (tier1Done && tier2Done && tier3Done) unlocked.add("m4_adjusted_time");
  if (tier1Done && tier2Done && tier3Done && tier4Done) unlocked.add("m5_total_contribution");

  return unlocked;
}

// ─── Context ───────────────────────────────────────────────────────────────

interface SimulationContextValue {
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
}

export const SimulationContext = createContext<SimulationContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────

interface SimulationProviderProps {
  children: ReactNode;
  /** Pass `fresh` to ignore localStorage and start from initialState (e.g. P2 flow) */
  fresh?: boolean;
}

export function SimulationProvider({
  children,
  fresh,
}: SimulationProviderProps): React.JSX.Element {
  // Always start from initialState to match SSR; hydrate from localStorage after mount.
  const [state, dispatch] = useReducer(simulationReducer, initialState);

  useEffect(() => {
    if (!fresh) {
      const saved = loadState();
      if (saved) dispatch({ type: "HYDRATE", payload: saved });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist state to localStorage on every change
  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <SimulationContext.Provider value={{ state, dispatch }}>{children}</SimulationContext.Provider>
  );
}
