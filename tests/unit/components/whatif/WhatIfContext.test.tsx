import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { WhatIfProvider, useWhatIf } from "@/context/WhatIfContext";
import type { SimulationInput } from "@/domain/types";

const baseInput: SimulationInput = {
  p1: {
    name: "P1",
    income: 3200,
    personalCharges: 80,
    workQuota: 1,
    fullTimeIncome: 3200,
    partTimeReason: null,
  },
  p2: {
    name: "P2",
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

function TestConsumer(): React.JSX.Element {
  const { input, beforeInput, beforeResults, afterResults, isDirty, dispatch, reset } = useWhatIf();
  return (
    <div>
      <span data-testid="p1-income">{input.p1.income}</span>
      <span data-testid="before-p1-income">{beforeInput.p1.income}</span>
      <span data-testid="is-dirty">{String(isDirty)}</span>
      <span data-testid="before-m2-p1">{beforeResults.m2_income_ratio.p1Contribution}</span>
      <span data-testid="after-m2-p1">{afterResults.m2_income_ratio.p1Contribution}</span>
      <button
        onClick={() => dispatch({ type: "UPDATE_FIELD", path: ["p1", "income"], value: 4000 })}
      >
        Change income
      </button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

function renderWithProvider(input: SimulationInput = baseInput): ReturnType<typeof render> {
  return render(
    <WhatIfProvider initialInput={input}>
      <TestConsumer />
    </WhatIfProvider>
  );
}

describe("WhatIfContext", () => {
  it("initializes from snapshot (deep copy, not reference)", () => {
    renderWithProvider();
    expect(screen.getByTestId("p1-income").textContent).toBe("3200");
    expect(screen.getByTestId("before-p1-income").textContent).toBe("3200");
  });

  it("modifying WhatIf state does NOT mutate the initial snapshot", () => {
    renderWithProvider();

    act(() => {
      screen.getByText("Change income").click();
    });

    // After state changed
    expect(screen.getByTestId("p1-income").textContent).toBe("4000");
    // Before snapshot unchanged
    expect(screen.getByTestId("before-p1-income").textContent).toBe("3200");
  });

  it("reset() restores initial snapshot", () => {
    renderWithProvider();

    act(() => {
      screen.getByText("Change income").click();
    });
    expect(screen.getByTestId("p1-income").textContent).toBe("4000");

    act(() => {
      screen.getByText("Reset").click();
    });
    expect(screen.getByTestId("p1-income").textContent).toBe("3200");
  });

  it("isDirty = true when any field differs from snapshot", () => {
    renderWithProvider();
    expect(screen.getByTestId("is-dirty").textContent).toBe("false");

    act(() => {
      screen.getByText("Change income").click();
    });
    expect(screen.getByTestId("is-dirty").textContent).toBe("true");

    act(() => {
      screen.getByText("Reset").click();
    });
    expect(screen.getByTestId("is-dirty").textContent).toBe("false");
  });

  it("results are recalculated when input changes", () => {
    renderWithProvider();
    const beforeM2 = screen.getByTestId("before-m2-p1").textContent;
    const afterM2Before = screen.getByTestId("after-m2-p1").textContent;

    // Before change, both should be equal
    expect(beforeM2).toBe(afterM2Before);

    act(() => {
      screen.getByText("Change income").click();
    });

    // After change: before snapshot stays the same, after recalculated (M2 depends on income ratio)
    expect(screen.getByTestId("before-m2-p1").textContent).toBe(beforeM2);
    expect(screen.getByTestId("after-m2-p1").textContent).not.toBe(beforeM2);
  });
});
