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

  describe("solo mode (role=null)", () => {
    it("shows the full simulation link", () => {
      render(<ShareLinkPanel input={fullInput} mode="full" role={null} />);
      const value = (screen.getByRole("textbox") as HTMLInputElement).value;
      expect(value).toContain("/simulate?data=");
    });

    it("shows a Copier button", () => {
      render(<ShareLinkPanel input={fullInput} mode="full" role={null} />);
      expect(screen.getByRole("button", { name: /copier/i })).toBeInTheDocument();
    });

    it("shows confirmation message after clicking Copier", async () => {
      render(<ShareLinkPanel input={fullInput} mode="full" role={null} />);
      fireEvent.click(screen.getByRole("button", { name: /copier/i }));
      await waitFor(() => {
        expect(screen.getByText(/copié/i)).toBeInTheDocument();
      });
    });
  });

  describe("P1 shared mode (role=p1)", () => {
    it("shows P2 invite link", () => {
      render(<ShareLinkPanel input={fullInput} mode="shared" role="p1" />);
      expect(screen.getByText(/inviter/i)).toBeInTheDocument();
    });

    it("P2 invite link contains /simulate/p2 path", () => {
      render(<ShareLinkPanel input={fullInput} mode="shared" role="p1" />);
      const value = (screen.getByRole("textbox") as HTMLInputElement).value;
      expect(value).toContain("/simulate/p2?data=");
    });
  });

  describe("P2 mode (role=p2)", () => {
    it("shows results link with /simulate?data= path", () => {
      render(<ShareLinkPanel input={fullInput} mode="shared" role="p2" />);
      const value = (screen.getByRole("textbox") as HTMLInputElement).value;
      expect(value).toContain("/simulate?data=");
    });

    it("mentions sharing with partner", () => {
      render(<ShareLinkPanel input={fullInput} mode="shared" role="p2" />);
      expect(screen.getByText(/partenaire/i)).toBeInTheDocument();
    });
  });
});
