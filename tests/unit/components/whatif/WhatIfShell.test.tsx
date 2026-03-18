import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { WhatIfShell } from "@/components/whatif/WhatIfShell";
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

function renderShell(input: SimulationInput = baseInput): ReturnType<typeof render> {
  return render(<WhatIfShell input={input} />);
}

describe("WhatIfShell", () => {
  it("renders SnapshotPanel with before values (read-only)", () => {
    renderShell();
    // Snapshot panel should show the "Situation actuelle" heading
    expect(screen.getByText(/situation actuelle/i)).toBeInTheDocument();
  });

  it("renders WhatIfPanel with editable after values", () => {
    renderShell();
    // WhatIfPanel should show the "Scénario modifié" heading
    expect(screen.getByText(/scénario modifié/i)).toBeInTheDocument();
  });

  it("shows arrow icon between panels", () => {
    renderShell();
    const arrows = screen.getAllByTestId("whatif-arrow");
    expect(arrows.length).toBeGreaterThanOrEqual(1);
  });

  it("shows summary block", () => {
    renderShell();
    // Initially no change, so neutral message
    expect(screen.getByText(/aucun changement/i)).toBeInTheDocument();
  });

  it("editing a field updates the summary", () => {
    renderShell();

    // Change P1 income
    const p1IncomeInput = screen.getByLabelText(/revenu.*alice/i);
    fireEvent.change(p1IncomeInput, { target: { value: "4000" } });

    // Now summary should show a change (no longer "aucun changement")
    expect(screen.queryByText(/aucun changement/i)).not.toBeInTheDocument();
  });
});
