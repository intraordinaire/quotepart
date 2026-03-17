import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { ComparisonTable } from "@/components/results/ComparisonTable";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelId } from "@/domain/types";
import type { M4Result } from "@/domain/models/m4-adjusted-time";
import type { M5Result } from "@/domain/models/m5-total-contribution";

function makeModelResult(
  overrides: Partial<{
    p1Contribution: number;
    p2Contribution: number;
    p1DisposableIncome: number;
    p2DisposableIncome: number;
    equityScore: number;
    isViable: boolean;
    warnings: string[];
  }> = {}
) {
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

function makeM5Result(overrides: Partial<M5Result> = {}): M5Result {
  return {
    modelResult: makeModelResult({ equityScore: 0.95 }),
    p1DomesticMonthlyValue: 200,
    p2DomesticMonthlyValue: 150,
    p1WeeklyDomesticHours: 20,
    p2WeeklyDomesticHours: 15,
    ratioBeforeDomestic: 0.5,
    ratioAfterDomestic: 0.48,
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
    m5_total_contribution: makeM5Result(),
    projections: {},
    validationErrors: [],
    ...overrides,
  };
}

const ALL_MODELS: Set<ModelId> = new Set([
  "m1_5050",
  "m2_income_ratio",
  "m3_equal_rav",
  "m4_adjusted_time",
  "m5_total_contribution",
]);

const TIER1_ONLY: Set<ModelId> = new Set(["m1_5050", "m2_income_ratio"]);

describe("ComparisonTable", () => {
  it("renders 5 column headers M1 through M5", () => {
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

    // Each model has a <th data-model="..."> column header
    expect(container.querySelector("[data-model='m1_5050']")).toBeInTheDocument();
    expect(container.querySelector("[data-model='m2_income_ratio']")).toBeInTheDocument();
    expect(container.querySelector("[data-model='m3_equal_rav']")).toBeInTheDocument();
    expect(container.querySelector("[data-model='m4_adjusted_time']")).toBeInTheDocument();
    expect(container.querySelector("[data-model='m5_total_contribution']")).toBeInTheDocument();
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

    // M3 requires tier 2, M4 requires tier 3, M5 requires tier 4
    expect(screen.getByText(/palier 2/i)).toBeInTheDocument();
    expect(screen.getByText(/palier 3/i)).toBeInTheDocument();
    expect(screen.getByText(/palier 4/i)).toBeInTheDocument();
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

    // French locale formats 1811 as "1 811" (non-breaking space or narrow no-break space)
    // \u00A0 = non-breaking space, \u202F = narrow no-break space (used by fr-FR in modern engines)
    expect(screen.getAllByText(/1[\s\u00A0\u202F]811[\s\u00A0\u202F]€/).length).toBeGreaterThan(0);
  });

  it("non-viable model shows 'Non viable' badge", () => {
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

    expect(screen.getByText(/non viable/i)).toBeInTheDocument();
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

    // Click the <th> header cell for M1
    const m1Header = container.querySelector("[data-model='m1_5050']");
    expect(m1Header).not.toBeNull();
    fireEvent.click(m1Header!);
    expect(onSelect).toHaveBeenCalledWith("m1_5050");
  });

  it("best model (highest equityScore among unlocked) has ring-accent class", () => {
    // m3 has equityScore=0.9, highest among all
    const results = makeResults({
      m1_5050: makeModelResult({ equityScore: 0.7 }),
      m2_income_ratio: makeModelResult({ equityScore: 0.8 }),
      m3_equal_rav: makeModelResult({ equityScore: 0.9 }),
      m4_adjusted_time: makeM4Result({ optionB: makeModelResult({ equityScore: 0.6 }) }),
      m5_total_contribution: makeM5Result({ modelResult: makeModelResult({ equityScore: 0.5 }) }),
    });

    const { container } = render(
      <ComparisonTable
        results={results}
        unlockedModels={ALL_MODELS}
        selectedModel={null}
        onModelSelect={vi.fn()}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    const bestColumn = container.querySelector("[data-model='m3_equal_rav']");
    expect(bestColumn).not.toBeNull();
    expect(bestColumn?.className).toMatch(/ring-accent/);
  });

  it("best model among unlocked only — locked models excluded from best calculation", () => {
    // m3 (score 0.99) is locked; m2 (score 0.85) should be best among unlocked
    const results = makeResults({
      m1_5050: makeModelResult({ equityScore: 0.7 }),
      m2_income_ratio: makeModelResult({ equityScore: 0.85 }),
      m3_equal_rav: makeModelResult({ equityScore: 0.99 }),
    });

    const { container } = render(
      <ComparisonTable
        results={results}
        unlockedModels={TIER1_ONLY}
        selectedModel={null}
        onModelSelect={vi.fn()}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    const m2Column = container.querySelector("[data-model='m2_income_ratio']");
    const m3Column = container.querySelector("[data-model='m3_equal_rav']");
    expect(m2Column?.className).toMatch(/ring-accent/);
    expect(m3Column?.className).not.toMatch(/ring-accent/);
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

    // M3 header exists but is locked — clicking it should not call onModelSelect
    const m3Header = container.querySelector("[data-model='m3_equal_rav']");
    expect(m3Header).not.toBeNull();
    fireEvent.click(m3Header!);
    expect(onSelect).not.toHaveBeenCalledWith("m3_equal_rav");
  });
});
