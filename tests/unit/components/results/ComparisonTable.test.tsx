import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComparisonTable } from "@/components/results/ComparisonTable";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelId } from "@/domain/types";
import type { M4Result } from "@/domain/models/m4-adjusted-time";
import type { ModelResult } from "@/domain/types";

function makeModelResult(overrides: Partial<ModelResult> = {}): ModelResult {
  return {
    p1Contribution: 500,
    p2Contribution: 500,
    p1DisposableIncome: 1311,
    p2DisposableIncome: 1311,
    equityScore: 1.0,
    isViable: true,
    warnings: [],
    ...overrides,
  };
}

function makeM4Result(overrides: Partial<M4Result> = {}): M4Result {
  return {
    optionA: makeModelResult(),
    optionB: makeModelResult({ p1Contribution: 600, p2Contribution: 400 }),
    partTimeCostMonthly: 0,
    isSameAsM2: false,
    ...overrides,
  };
}

function makeResults(overrides: Partial<CalculationResults> = {}): CalculationResults {
  return {
    m1_5050: makeModelResult({ equityScore: 0.7 }),
    m2_income_ratio: makeModelResult({ equityScore: 0.85 }),
    m3_equal_rav: makeModelResult({ equityScore: 0.9 }),
    m4_adjusted_time: makeM4Result(),
    domestic: {
      m2_income_ratio: makeModelResult({ p1Contribution: 400, equityScore: 0.9 }),
      m3_equal_rav: makeModelResult({ p1Contribution: 350, equityScore: 0.92 }),
      m4_adjusted_time: {
        optionA: makeModelResult({ p1Contribution: 450 }),
        optionB: makeModelResult({ p1Contribution: 380 }),
        isSameAsM2: false,
        partTimeCostMonthly: 0,
      },
      p1DomesticMonthlyValue: 200,
      p2DomesticMonthlyValue: 150,
      p1WeeklyDomesticHours: 20,
      p2WeeklyDomesticHours: 15,
    },
    projections: {},
    domesticProjections: {},
    validationErrors: [],
    ...overrides,
  } as CalculationResults;
}

const ALL_MODELS: Set<ModelId> = new Set([
  "m1_5050",
  "m2_income_ratio",
  "m3_equal_rav",
  "m4_adjusted_time",
]);

const TIER1_ONLY: Set<ModelId> = new Set(["m1_5050", "m2_income_ratio"]);

describe("ComparisonTable", () => {
  it("renders 4 column headers M1 through M4", () => {
    const { container } = render(
      <ComparisonTable
        results={makeResults()}
        unlockedModels={ALL_MODELS}
        selectedModel={null}
        onModelSelect={vi.fn()}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    expect(container.querySelector("[data-model='m1_5050']")).toBeInTheDocument();
    expect(container.querySelector("[data-model='m2_income_ratio']")).toBeInTheDocument();
    expect(container.querySelector("[data-model='m3_equal_rav']")).toBeInTheDocument();
    expect(container.querySelector("[data-model='m4_adjusted_time']")).toBeInTheDocument();
  });

  it("locked model column shows LockedModelOverlay text", () => {
    render(
      <ComparisonTable
        results={makeResults()}
        unlockedModels={TIER1_ONLY}
        selectedModel={null}
        onModelSelect={vi.fn()}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    // M3 requires tier 2, M4 requires tier 3
    expect(screen.getByText(/palier 2/i)).toBeInTheDocument();
    expect(screen.getByText(/palier 3/i)).toBeInTheDocument();
  });

  it("contributions are formatted as French locale with no decimals and € suffix", () => {
    const results = makeResults({
      m1_5050: makeModelResult({ p1Contribution: 1811, p2Contribution: 1311 }),
    });

    render(
      <ComparisonTable
        results={results}
        unlockedModels={ALL_MODELS}
        selectedModel={null}
        onModelSelect={vi.fn()}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    expect(screen.getAllByText(/1[\s\u00A0\u202F]811[\s\u00A0\u202F]€/).length).toBeGreaterThan(0);
  });

  it("non-viable model shows footer note and dimmed column", () => {
    const results = makeResults({
      m1_5050: makeModelResult({ isViable: false }),
    });

    render(
      <ComparisonTable
        results={results}
        unlockedModels={ALL_MODELS}
        selectedModel={null}
        onModelSelect={vi.fn()}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    const tfoot = document.querySelector("tfoot");
    expect(tfoot).not.toBeNull();
    expect(tfoot!.textContent).toMatch(/M1.*Non viable/i);
  });

  it("clicking a column header calls onModelSelect with the modelId", () => {
    const onSelect = vi.fn();

    const { container } = render(
      <ComparisonTable
        results={makeResults()}
        unlockedModels={ALL_MODELS}
        selectedModel={null}
        onModelSelect={onSelect}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    const m1Header = container.querySelector("[data-model='m1_5050']");
    expect(m1Header).not.toBeNull();
    fireEvent.click(m1Header!);
    expect(onSelect).toHaveBeenCalledWith("m1_5050");
  });

  it("does not call onModelSelect when clicking a locked model header", () => {
    const onSelect = vi.fn();

    const { container } = render(
      <ComparisonTable
        results={makeResults()}
        unlockedModels={TIER1_ONLY}
        selectedModel={null}
        onModelSelect={onSelect}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    const m3Header = container.querySelector("[data-model='m3_equal_rav']");
    expect(m3Header).not.toBeNull();
    fireEvent.click(m3Header!);
    expect(onSelect).not.toHaveBeenCalledWith("m3_equal_rav");
  });

  it("shows footer note when M4 isSameAsM2", () => {
    const results = makeResults({
      m4_adjusted_time: makeM4Result({ isSameAsM2: true }),
    });

    render(
      <ComparisonTable
        results={results}
        unlockedModels={ALL_MODELS}
        selectedModel={null}
        onModelSelect={vi.fn()}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    expect(screen.getByText(/identique au M2/i)).toBeInTheDocument();
    const tfoot = document.querySelector("tfoot");
    expect(tfoot).not.toBeNull();
    expect(tfoot!.textContent).toMatch(/M4.*identique au M2/i);
  });
});
