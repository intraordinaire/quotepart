import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Tier4Domestic } from "@/components/form/Tier4Domestic";
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
    activeTier: 4,
    completedTiers: new Set<1 | 2 | 3 | 4>([1, 2, 3]),
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

describe("Tier4Domestic", () => {
  it("renders 8 sliders when hasChildren is true", () => {
    mockContext("full", { hasChildren: true });
    render(<Tier4Domestic />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(8);
  });

  it("renders 6 sliders when hasChildren is false (hides childrenAppointments + schoolSupport)", () => {
    mockContext("full", { hasChildren: false });
    render(<Tier4Domestic />);
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(6);
  });

  it("slider labels use names from state (not hardcoded)", () => {
    mockContext("full", {
      p1: {
        name: "Camille",
        income: 2000,
        personalCharges: 0,
        workQuota: 1,
        fullTimeIncome: 2000,
        partTimeReason: null,
      },
      p2: {
        name: "Robin",
        income: 2500,
        personalCharges: 0,
        workQuota: 1,
        fullTimeIncome: 2500,
        partTimeReason: null,
      },
    });
    render(<Tier4Domestic />);
    // Names should appear in slider labels (left/right sides)
    expect(screen.getAllByText("Camille").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Robin").length).toBeGreaterThanOrEqual(1);
  });

  it("slider value changes dispatch UPDATE_INPUT with domesticSliders.p1", () => {
    mockContext("full", { hasChildren: false });
    render(<Tier4Domestic />);
    const sliders = screen.getAllByRole("slider");
    fireEvent.change(sliders[0]!, { target: { value: "70" } });
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UPDATE_INPUT",
        payload: expect.objectContaining({
          domesticSliders: expect.objectContaining({
            p1: expect.objectContaining({
              groceries: 70,
            }),
          }),
        }),
      })
    );
  });

  it("disclaimer text mentions 'Votre perception' in shared mode", () => {
    mockContext("shared");
    render(<Tier4Domestic />);
    expect(screen.getByText(/Votre perception/i)).toBeInTheDocument();
  });

  it("disclaimer text mentions 'Estimez la répartition' in full mode", () => {
    mockContext("full");
    render(<Tier4Domestic />);
    expect(screen.getByText(/Estimez la répartition/i)).toBeInTheDocument();
  });

  it("in shared mode: CTA shows 'Copier le lien pour' with P2 name", () => {
    mockContext("shared", {
      p2: {
        name: "Yasmine",
        income: 2000,
        personalCharges: 0,
        workQuota: 1,
        fullTimeIncome: 2000,
        partTimeReason: null,
      },
    });
    render(<Tier4Domestic />);
    expect(
      screen.getByRole("button", { name: /Copier le lien pour Yasmine/i })
    ).toBeInTheDocument();
  });

  it("in full mode: CTA shows 'Voir les résultats'", () => {
    mockContext("full");
    render(<Tier4Domestic />);
    expect(screen.getByRole("button", { name: /Voir les résultats/i })).toBeInTheDocument();
  });

  it("Retour dispatches SET_TIER(3)", () => {
    render(<Tier4Domestic />);
    fireEvent.click(screen.getByRole("button", { name: /retour/i }));
    expect(mockDispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 3 });
  });
});
