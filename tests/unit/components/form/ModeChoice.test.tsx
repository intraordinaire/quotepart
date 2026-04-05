import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { SimulationContext } from "@/context/SimulationContext";
import type { SimulationState, SimulationAction } from "@/context/SimulationContext";
import { ModeChoice } from "@/components/form/ModeChoice";

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeState(overrides: Partial<SimulationState> = {}): SimulationState {
  return {
    mode: null,
    role: null,
    activeTier: 0,
    completedTiers: new Set(),
    skippedTiers: new Set(),
    input: {},
    activeTab: "saisie" as const,
    domesticEnabled: false,
    ...overrides,
  };
}

function renderModeChoice(
  state: SimulationState = makeState(),
  dispatch: React.Dispatch<SimulationAction> = vi.fn()
): void {
  render(
    <SimulationContext.Provider value={{ state, dispatch }}>
      <ModeChoice />
    </SimulationContext.Provider>
  );
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("ModeChoice", () => {
  it("renders two option buttons", () => {
    renderModeChoice();
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(2);
  });

  it("renders 'On remplit ensemble' text", () => {
    renderModeChoice();
    expect(screen.getByText("On remplit ensemble")).toBeTruthy();
  });

  it("renders 'On remplit chacun·e nos données' text", () => {
    renderModeChoice();
    expect(screen.getByText("On remplit chacun·e nos données")).toBeTruthy();
  });

  it("clicking 'full' option dispatches SET_MODE('full') and SET_TIER(1)", async () => {
    const dispatch = vi.fn();
    renderModeChoice(makeState(), dispatch);
    const user = userEvent.setup();
    const [fullButton] = screen.getAllByRole("button");
    await user.click(fullButton!);
    expect(dispatch).toHaveBeenCalledWith({ type: "SET_MODE", payload: "full" });
    expect(dispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 1 });
  });

  it("clicking 'shared' option dispatches SET_MODE('shared') and SET_TIER(1)", async () => {
    const dispatch = vi.fn();
    renderModeChoice(makeState(), dispatch);
    const user = userEvent.setup();
    const [, sharedButton] = screen.getAllByRole("button");
    await user.click(sharedButton!);
    expect(dispatch).toHaveBeenCalledWith({ type: "SET_MODE", payload: "shared" });
    expect(dispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 1 });
  });

  it("'shared' option describes the partner link flow", () => {
    renderModeChoice();
    expect(screen.getByText(/partenaire recevra un lien/)).toBeTruthy();
  });
});
