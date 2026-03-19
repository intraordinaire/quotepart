import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TemporalProjection } from "@/components/results/TemporalProjection";
import type { CalculationResults } from "@/domain/calculate";
import type { ModelId } from "@/domain/types";

function makeResults(overrides: Partial<CalculationResults> = {}): CalculationResults {
  const baseModelResult = {
    p1Contribution: 500,
    p2Contribution: 500,
    p1DisposableIncome: 1000,
    p2DisposableIncome: 1000,
    equityScore: 1,
    isViable: true,
    warnings: [],
  };

  return {
    m1_5050: { ...baseModelResult },
    m2_income_ratio: { ...baseModelResult },
    m3_equal_rav: { ...baseModelResult },
    m4_adjusted_time: {
      optionA: { ...baseModelResult },
      optionB: { ...baseModelResult },
      partTimeCostMonthly: 0,
      isSameAsM2: false,
    },
    m5_total_contribution: {
      modelResult: { ...baseModelResult },
      p1DomesticMonthlyValue: 100,
      p2DomesticMonthlyValue: 100,
      p1WeeklyDomesticHours: 10,
      p2WeeklyDomesticHours: 10,
      ratioBeforeDomestic: 0.5,
      ratioAfterDomestic: 0.5,
      isSameAsM2: false,
    },
    projections: {
      m1_5050: { year1: 1200, year5: 6000, year10: 12000 },
      m2_income_ratio: { year1: 840, year5: 4200, year10: 8400 },
      m3_equal_rav: { year1: 600, year5: 3000, year10: 6000 },
      m4_adjusted_time: { year1: 480, year5: 2400, year10: 4800 },
      m5_total_contribution: { year1: 360, year5: 1800, year10: 3600 },
    },
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

const ONLY_TIER1: Set<ModelId> = new Set(["m1_5050", "m2_income_ratio"]);

describe("TemporalProjection", () => {
  it("shows 3 time horizons as column headers", () => {
    const { container } = render(
      <TemporalProjection
        results={makeResults()}
        unlockedModels={ALL_MODELS}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    const headers = container.querySelectorAll("thead th");
    const headerTexts = Array.from(headers).map((h) => h.textContent ?? "");
    expect(headerTexts.some((t) => /1 an/i.test(t))).toBe(true);
    expect(headerTexts.some((t) => /5 ans/i.test(t))).toBe(true);
    expect(headerTexts.some((t) => /10 ans/i.test(t))).toBe(true);
  });

  it("displays year1 projection value formatted in fr-FR for each unlocked model", () => {
    const { container } = render(
      <TemporalProjection
        results={makeResults()}
        unlockedModels={ALL_MODELS}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    // year1 for m1_5050 = 1200 — check it appears in the table
    const allText = container.textContent ?? "";
    // fr-FR formats 1200 as "1 200" (NNBSP) → normalize any space variant
    const normalize = (s: string) => s.replace(/[\s\u202F\u00A0]/g, " ");
    expect(normalize(allText)).toContain("1 200 €");
    // year1 for m2_income_ratio = 840
    expect(normalize(allText)).toContain("840 €");
  });

  it("year5 = year1 * 5 and year10 = year1 * 10 — values are displayed", () => {
    const { container } = render(
      <TemporalProjection
        results={makeResults()}
        unlockedModels={ALL_MODELS}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    // m1_5050: year1=1200, year5=6000, year10=12000
    const normalize = (s: string) => s.replace(/[\s\u202F\u00A0]/g, " ");
    const allText = normalize(container.textContent ?? "");
    expect(allText).toContain("1 200 €");
    expect(allText).toContain("6 000 €");
    expect(allText).toContain("12 000 €");
  });

  it("intro sentence uses p1Name and p2Name", () => {
    render(
      <TemporalProjection
        results={makeResults()}
        unlockedModels={ALL_MODELS}
        p1Name="Camille"
        p2Name="Jordan"
      />
    );

    expect(screen.getByText(/Camille/)).toBeInTheDocument();
    expect(screen.getByText(/Jordan/)).toBeInTheDocument();
  });

  it("intro sentence shows M1 year1 value", () => {
    render(
      <TemporalProjection
        results={makeResults()}
        unlockedModels={ALL_MODELS}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    // m1_5050 year10 = 12000 or year1 = 1200 should appear in the intro context
    const fmt = (n: number) =>
      new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n) + "\u00A0€";

    // The intro must reference the M1 year1 value (1 200 €)
    const allText = document.body.textContent ?? "";
    expect(allText).toContain(fmt(1200));
  });

  it("locked model rows have a visual disabled state", () => {
    render(
      <TemporalProjection
        results={makeResults()}
        unlockedModels={ONLY_TIER1}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    // m3, m4, m5 rows should be visually disabled
    const rows = document.querySelectorAll("tr[aria-disabled='true'], tr.opacity-40");
    expect(rows.length).toBeGreaterThanOrEqual(3);
  });

  it("shows all 5 model label rows in the table", () => {
    render(
      <TemporalProjection
        results={makeResults()}
        unlockedModels={ALL_MODELS}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    expect(screen.getByText(/50\/50/i)).toBeInTheDocument();
    expect(screen.getByText(/Revenu proportionnel/i)).toBeInTheDocument();
    expect(screen.getByText(/Reste à vivre égal/i)).toBeInTheDocument();
    expect(screen.getByText(/Temps ajusté/i)).toBeInTheDocument();
    expect(screen.getByText(/Contribution totale/i)).toBeInTheDocument();
  });

  it("M4 row is dimmed when isSameAsM2", () => {
    const results = makeResults();
    results.m4_adjusted_time.isSameAsM2 = true;

    render(
      <TemporalProjection
        results={results}
        unlockedModels={ALL_MODELS}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    const m4Row = screen.getByText(/Temps ajusté/i).closest("tr");
    expect(m4Row?.className).toContain("opacity-40");
    expect(m4Row?.getAttribute("aria-disabled")).toBe("true");
  });
});
