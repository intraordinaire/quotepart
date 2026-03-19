import { useContext } from "react";
import { SimulationContext, type SimulationContextValue } from "./SimulationContext";

export function useSimulation(): SimulationContextValue {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error("useSimulation must be used inside SimulationProvider");
  return ctx;
}
