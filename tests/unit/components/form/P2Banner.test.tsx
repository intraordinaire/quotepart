import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { P2Banner } from "@/components/form/P2Banner";

describe("P2Banner", () => {
  it("shows P1 name in welcome message", () => {
    render(<P2Banner p1Name="Marie" />);
    expect(screen.getByText(/marie/i)).toBeInTheDocument();
  });

  it("shows invite message", () => {
    render(<P2Banner p1Name="Marie" />);
    expect(screen.getByText(/invite/i)).toBeInTheDocument();
  });

  it("uses fallback when p1Name is empty", () => {
    render(<P2Banner p1Name="" />);
    expect(screen.getByText(/personne 1/i)).toBeInTheDocument();
  });
});
