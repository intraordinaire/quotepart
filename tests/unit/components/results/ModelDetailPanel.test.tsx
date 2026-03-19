import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModelDetailPanel } from "@/components/results/ModelDetailPanel";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelResult } from "@/domain/types";

function makeModelResult(overrides: Partial<ModelResult> = {}): ModelResult {
  return {
    p1Contribution: 600,
    p2Contribution: 400,
    p1DisposableIncome: 1400,
    p2DisposableIncome: 1600,
    equityScore: 0.7,
    isViable: true,
    warnings: [],
    ...overrides,
  };
}

const defaultResults: CalculationResults = {
  m1_5050: makeModelResult(),
  m2_income_ratio: makeModelResult(),
  m3_equal_rav: makeModelResult(),
  m4_adjusted_time: {
    optionA: makeModelResult(),
    optionB: makeModelResult(),
    partTimeCostMonthly: 80,
    isSameAsM2: false,
  },
  m5_total_contribution: {
    modelResult: makeModelResult(),
    p1DomesticMonthlyValue: 320,
    p2DomesticMonthlyValue: 180,
    p1WeeklyDomesticHours: 20,
    p2WeeklyDomesticHours: 12,
    ratioBeforeDomestic: 0.6,
    ratioAfterDomestic: 0.55,
    isSameAsM2: false,
  },
  projections: {},
  validationErrors: [],
};

describe("ModelDetailPanel", () => {
  it("renders nothing when modelId is null", () => {
    const { container } = render(
      <ModelDetailPanel
        modelId={null}
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows formula text for m1_5050 when modelId is m1_5050", () => {
    render(
      <ModelDetailPanel
        modelId="m1_5050"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Chacun paie la moitié des charges communes.")).toBeInTheDocument();
  });

  it("shows philosophy text for m1_5050", () => {
    render(
      <ModelDetailPanel
        modelId="m1_5050"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(
      screen.getByText("Égalité parfaite entre les partenaires, indépendamment des revenus.")
    ).toBeInTheDocument();
  });

  it("shows philosophy text for m2_income_ratio", () => {
    render(
      <ModelDetailPanel
        modelId="m2_income_ratio"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Chacun contribue selon ses moyens financiers.")).toBeInTheDocument();
  });

  it("shows philosophy text for m3_equal_rav", () => {
    render(
      <ModelDetailPanel
        modelId="m3_equal_rav"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(
      screen.getByText("Égaliser ce qu'il reste après avoir payé sa part.")
    ).toBeInTheDocument();
  });

  it("shows philosophy text for m4_adjusted_time", () => {
    render(
      <ModelDetailPanel
        modelId="m4_adjusted_time"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(
      screen.getByText("Neutralise l'impact du temps partiel sur la contribution.")
    ).toBeInTheDocument();
  });

  it("shows philosophy text for m5_total_contribution", () => {
    render(
      <ModelDetailPanel
        modelId="m5_total_contribution"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(
      screen.getByText("Reconnaît que le travail domestique a une valeur économique réelle.")
    ).toBeInTheDocument();
  });

  it("shows advantages list items for m1_5050", () => {
    render(
      <ModelDetailPanel
        modelId="m1_5050"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Simple et transparent")).toBeInTheDocument();
    expect(screen.getByText("Aucune négociation sur les montants")).toBeInTheDocument();
  });

  it("shows limitations list items for m1_5050", () => {
    render(
      <ModelDetailPanel
        modelId="m1_5050"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(screen.getByText("Ignore les différences de revenus")).toBeInTheDocument();
    expect(screen.getByText("Peut créer des déséquilibres importants")).toBeInTheDocument();
  });

  it("M4 detail shows both Option A and Option B sections", () => {
    render(
      <ModelDetailPanel
        modelId="m4_adjusted_time"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    expect(screen.getAllByText(/Option A/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Option B/i).length).toBeGreaterThanOrEqual(1);
  });

  it("M5 detail shows p1DomesticMonthlyValue and p2DomesticMonthlyValue formatted in €", () => {
    render(
      <ModelDetailPanel
        modelId="m5_total_contribution"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={vi.fn()}
      />
    );
    // 320 formatted in fr-FR = "320 €"
    expect(screen.getByText(/320/)).toBeInTheDocument();
    // 180 formatted in fr-FR = "180 €"
    expect(screen.getByText(/180/)).toBeInTheDocument();
  });

  it("close button calls onClose callback", async () => {
    const onClose = vi.fn();
    render(
      <ModelDetailPanel
        modelId="m1_5050"
        results={defaultResults}
        p1Name="P1"
        p2Name="P2"
        onClose={onClose}
      />
    );
    const closeBtn = screen.getByRole("button", { name: /fermer/i });
    await userEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
