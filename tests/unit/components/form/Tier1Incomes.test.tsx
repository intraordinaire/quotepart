import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Tier1Incomes } from "@/components/form/Tier1Incomes";
import * as useSimulationModule from "@/context/useSimulation";
import type { SimulationState } from "@/context/SimulationContext";
import type { SimulationAction } from "@/context/SimulationContext";
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
    activeTier: 1,
    completedTiers: new Set<1 | 2 | 3 | 4>(),
    skippedTiers: new Set<2 | 3 | 4>(),
    input,
    activeTab: "saisie" as const,
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

describe("Tier1Incomes", () => {
  it("renders two name fields (P1 and P2)", () => {
    render(<Tier1Incomes />);
    expect(screen.getByLabelText(/prénom personne 1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prénom personne 2/i)).toBeInTheDocument();
  });

  it("renders two income fields in full mode", () => {
    render(<Tier1Incomes />);
    expect(screen.getByLabelText(/revenu net mensuel p1/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/revenu net mensuel p2/i)).toBeInTheDocument();
  });

  it("in shared mode, P2 income shows LockedField instead of input", () => {
    mockContext("shared");
    render(<Tier1Incomes />);
    expect(screen.queryByLabelText(/revenu net mensuel p2/i)).not.toBeInTheDocument();
    expect(screen.getByText(/complétera/i)).toBeInTheDocument();
  });

  it("Suivant button dispatches COMPLETE_TIER(1) and SET_TIER(2) when incomes are filled", () => {
    mockContext("full", {
      p1: {
        name: "",
        income: 3000,
        personalCharges: 0,
        workQuota: 1,
        fullTimeIncome: 3000,
        partTimeReason: null,
      },
      p2: {
        name: "",
        income: 2000,
        personalCharges: 0,
        workQuota: 1,
        fullTimeIncome: 2000,
        partTimeReason: null,
      },
    });
    render(<Tier1Incomes />);
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    expect(dispatchSpy).toHaveBeenCalledWith({ type: "COMPLETE_TIER", payload: 1 });
    expect(dispatchSpy).toHaveBeenCalledWith({ type: "SET_TIER", payload: 2 });
  });

  it("Suivant does NOT dispatch when P1 income is missing", () => {
    render(<Tier1Incomes />);
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    expect(dispatchSpy).not.toHaveBeenCalledWith({ type: "COMPLETE_TIER", payload: 1 });
  });

  it("shows P1 income error after failed submit attempt", () => {
    render(<Tier1Incomes />);
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    expect(screen.getByText(/revenu.*personne 1.*requis/i)).toBeInTheDocument();
  });

  it("Suivant does NOT dispatch when P2 income is missing in full mode", () => {
    mockContext("full", {
      p1: {
        name: "",
        income: 3000,
        personalCharges: 0,
        workQuota: 1,
        fullTimeIncome: 3000,
        partTimeReason: null,
      },
    });
    render(<Tier1Incomes />);
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    expect(dispatchSpy).not.toHaveBeenCalledWith({ type: "COMPLETE_TIER", payload: 1 });
    expect(screen.getByText(/revenu.*personne 2.*requis/i)).toBeInTheDocument();
  });

  it("in shared mode, Suivant dispatches with only P1 income filled", () => {
    mockContext("shared", {
      p1: {
        name: "",
        income: 2500,
        personalCharges: 0,
        workQuota: 1,
        fullTimeIncome: 2500,
        partTimeReason: null,
      },
    });
    render(<Tier1Incomes />);
    fireEvent.click(screen.getByRole("button", { name: /suivant/i }));
    expect(dispatchSpy).toHaveBeenCalledWith({ type: "COMPLETE_TIER", payload: 1 });
  });

  it("Retour button dispatches SET_TIER(0)", () => {
    render(<Tier1Incomes />);
    fireEvent.click(screen.getByRole("button", { name: /retour/i }));
    expect(dispatchSpy).toHaveBeenCalledWith({ type: "SET_TIER", payload: 0 });
  });

  it("children checkbox dispatches UPDATE_INPUT with hasChildren", () => {
    render(<Tier1Incomes />);
    const checkbox = screen.getByRole("checkbox", { name: /nous avons des enfants/i });
    fireEvent.click(checkbox);
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "UPDATE_INPUT",
      payload: { hasChildren: true },
    });
  });

  it("P1 name input change dispatches UPDATE_INPUT with p1.name", () => {
    render(<Tier1Incomes />);
    const p1NameInput = screen.getByLabelText(/prénom personne 1/i);
    fireEvent.change(p1NameInput, { target: { value: "Alice" } });
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "UPDATE_INPUT",
      payload: { p1: expect.objectContaining({ name: "Alice" }) },
    });
  });

  it("P2 name input change dispatches UPDATE_INPUT with p2.name", () => {
    render(<Tier1Incomes />);
    const p2NameInput = screen.getByLabelText(/prénom personne 2/i);
    fireEvent.change(p2NameInput, { target: { value: "Bob" } });
    expect(dispatchSpy).toHaveBeenCalledWith({
      type: "UPDATE_INPUT",
      payload: { p2: expect.objectContaining({ name: "Bob" }) },
    });
  });
});
