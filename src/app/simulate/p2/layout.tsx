import React from "react";
import { SimulationProvider } from "@/context/SimulationContext";

export default function P2Layout({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <SimulationProvider>{children}</SimulationProvider>;
}
