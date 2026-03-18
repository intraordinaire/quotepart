import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { WhatIfSummary } from "@/components/whatif/WhatIfSummary";

describe("WhatIfSummary", () => {
  it("shows green box when equity gap decreased (improvement)", () => {
    const { container } = render(
      <WhatIfSummary p1Name="Alice" p2Name="Bob" beforeGap={400} afterGap={200} />
    );

    const box = container.firstElementChild as HTMLElement;
    expect(box.className).toContain("bg-green-dim");
    expect(box.className).toContain("border-green");
  });

  it("shows amber/warning box when equity gap increased", () => {
    const { container } = render(
      <WhatIfSummary p1Name="Alice" p2Name="Bob" beforeGap={200} afterGap={400} />
    );

    const box = container.firstElementChild as HTMLElement;
    expect(box.className).toContain("bg-amber-dim");
    expect(box.className).toContain("border-amber");
  });

  it("narrative uses real names and gap values", () => {
    render(<WhatIfSummary p1Name="Alice" p2Name="Bob" beforeGap={400} afterGap={200} />);

    expect(
      screen.getByText(
        /L'écart de revenu disponible entre Alice et Bob passe de 400 € à 200 € par mois/
      )
    ).toBeInTheDocument();
  });

  it("shows annual impact when gap decreased", () => {
    render(<WhatIfSummary p1Name="Alice" p2Name="Bob" beforeGap={400} afterGap={200} />);

    // (400 - 200) * 12 = 2400
    expect(screen.getByText(/2.400 € d'écart en moins par an/)).toBeInTheDocument();
  });

  it("shows annual impact when gap increased", () => {
    render(<WhatIfSummary p1Name="Alice" p2Name="Bob" beforeGap={200} afterGap={500} />);

    // (500 - 200) * 12 = 3600
    expect(screen.getByText(/3.600 € d'écart en plus par an/)).toBeInTheDocument();
  });

  it("shows neutral message when nothing has changed", () => {
    const { container } = render(
      <WhatIfSummary p1Name="Alice" p2Name="Bob" beforeGap={300} afterGap={300} />
    );

    expect(
      screen.getByText(/Aucun changement sur l'écart de revenu disponible/)
    ).toBeInTheDocument();

    const box = container.firstElementChild as HTMLElement;
    expect(box.className).toContain("bg-surface");
    expect(box.className).toContain("border-border");
  });
});
