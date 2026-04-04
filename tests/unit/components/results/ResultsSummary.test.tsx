import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ResultsSummary } from "@/components/results/ResultsSummary";

describe("ResultsSummary", () => {
  const defaultProps = {
    p1Name: "Alice",
    p2Name: "Bob",
    p1Income: 2100,
    p2Income: 2000,
    p1PersonalCharges: 100,
    p2PersonalCharges: 75,
    commonCharges: 1500,
  };

  it("renders both names", () => {
    render(<ResultsSummary {...defaultProps} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("renders formatted incomes", () => {
    render(<ResultsSummary {...defaultProps} />);
    expect(screen.getByText(/2[\s\u00A0\u202F]100[\s\u00A0\u202F]€/)).toBeInTheDocument();
    expect(screen.getByText(/2[\s\u00A0\u202F]000[\s\u00A0\u202F]€/)).toBeInTheDocument();
  });

  it("renders personal charges when > 0", () => {
    render(<ResultsSummary {...defaultProps} />);
    const persoLines = screen.getAllByText(/Ch\. perso/);
    expect(persoLines).toHaveLength(2);
  });

  it("hides personal charges when 0", () => {
    render(<ResultsSummary {...defaultProps} p1PersonalCharges={0} p2PersonalCharges={0} />);
    expect(screen.queryByText(/Ch\. perso/)).not.toBeInTheDocument();
  });

  it("renders common charges", () => {
    render(<ResultsSummary {...defaultProps} />);
    expect(screen.getByText(/Charges communes/)).toBeInTheDocument();
    expect(screen.getByText(/1[\s\u00A0\u202F]500[\s\u00A0\u202F]€/)).toBeInTheDocument();
  });

  it("renders section title", () => {
    render(<ResultsSummary {...defaultProps} />);
    expect(screen.getByText("Vos données")).toBeInTheDocument();
  });
});
