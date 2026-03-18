"use client";

import React, { createContext, useContext, useMemo, useReducer, type ReactNode } from "react";
import { calculate, type CalculationResults } from "@/domain/calculate";
import type { SimulationInput } from "@/domain/types";

// ─── Deep clone utility ─────────────────────────────────────────────────────

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// ─── Actions ────────────────────────────────────────────────────────────────

export type WhatIfAction =
  | { type: "UPDATE_FIELD"; path: string[]; value: unknown }
  | { type: "RESET" };

// ─── Reducer ────────────────────────────────────────────────────────────────

function setNestedField(
  obj: Record<string, unknown>,
  path: string[],
  value: unknown
): Record<string, unknown> {
  const result = { ...obj };
  const key = path[0] as string;
  if (path.length === 1) {
    result[key] = value;
    return result;
  }
  result[key] = setNestedField((obj[key] as Record<string, unknown>) ?? {}, path.slice(1), value);
  return result;
}

interface WhatIfState {
  input: SimulationInput;
  initialInput: SimulationInput;
}

function whatIfReducer(state: WhatIfState, action: WhatIfAction): WhatIfState {
  switch (action.type) {
    case "UPDATE_FIELD":
      return {
        ...state,
        input: setNestedField(
          state.input as unknown as Record<string, unknown>,
          action.path,
          action.value
        ) as unknown as SimulationInput,
      };
    case "RESET":
      return {
        ...state,
        input: deepClone(state.initialInput),
      };
    default:
      return state;
  }
}

// ─── Context ────────────────────────────────────────────────────────────────

interface WhatIfContextValue {
  input: SimulationInput;
  beforeInput: SimulationInput;
  beforeResults: CalculationResults;
  afterResults: CalculationResults;
  isDirty: boolean;
  dispatch: React.Dispatch<WhatIfAction>;
  reset: () => void;
}

const WhatIfCtx = createContext<WhatIfContextValue | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────

interface WhatIfProviderProps {
  children: ReactNode;
  initialInput: SimulationInput;
}

export function WhatIfProvider({ children, initialInput }: WhatIfProviderProps): React.JSX.Element {
  const frozen = useMemo(() => deepClone(initialInput), [initialInput]);

  const [state, dispatch] = useReducer(whatIfReducer, {
    input: deepClone(frozen),
    initialInput: frozen,
  });

  const beforeResults = useMemo(() => calculate(frozen), [frozen]);
  const afterResults = useMemo(() => calculate(state.input), [state.input]);

  const isDirty = useMemo(
    () => JSON.stringify(state.input) !== JSON.stringify(frozen),
    [state.input, frozen]
  );

  const reset = useMemo(() => () => dispatch({ type: "RESET" }), []);

  const value = useMemo<WhatIfContextValue>(
    () => ({
      input: state.input,
      beforeInput: frozen,
      beforeResults,
      afterResults,
      isDirty,
      dispatch,
      reset,
    }),
    [state.input, frozen, beforeResults, afterResults, isDirty, dispatch, reset]
  );

  return <WhatIfCtx.Provider value={value}>{children}</WhatIfCtx.Provider>;
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useWhatIf(): WhatIfContextValue {
  const ctx = useContext(WhatIfCtx);
  if (!ctx) {
    throw new Error("useWhatIf must be used within a WhatIfProvider");
  }
  return ctx;
}
