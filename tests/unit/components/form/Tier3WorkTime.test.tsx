import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Tier3WorkTime } from "@/components/form/Tier3WorkTime";
import * as useSimulationModule from "@/context/useSimulation";
import type { SimulationState, SimulationAction } from "@/context/SimulationContext";
import type { Dispatch } from "react";

vi.mock("@/context/useSimulation");

const dispatchSpy = vi.fn();
const mockDispatch = dispatchSpy as unknown as Dispatch<SimulationAction>;

function makeState(
  mode: "full" | "shared" | null = "full",
  input: Partial<SimulationState["input"]> = {}
): SimulationState {
  return {
    mode,
    role: null,
    activeTier: 3,
    completedTiers: new Set<1 | 2 | 3 | 4>([1, 2]),
    skippedTiers: new Set<2 | 3 | 4>(),
    input,
    activeTab: "saisie" as const,
    domesticEnabled: false,
  };
}

function mockContext(
  mode: "full" | "shared" | null = "full",
  input: Partial<SimulationState["input"]> = {}
): void {
  vi.mocked(useSimulationModule.useSimulation).mockReturnValue({
    state: makeState(mode, input),
    dispatch: mockDispatch,
  });
}

beforeEach(() => {
  dispatchSpy.mockClear();
  mockContext();
});

describe("Tier3WorkTime", () => {
  it("renders a quota selector for P1", () => {
    render(<Tier3WorkTime />);
    // There should be a select for quota visible for P1
    // We look for the "Temps plein (100%)" option which is the default
    const selects = screen.getAllByRole("combobox");
    expect(selects.length).toBeGreaterThanOrEqual(1);
    // At least one select should contain the full-time option
    const options = screen.getAllByRole("option", { name: /Temps plein/i });
    expect(options.length).toBeGreaterThanOrEqual(1);
  });

  it("full-time salary field NOT shown when P1 quota is 100% (default)", () => {
    render(<Tier3WorkTime />);
    const salaryFields = screen.queryAllByLabelText(/salaire théorique/i);
    expect(salaryFields.length).toBe(0);
  });

  it("full-time salary field IS shown when P1 quota < 100%", () => {
    render(<Tier3WorkTime />);
    // Change P1 quota select to "80%"
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0]!, { target: { value: "80%" } });
    expect(screen.getByLabelText(/salaire théorique/i)).toBeInTheDocument();
  });

  it("reason select IS shown when P1 quota < 100%", () => {
    render(<Tier3WorkTime />);
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[0]!, { target: { value: "80%" } });
    // A "Motif" label should appear
    expect(screen.getByText(/motif/i)).toBeInTheDocument();
  });

  it("in shared mode, P2 section shows LockedField", () => {
    mockContext("shared");
    render(<Tier3WorkTime />);
    expect(screen.getByText(/complétera/i)).toBeInTheDocument();
  });

  it("in full mode with P2 quota < 100%, full-time salary field appears for P2", () => {
    render(<Tier3WorkTime />);
    const selects = screen.getAllByRole("combobox");
    // P2 is second quota select (index 1)
    fireEvent.change(selects[1]!, { target: { value: "90%" } });
    const salaryFields = screen.getAllByLabelText(/salaire théorique/i);
    expect(salaryFields.length).toBeGreaterThanOrEqual(1);
  });

  it("Passer dispatches SKIP_TIER(3) and SET_TIER(4)", () => {
    render(<Tier3WorkTime />);
    fireEvent.click(screen.getByRole("button", { name: /passer/i }));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SKIP_TIER", payload: 3 });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 4 });
  });

  it("Suivant dispatches COMPLETE_TIER(3) and SET_TIER(4)", () => {
    render(<Tier3WorkTime />);
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "COMPLETE_TIER", payload: 3 });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 4 });
  });

  it("Retour dispatches SET_TIER(2)", () => {
    render(<Tier3WorkTime />);
    fireEvent.click(screen.getByRole("button", { name: /retour/i }));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 2 });
  });
});
