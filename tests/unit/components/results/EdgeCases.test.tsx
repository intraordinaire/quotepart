import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { ComparisonTable } from "@/components/results/ComparisonTable";
import { ModelDetailPanel } from "@/components/results/ModelDetailPanel";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelId, SimulationInput } from "@/domain/types";
import type { M4Result } from "@/domain/models/m4-adjusted-time";
import type { M5Result } from "@/domain/models/m5-total-contribution";

function makeModelResult(
  overrides: Partial<{
    equityScore: number;
    isViable: boolean;
    warnings: string[];
    p1Contribution: number;
    p2Contribution: number;
    p1DisposableIncome: number;
    p2DisposableIncome: number;
  }> = {}
) {
  return {
    p1Contribution: 500,
    p2Contribution: 500,
    p1DisposableIncome: 1000,
    p2DisposableIncome: 1000,
    equityScore: 0.8,
    isViable: true,
    warnings: [],
    ...overrides,
  };
}

function makeM4Result(overrides: Partial<M4Result> = {}): M4Result {
  return {
    optionA: makeModelResult(),
    optionB: makeModelResult(),
    partTimeCostMonthly: 0,
    isSameAsM2: false,
    ...overrides,
  };
}

function makeM5Result(overrides: Partial<M5Result> = {}): M5Result {
  return {
    modelResult: makeModelResult(),
    p1DomesticMonthlyValue: 200,
    p2DomesticMonthlyValue: 200,
    p1WeeklyDomesticHours: 20,
    p2WeeklyDomesticHours: 20,
    ratioBeforeDomestic: 0.5,
    ratioAfterDomestic: 0.5,
    isSameAsM2: false,
    ...overrides,
  };
}

function makeResults(overrides: Partial<CalculationResults> = {}): CalculationResults {
  return {
    m1_5050: makeModelResult(),
    m2_income_ratio: makeModelResult(),
    m3_equal_rav: makeModelResult(),
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

const defaultInput: SimulationInput = {
  p1: {
    name: "P1",
    income: 2000,
    personalCharges: 300,
    workQuota: 1,
    fullTimeIncome: 2000,
    partTimeReason: null,
  },
  p2: {
    name: "P2",
    income: 1500,
    personalCharges: 200,
    workQuota: 1,
    fullTimeIncome: 1500,
    partTimeReason: null,
  },
  commonCharges: 1000,
  hasChildren: false,
  domesticSliders: {
    p1: {
      groceries: 60,
      cooking: 70,
      cleaning: 50,
      admin: 50,
      childrenAppointments: 50,
      schoolSupport: 50,
      maintenance: 40,
      planning: 60,
    },
  },
  hourlyRate: 9.52,
};

describe("Edge cases — ComparisonTable", () => {
  it("shows 'Non viable' badge when isViable = false on a model", () => {
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

  it("shows a warning message under a non-viable model", () => {
    const results = makeResults({
      m1_5050: makeModelResult({
        isViable: false,
        warnings: ["La contribution dépasse le revenu."],
      }),
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

    expect(screen.getByText(/La contribution dépasse le revenu/i)).toBeInTheDocument();
  });

  it("shows red alert banner when charges_exceed_income validation error is present", () => {
    const results = makeResults({
      validationErrors: [
        {
          type: "charges_exceed_income",
          message: "Les charges communes dépassent les revenus combinés.",
        },
      ],
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

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/charges communes dépassent/i)).toBeInTheDocument();
  });
});

describe("Edge cases — Transfer display", () => {
  it("displays negative contribution as a transfer with arrow notation", () => {
    const results = makeResults({
      m3_equal_rav: makeModelResult({
        p2Contribution: -300,
        p1Contribution: 3300,
        warnings: ["Pour égaliser le reste à vivre, P1 devrait verser 300\u00A0€/mois à P2."],
      }),
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

    // Negative contribution should show as transfer, not raw "-300"
    expect(screen.queryByText(/-300/)).toBeNull();
    // Should show positive amount with arrow direction
    expect(screen.getByText(/Alice → Bob/)).toBeInTheDocument();
  });

  it("shows 'Non viable' badge with warning variant for contribution > income", () => {
    const results = makeResults({
      m5_total_contribution: makeM5Result({
        modelResult: makeModelResult({
          isViable: false,
          warnings: ["La contribution dépasse son revenu."],
        }),
      }),
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
});

describe("Edge cases — ModelDetailPanel", () => {
  it("M4 shows 'identique au M2' mention when isSameAsM2 = true", () => {
    const results = makeResults({
      m4_adjusted_time: makeM4Result({ isSameAsM2: true }),
    });

    render(
      <ModelDetailPanel
        modelId="m4_adjusted_time"
        results={results}
        input={defaultInput}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/identique au M2/i)).toBeInTheDocument();
  });

  it("M5 shows 'identique au M2' mention when isSameAsM2 = true", () => {
    const results = makeResults({
      m5_total_contribution: makeM5Result({ isSameAsM2: true }),
    });

    render(
      <ModelDetailPanel
        modelId="m5_total_contribution"
        results={results}
        input={defaultInput}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText(/identique au M2/i)).toBeInTheDocument();
  });
});
