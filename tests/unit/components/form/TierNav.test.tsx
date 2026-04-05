import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { SimulationContext } from "@/context/SimulationContext";
import type { SimulationState, SimulationAction } from "@/context/SimulationContext";
import { TierNav } from "@/components/form/TierNav";

// ─── Helpers ───────────────────────────────────────────────────────────────

function makeState(overrides: Partial<SimulationState> = {}): SimulationState {
  return {
    mode: null,
    role: null,
    activeTier: 1,
    completedTiers: new Set(),
    skippedTiers: new Set(),
    input: {},
    activeTab: "saisie" as const,
    domesticEnabled: false,
    ...overrides,
  };
}

function renderTierNav(
  state: SimulationState,
  dispatch: React.Dispatch<SimulationAction> = vi.fn()
): void {
  render(
    <SimulationContext.Provider value={{ state, dispatch }}>
      <TierNav />
    </SimulationContext.Provider>
  );
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe("TierNav", () => {
  it("renders 4 tier buttons", () => {
    renderTierNav(makeState());
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(4);
  });

  it("active tier button has data-active='true'", () => {
    renderTierNav(makeState({ activeTier: 2 }));
    const buttons = screen.getAllByRole("button");
    // buttons[0] = tier 1, buttons[1] = tier 2
    expect(buttons[1]).toHaveAttribute("data-active", "true");
    expect(buttons[0]).not.toHaveAttribute("data-active", "true");
  });

  it("completed tier (tier < activeTier) shows checkmark SVG and sr-only text", () => {
    // tier 1 is completed when activeTier >= 2
    renderTierNav(makeState({ activeTier: 2, completedTiers: new Set([1]) }));
    const [firstButton] = screen.getAllByRole("button");
    // SVG checkmark replaces the number
    expect(firstButton?.querySelector("svg")).toBeTruthy();
    // Screen reader text announces completion
    expect(firstButton?.textContent).toContain("(complétée)");
  });

  it("locked tiers (mode === null) — buttons have opacity class", () => {
    renderTierNav(makeState({ mode: null }));
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn.className).toMatch(/opacity/);
    });
  });

  it("progress bar width is 50% when activeTier=2", () => {
    renderTierNav(makeState({ activeTier: 2 }));
    const progressBar = document.querySelector("[data-testid='tier-progress-bar']");
    expect(progressBar).toBeTruthy();
    expect((progressBar as HTMLElement).style.width).toBe("50%");
  });

  it("clicking a tier button when mode !== null dispatches SET_TIER", async () => {
    const dispatch = vi.fn();
    renderTierNav(makeState({ mode: "full", activeTier: 1 }), dispatch);
    const user = userEvent.setup();
    const [, , thirdButton] = screen.getAllByRole("button");
    // Click the 3rd button (tier 3)
    await user.click(thirdButton!);
    expect(dispatch).toHaveBeenCalledWith({ type: "SET_TIER", payload: 3 });
  });

  it("clicking a tier button when mode === null does not dispatch", async () => {
    const dispatch = vi.fn();
    renderTierNav(makeState({ mode: null }), dispatch);
    const user = userEvent.setup();
    const [, secondButton] = screen.getAllByRole("button");
    await user.click(secondButton!);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("renders 'Progression' label", () => {
    renderTierNav(makeState());
    expect(screen.getByText("Progression")).toBeTruthy();
  });

  it("renders tier labels", () => {
    renderTierNav(makeState());
    expect(screen.getByText("Revenus & charges")).toBeTruthy();
    expect(screen.getByText("Charges perso")).toBeTruthy();
    expect(screen.getByText("Temps de travail")).toBeTruthy();
    expect(screen.getByText("Charge domestique")).toBeTruthy();
  });
});
