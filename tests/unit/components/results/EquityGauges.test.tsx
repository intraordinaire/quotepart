import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { EquityGauges } from "@/components/results/EquityGauges";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelId } from "@/domain/types";
import type { ModelResult } from "@/domain/types";

function makeModelResult(equityScore: number): ModelResult {
  return {
    p1Contribution: 500,
    p2Contribution: 500,
    p1DisposableIncome: 1000,
    p2DisposableIncome: 1000,
    equityScore,
    isViable: true,
    warnings: [],
  };
}

function makeResults(overrides: Partial<Record<string, number>> = {}): CalculationResults {
  const scores = {
    m1: overrides.m1 ?? 0.8,
    m2: overrides.m2 ?? 0.7,
    m3: overrides.m3 ?? 0.5,
    m4optionB: overrides.m4optionB ?? 0.4,
    m5: overrides.m5 ?? 0.2,
  };

  return {
    m1_5050: makeModelResult(scores.m1),
    m2_income_ratio: makeModelResult(scores.m2),
    m3_equal_rav: makeModelResult(scores.m3),
    m4_adjusted_time: {
      optionA: makeModelResult(0.6),
      optionB: makeModelResult(scores.m4optionB),
      partTimeCostMonthly: 100,
      isSameAsM2: false,
    },
    m5_total_contribution: {
      modelResult: makeModelResult(scores.m5),
      p1DomesticMonthlyValue: 200,
      p2DomesticMonthlyValue: 150,
      p1WeeklyDomesticHours: 15,
      p2WeeklyDomesticHours: 10,
      ratioBeforeDomestic: 0.5,
      ratioAfterDomestic: 0.55,
      isSameAsM2: false,
    },
    projections: {},
    validationErrors: [],
  };
}

const ALL_MODELS: Set<ModelId> = new Set([
  "m1_5050",
  "m2_income_ratio",
  "m3_equal_rav",
  "m4_adjusted_time",
  "m5_total_contribution",
]);

describe("EquityGauges", () => {
  it("renders 5 gauge bars, one per model", () => {
    render(<EquityGauges results={makeResults()} unlockedModels={ALL_MODELS} />);

    expect(screen.getByTestId("gauge-m1_5050")).toBeInTheDocument();
    expect(screen.getByTestId("gauge-m2_income_ratio")).toBeInTheDocument();
    expect(screen.getByTestId("gauge-m3_equal_rav")).toBeInTheDocument();
    expect(screen.getByTestId("gauge-m4_adjusted_time")).toBeInTheDocument();
    expect(screen.getByTestId("gauge-m5_total_contribution")).toBeInTheDocument();
  });

  it("unlocked bar width reflects equityScore * 100%", () => {
    render(<EquityGauges results={makeResults({ m1: 0.75 })} unlockedModels={ALL_MODELS} />);

    const bar = screen.getByTestId("gauge-m1_5050");
    expect(bar).toHaveStyle({ width: "75%" });
  });

  it("bar has green class when equityScore > 0.6", () => {
    render(<EquityGauges results={makeResults({ m1: 0.8 })} unlockedModels={ALL_MODELS} />);

    const bar = screen.getByTestId("gauge-m1_5050");
    expect(bar.className).toContain("bg-green");
  });

  it("bar has amber class when equityScore is between 0.3 and 0.6", () => {
    render(<EquityGauges results={makeResults({ m1: 0.45 })} unlockedModels={ALL_MODELS} />);

    const bar = screen.getByTestId("gauge-m1_5050");
    expect(bar.className).toContain("bg-amber");
  });

  it("bar has accent class when equityScore < 0.3", () => {
    render(<EquityGauges results={makeResults({ m1: 0.1 })} unlockedModels={ALL_MODELS} />);

    const bar = screen.getByTestId("gauge-m1_5050");
    expect(bar.className).toContain("bg-accent");
  });

  it("locked model bar has surface/border class, not green/amber/accent", () => {
    const noModels: Set<ModelId> = new Set();
    render(<EquityGauges results={makeResults()} unlockedModels={noModels} />);

    const bar = screen.getByTestId("gauge-m1_5050");
    expect(bar.className).not.toContain("bg-green");
    expect(bar.className).not.toContain("bg-amber");
    expect(bar.className).not.toContain("bg-accent");
    expect(bar.className).toMatch(/bg-surface|bg-border/);
  });

  it("uses m4_adjusted_time.optionB.equityScore for M4 bar width", () => {
    render(<EquityGauges results={makeResults({ m4optionB: 0.65 })} unlockedModels={ALL_MODELS} />);

    const bar = screen.getByTestId("gauge-m4_adjusted_time");
    expect(bar).toHaveStyle({ width: "65%" });
  });

  it("uses m5_total_contribution.modelResult.equityScore for M5 bar width", () => {
    render(<EquityGauges results={makeResults({ m5: 0.55 })} unlockedModels={ALL_MODELS} />);

    const bar = screen.getByTestId("gauge-m5_total_contribution");
    expect(bar).toHaveStyle({ width: "55%" });
  });

  it("displays model short labels M1 through M5", () => {
    render(<EquityGauges results={makeResults()} unlockedModels={ALL_MODELS} />);

    expect(screen.getByText("M1")).toBeInTheDocument();
    expect(screen.getByText("M2")).toBeInTheDocument();
    expect(screen.getByText("M3")).toBeInTheDocument();
    expect(screen.getByText("M4")).toBeInTheDocument();
    expect(screen.getByText("M5")).toBeInTheDocument();
  });

  it("M4 gauge shows '= M2' label when isSameAsM2", () => {
    const results = makeResults();
    results.m4_adjusted_time.isSameAsM2 = true;

    render(<EquityGauges results={results} unlockedModels={ALL_MODELS} />);

    const bar = screen.getByTestId("gauge-m4_adjusted_time");
    expect(bar.className).toContain("bg-surface");
    expect(screen.getByText("= M2")).toBeInTheDocument();
  });

  it("M5 gauge shows '= M2' label when isSameAsM2", () => {
    const results = makeResults();
    results.m5_total_contribution.isSameAsM2 = true;

    render(<EquityGauges results={results} unlockedModels={ALL_MODELS} />);

    const bar = screen.getByTestId("gauge-m5_total_contribution");
    expect(bar.className).toContain("bg-surface");
    expect(screen.getAllByText("= M2").length).toBeGreaterThanOrEqual(1);
  });

  it("non-viable model shows 'Non viable' label and empty gauge", () => {
    const results = makeResults();
    results.m1_5050 = makeModelResult(0.8);
    results.m1_5050.isViable = false;

    render(<EquityGauges results={results} unlockedModels={ALL_MODELS} />);

    const bar = screen.getByTestId("gauge-m1_5050");
    expect(bar).toHaveStyle({ width: "0%" });
    expect(bar.className).toContain("bg-surface");
    expect(screen.getByText("Non viable")).toBeInTheDocument();
  });
});
