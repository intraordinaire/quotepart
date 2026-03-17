import React from "react";
import { SimulationProvider } from "@/context/SimulationContext";

export default function SimulateLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return <SimulationProvider>{children}</SimulationProvider>;
}
