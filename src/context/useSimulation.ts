import { useContext } from "react";
import {
  SimulationContext,
  type SimulationState,
  type SimulationAction,
} from "./SimulationContext";
import type React from "react";

interface SimulationContextValue {
  state: SimulationState;
  dispatch: React.Dispatch<SimulationAction>;
}

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used inside SimulationProvider");
  return ctx;
}
