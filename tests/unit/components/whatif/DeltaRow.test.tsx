import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { DeltaRow } from "@/components/whatif/DeltaRow";

describe("DeltaRow", () => {
  it("shows label, before value, and after value", () => {
    render(<DeltaRow label="Contribution P1" before={500} after={600} />);

    expect(screen.getByText("Contribution P1")).toBeInTheDocument();
    expect(screen.getByText("500 €")).toBeInTheDocument();
    expect(screen.getByText("600 €")).toBeInTheDocument();
  });

  it("shows no delta indicator when values are equal", () => {
    const { container } = render(<DeltaRow label="Contribution P1" before={500} after={500} />);

    expect(screen.queryByText("↑")).not.toBeInTheDocument();
    expect(screen.queryByText("↓")).not.toBeInTheDocument();
    // No diff amount shown
    expect(screen.queryByText(/[+-]/)).not.toBeInTheDocument();
    // No green/red color classes
    expect(container.querySelector(".text-green")).not.toBeInTheDocument();
    expect(container.querySelector(".text-red")).not.toBeInTheDocument();
  });

  it("shows green ↓ arrow and green text when after < before (improvement)", () => {
    render(<DeltaRow label="Contribution P1" before={500} after={237} />);

    expect(screen.getByText("↓")).toBeInTheDocument();
    expect(screen.getByText("- 263 €")).toBeInTheDocument();

    const indicator = screen.getByText("↓").closest("[data-testid='delta-indicator']");
    expect(indicator).toHaveClass("text-green");
  });

  it("shows red ↑ arrow when after > before (worse)", () => {
    render(<DeltaRow label="Contribution P1" before={500} after={624} />);

    expect(screen.getByText("↑")).toBeInTheDocument();
    expect(screen.getByText("+ 124 €")).toBeInTheDocument();

    const indicator = screen.getByText("↑").closest("[data-testid='delta-indicator']");
    expect(indicator).toHaveClass("text-red");
  });

  it("shows diff amount with correct sign and formatting", () => {
    render(<DeltaRow label="Gap" before={1000} after={1263} />);

    expect(screen.getByText("+ 263 €")).toBeInTheDocument();
  });

  it("highlights row background when changed prop is true", () => {
    const { container } = render(
      <DeltaRow label="Contribution P1" before={500} after={600} changed />
    );

    const row = container.firstElementChild;
    expect(row).toHaveClass("bg-accent-dim");
  });

  it("does not highlight row background when changed prop is false", () => {
    const { container } = render(<DeltaRow label="Contribution P1" before={500} after={600} />);

    const row = container.firstElementChild;
    expect(row).not.toHaveClass("bg-accent-dim");
  });

  it("uses custom format function when provided", () => {
    const format = (v: number): string => `${v.toFixed(1)} %`;

    render(<DeltaRow label="Equity score" before={0.85} after={0.92} format={format} />);

    expect(screen.getByText("0.9 %")).toBeInTheDocument();
    expect(screen.getByText("0.8 %")).toBeInTheDocument();
  });

  it("reverses colors when reverseColors is true (higher = better)", () => {
    render(<DeltaRow label="Equity score" before={80} after={95} reverseColors />);

    // Higher is better → green ↑
    const indicator = screen.getByText("↑").closest("[data-testid='delta-indicator']");
    expect(indicator).toHaveClass("text-green");
  });

  it("reverses colors for decrease when reverseColors is true (lower = worse)", () => {
    render(<DeltaRow label="Equity score" before={95} after={80} reverseColors />);

    // Lower is worse → red ↓
    const indicator = screen.getByText("↓").closest("[data-testid='delta-indicator']");
    expect(indicator).toHaveClass("text-red");
  });
});
