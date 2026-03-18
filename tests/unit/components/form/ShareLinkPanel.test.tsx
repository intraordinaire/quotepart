import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ShareLinkPanel } from "@/components/form/ShareLinkPanel";
import type { SimulationInput } from "@/domain/types";

const fullInput: SimulationInput = {
  p1: {
    name: "P1",
    income: 3000,
    personalCharges: 400,
    workQuota: 1.0,
    fullTimeIncome: 3000,
    partTimeReason: null,
  },
  p2: {
    name: "P2",
    income: 2500,
    personalCharges: 300,
    workQuota: 1.0,
    fullTimeIncome: 2500,
    partTimeReason: null,
  },
  commonCharges: 1500,
  hasChildren: false,
  domesticSliders: {
    p1: {
      groceries: 50,
      cooking: 50,
      cleaning: 50,
      admin: 50,
      childrenAppointments: 50,
      schoolSupport: 50,
      maintenance: 50,
      planning: 50,
    },
  },
  hourlyRate: 9.52,
};

describe("ShareLinkPanel", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
  });

  it("shows the full simulation link", () => {
    render(<ShareLinkPanel input={fullInput} mode="full" />);
    const value = (screen.getByRole("textbox") as HTMLInputElement).value;
    expect(value).toContain("/simulate?data=");
  });

  it("shows a Copier button", () => {
    render(<ShareLinkPanel input={fullInput} mode="full" />);
    expect(screen.getByRole("button", { name: /copier/i })).toBeInTheDocument();
  });

  it("shows confirmation message after clicking Copier", async () => {
    render(<ShareLinkPanel input={fullInput} mode="full" />);
    fireEvent.click(screen.getByRole("button", { name: /copier/i }));
    await waitFor(() => {
      expect(screen.getByText(/copié/i)).toBeInTheDocument();
    });
  });

  it("shows P2 invite section when mode is shared", () => {
    render(<ShareLinkPanel input={fullInput} mode="shared" />);
    expect(screen.getByText(/inviter/i)).toBeInTheDocument();
  });

  it("P2 invite link contains /simulate/p2 path", () => {
    render(<ShareLinkPanel input={fullInput} mode="shared" />);
    const inputs = screen.getAllByRole("textbox");
    const values = inputs.map((el) => (el as HTMLInputElement).value);
    expect(values.some((v) => v.includes("/simulate/p2?data="))).toBe(true);
  });

  it("P2 invite link differs from full link", () => {
    render(<ShareLinkPanel input={fullInput} mode="shared" />);
    const inputs = screen.getAllByRole("textbox");
    const values = inputs.map((el) => (el as HTMLInputElement).value);
    const fullLinkValue = values.find((v) => v.includes("/simulate?data="));
    const p2LinkValue = values.find((v) => v.includes("/simulate/p2?data="));
    expect(fullLinkValue).toBeDefined();
    expect(p2LinkValue).toBeDefined();
    expect(fullLinkValue).not.toBe(p2LinkValue);
  });
});
