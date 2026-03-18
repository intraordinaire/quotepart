import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { WhatIfPanel } from "@/components/whatif/WhatIfPanel";
import { WhatIfProvider } from "@/context/WhatIfContext";
import type { SimulationInput } from "@/domain/types";

const baseInput: SimulationInput = {
  p1: {
    name: "Alice",
    income: 3200,
    personalCharges: 80,
    workQuota: 1,
    fullTimeIncome: 3200,
    partTimeReason: null,
  },
  p2: {
    name: "Bob",
    income: 2100,
    personalCharges: 190,
    workQuota: 0.8,
    fullTimeIncome: 2625,
    partTimeReason: "couple-choice",
  },
  commonCharges: 3000,
  hasChildren: true,
  domesticSliders: {
    p1: {
      groceries: 35,
      cooking: 40,
      cleaning: 25,
      admin: 30,
      childrenAppointments: 20,
      schoolSupport: 35,
      maintenance: 75,
      planning: 30,
    },
  },
  hourlyRate: 9.52,
};

function renderPanel(input: SimulationInput = baseInput): ReturnType<typeof render> {
  return render(
    <WhatIfProvider initialInput={input}>
      <WhatIfPanel />
    </WhatIfProvider>
  );
}

describe("WhatIfPanel", () => {
  it("shows all fields pre-filled with current simulation values", () => {
    renderPanel();

    // P1 income field
    const p1IncomeInput = screen.getByLabelText(/revenu.*alice/i);
    expect(p1IncomeInput).toHaveValue("3200");

    // P2 income field
    const p2IncomeInput = screen.getByLabelText(/revenu.*bob/i);
    expect(p2IncomeInput).toHaveValue("2100");

    // Common charges
    const commonInput = screen.getByLabelText(/charges communes/i);
    expect(commonInput).toHaveValue("3000");
  });

  it("editing income P1 triggers recalculation (value changes)", () => {
    renderPanel();

    const p1IncomeInput = screen.getByLabelText(/revenu.*alice/i);
    fireEvent.change(p1IncomeInput, { target: { value: "4000" } });

    expect(p1IncomeInput).toHaveValue("4000");
  });

  it("Reset button restores all fields to initial snapshot values", () => {
    renderPanel();

    const p1IncomeInput = screen.getByLabelText(/revenu.*alice/i);
    fireEvent.change(p1IncomeInput, { target: { value: "5000" } });
    expect(p1IncomeInput).toHaveValue("5000");

    const resetButton = screen.getByRole("button", { name: /réinitialiser/i });
    fireEvent.click(resetButton);

    expect(p1IncomeInput).toHaveValue("3200");
  });

  it("shows personal charges fields pre-filled", () => {
    renderPanel();

    const p1Charges = screen.getByLabelText(/charges perso.*alice/i);
    expect(p1Charges).toHaveValue("80");

    const p2Charges = screen.getByLabelText(/charges perso.*bob/i);
    expect(p2Charges).toHaveValue("190");
  });

  it("shows domestic sliders when hasChildren", () => {
    renderPanel();

    // Should have domestic category sliders
    expect(screen.getByLabelText(/courses alimentaires/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/préparation des repas/i)).toBeInTheDocument();
    // Children-only categories visible since hasChildren = true
    expect(screen.getByLabelText(/rdv enfants/i)).toBeInTheDocument();
  });

  it("hides children-only categories when hasChildren is false", () => {
    const noChildrenInput = {
      ...baseInput,
      hasChildren: false,
    };
    renderPanel(noChildrenInput);

    expect(screen.queryByLabelText(/rdv enfants/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/accompagnement scolaire/i)).not.toBeInTheDocument();
  });
});
