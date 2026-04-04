import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Tier2PersonalCharges } from "@/components/form/Tier2PersonalCharges";
import * as useSimulationModule from "@/context/useSimulation";
import type { SimulationState, SimulationAction } from "@/context/SimulationContext";
import type { Dispatch } from "react";

vi.mock("@/context/useSimulation");

const dispatchSpy = vi.fn();
const mockDispatch = dispatchSpy as unknown as Dispatch<SimulationAction>;

function makeState(mode: "full" | "shared" | null = "full"): SimulationState {
  return {
    mode,
    activeTier: 2,
    completedTiers: new Set<1 | 2 | 3 | 4>([1]),
    skippedTiers: new Set<2 | 3 | 4>(),
    input: {},
    activeTab: "saisie" as const,
    domesticEnabled: false,
  };
}

function mockContext(mode: "full" | "shared" | null = "full"): void {
  vi.mocked(useSimulationModule.useSimulation).mockReturnValue({
    state: makeState(mode),
    dispatch: mockDispatch,
  });
}

beforeEach(() => {
  dispatchSpy.mockClear();
  mockContext();
});

describe("Tier2PersonalCharges", () => {
  it("renders personal charge fields for P1", () => {
    render(<Tier2PersonalCharges />);
    // P1 transport field should be present
    expect(document.getElementById("p1-transport")).toBeInTheDocument();
  });

  it("in shared mode, P2 column shows LockedField instead of inputs", () => {
    mockContext("shared");
    render(<Tier2PersonalCharges />);
    expect(screen.getByText(/complétera/i)).toBeInTheDocument();
    expect(document.getElementById("p2-transport")).toBeNull();
  });

  it("in full mode, P2 column has input fields", () => {
    render(<Tier2PersonalCharges />);
    expect(document.getElementById("p2-transport")).toBeInTheDocument();
  });

  it("Passer button dispatches SKIP_TIER(2) and SET_TIER(3)", () => {
    render(<Tier2PersonalCharges />);
    fireEvent.click(screen.getByRole("button", { name: /passer/i }));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SKIP_TIER", payload: 2 });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 3 });
  });

  it("Suivant button dispatches COMPLETE_TIER(2) and SET_TIER(3)", () => {
    render(<Tier2PersonalCharges />);
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "COMPLETE_TIER", payload: 2 });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 3 });
  });

  it("Retour button dispatches SET_TIER(1)", () => {
    render(<Tier2PersonalCharges />);
    fireEvent.click(screen.getByRole("button", { name: /retour/i }));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 1 });
  });
});
