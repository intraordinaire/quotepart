import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { PerceptionConfrontation } from "@/components/results/PerceptionConfrontation";
import type { DomesticSliders } from "@/domain/types";

function makeSliders(overrides: Partial<DomesticSliders> = {}): DomesticSliders {
  return {
    groceries: 50,
    cooking: 50,
    cleaning: 50,
    admin: 50,
    childrenAppointments: 50,
    schoolSupport: 50,
    maintenance: 50,
    planning: 50,
    ...overrides,
  };
}

describe("PerceptionConfrontation", () => {
  it("returns null when mode is 'full' (solo mode)", () => {
    const { container } = render(
      <PerceptionConfrontation
        mode="full"
        p1Sliders={makeSliders()}
        p2Sliders={makeSliders()}
        hasChildren={true}
        p1Name="P1"
        p2Name="P2"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("returns null when p2Sliders is undefined", () => {
    const { container } = render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders()}
        p2Sliders={undefined}
        hasChildren={true}
        p1Name="P1"
        p2Name="P2"
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it("renders 8 rows when hasChildren is true", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders()}
        p2Sliders={makeSliders()}
        hasChildren={true}
        p1Name="P1"
        p2Name="P2"
      />
    );

    expect(screen.getByTestId("row-groceries")).toBeInTheDocument();
    expect(screen.getByTestId("row-cooking")).toBeInTheDocument();
    expect(screen.getByTestId("row-cleaning")).toBeInTheDocument();
    expect(screen.getByTestId("row-admin")).toBeInTheDocument();
    expect(screen.getByTestId("row-childrenAppointments")).toBeInTheDocument();
    expect(screen.getByTestId("row-schoolSupport")).toBeInTheDocument();
    expect(screen.getByTestId("row-maintenance")).toBeInTheDocument();
    expect(screen.getByTestId("row-planning")).toBeInTheDocument();
  });

  it("renders 6 rows when hasChildren is false (no child categories)", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders()}
        p2Sliders={makeSliders()}
        hasChildren={false}
        p1Name="P1"
        p2Name="P2"
      />
    );

    expect(screen.queryByTestId("row-childrenAppointments")).toBeNull();
    expect(screen.queryByTestId("row-schoolSupport")).toBeNull();

    expect(screen.getByTestId("row-groceries")).toBeInTheDocument();
    expect(screen.getByTestId("row-cooking")).toBeInTheDocument();
    expect(screen.getByTestId("row-cleaning")).toBeInTheDocument();
    expect(screen.getByTestId("row-admin")).toBeInTheDocument();
    expect(screen.getByTestId("row-maintenance")).toBeInTheDocument();
    expect(screen.getByTestId("row-planning")).toBeInTheDocument();
  });

  it("shows P1 and P2 perception values for each category", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders({ groceries: 75 })}
        p2Sliders={makeSliders({ groceries: 30 })}
        hasChildren={false}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    const row = screen.getByTestId("row-groceries");
    expect(row).toHaveTextContent("75 %");
    expect(row).toHaveTextContent("30 %");
  });

  it("shows the absolute gap between P1 and P2 values for each category", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders({ cooking: 80 })}
        p2Sliders={makeSliders({ cooking: 50 })}
        hasChildren={false}
        p1Name="P1"
        p2Name="P2"
      />
    );

    const row = screen.getByTestId("row-cooking");
    // gap = |80 - 50| = 30
    expect(row).toHaveTextContent("30");
  });

  it("rows with gap > 15 have bg-accent-light class", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders({ cleaning: 80 })}
        p2Sliders={makeSliders({ cleaning: 60 })}
        hasChildren={false}
        p1Name="P1"
        p2Name="P2"
      />
    );

    const row = screen.getByTestId("row-cleaning");
    // gap = |80 - 60| = 20 > 15 → highlighted
    expect(row.className).toContain("bg-accent-light");
  });

  it("rows with gap <= 15 do not have bg-accent-light class", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders({ admin: 60 })}
        p2Sliders={makeSliders({ admin: 50 })}
        hasChildren={false}
        p1Name="P1"
        p2Name="P2"
      />
    );

    const row = screen.getByTestId("row-admin");
    // gap = |60 - 50| = 10 <= 15 → not highlighted
    expect(row.className).not.toContain("bg-accent-light");
  });

  it("shows a contextual alert message when any gap > 15 points", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders({ maintenance: 90 })}
        p2Sliders={makeSliders({ maintenance: 50 })}
        hasChildren={false}
        p1Name="P1"
        p2Name="P2"
      />
    );

    // gap = |90 - 50| = 40 > 15 → alert shown
    expect(screen.getByText(/Des écarts significatifs ont été détectés/i)).toBeInTheDocument();
  });

  it("does not show the alert message when all gaps are <= 15 points", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders()}
        p2Sliders={makeSliders()}
        hasChildren={false}
        p1Name="P1"
        p2Name="P2"
      />
    );

    // all gaps = 0 → no alert
    expect(screen.queryByText(/Des écarts significatifs ont été détectés/i)).toBeNull();
  });

  it("does not show child categories 'RDV enfants' and 'Aide scolaire' when hasChildren is false", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders()}
        p2Sliders={makeSliders()}
        hasChildren={false}
        p1Name="P1"
        p2Name="P2"
      />
    );

    expect(screen.queryByText("RDV enfants")).toBeNull();
    expect(screen.queryByText("Aide scolaire")).toBeNull();
  });

  it("shows all 8 category labels when hasChildren is true", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders()}
        p2Sliders={makeSliders()}
        hasChildren={true}
        p1Name="P1"
        p2Name="P2"
      />
    );

    expect(screen.getByText("Courses")).toBeInTheDocument();
    expect(screen.getByText("Cuisine")).toBeInTheDocument();
    expect(screen.getByText("Ménage")).toBeInTheDocument();
    expect(screen.getByText("Administratif")).toBeInTheDocument();
    expect(screen.getByText("RDV enfants")).toBeInTheDocument();
    expect(screen.getByText("Aide scolaire")).toBeInTheDocument();
    expect(screen.getByText("Bricolage")).toBeInTheDocument();
    expect(screen.getByText("Organisation")).toBeInTheDocument();
  });

  it("shows p1Name and p2Name as column headers", () => {
    render(
      <PerceptionConfrontation
        mode="shared"
        p1Sliders={makeSliders()}
        p2Sliders={makeSliders()}
        hasChildren={true}
        p1Name="Alice"
        p2Name="Bob"
      />
    );

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });
});
