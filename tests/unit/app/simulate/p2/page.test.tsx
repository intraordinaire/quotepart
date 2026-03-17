import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import * as useSimulationModule from "@/context/useSimulation";
import * as nextNavigation from "next/navigation";
import type { SimulationState, SimulationAction } from "@/context/SimulationContext";
import type { Dispatch } from "react";
import { getP2InviteLink } from "@/lib/shareLink";
import type { SimulationInput } from "@/domain/types";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn(), replace: vi.fn() })),
}));

vi.mock("@/context/useSimulation");

// Mock the form components to keep tests focused
vi.mock("@/components/form/Tier1Incomes", () => ({
  Tier1Incomes: (): React.JSX.Element => <div data-testid="tier1-incomes">Tier1Incomes</div>,
}));
vi.mock("@/components/form/Tier2PersonalCharges", () => ({
  Tier2PersonalCharges: (): React.JSX.Element => <div data-testid="tier2">Tier2</div>,
}));
vi.mock("@/components/form/Tier3WorkTime", () => ({
  Tier3WorkTime: (): React.JSX.Element => <div data-testid="tier3">Tier3</div>,
}));
vi.mock("@/components/form/Tier4Domestic", () => ({
  Tier4Domestic: (): React.JSX.Element => <div data-testid="tier4">Tier4</div>,
}));
vi.mock("@/components/form/TierNav", () => ({
  TierNav: (): React.JSX.Element => <div data-testid="tier-nav">TierNav</div>,
}));
vi.mock("@/components/results/ResultsShell", () => ({
  ResultsShell: (): React.JSX.Element => <div data-testid="results-shell">ResultsShell</div>,
}));

const dispatchSpy = vi.fn();
const mockDispatch = dispatchSpy as unknown as Dispatch<SimulationAction>;

function makeState(overrides: Partial<SimulationState> = {}): SimulationState {
  return {
    mode: "shared",
    activeTier: 1,
    completedTiers: new Set<1 | 2 | 3 | 4>(),
    skippedTiers: new Set<2 | 3 | 4>(),
    input: {},
    ...overrides,
  };
}

const sampleInput: SimulationInput = {
  p1: {
    name: "Alice",
    income: 3000,
    personalCharges: 400,
    workQuota: 1.0,
    fullTimeIncome: 3000,
    partTimeReason: null,
  },
  p2: {
    name: "P2",
    income: 0,
    personalCharges: 0,
    workQuota: 1.0,
    fullTimeIncome: 0,
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
  hourlyRate: 9.57,
};

function buildP2DataParam(): string {
  const link = getP2InviteLink(sampleInput);
  // getP2InviteLink uses window.location.origin which is empty in tests
  // so the URL won't have a valid origin — parse with a base
  try {
    return new URL(link, "http://localhost").searchParams.get("data") ?? "";
  } catch {
    // link might be relative (no origin in test env)
    const idx = link.indexOf("?data=");
    return idx >= 0 ? link.slice(idx + 6) : "";
  }
}

function mockSearchParams(data: string | null): void {
  vi.mocked(nextNavigation.useSearchParams).mockReturnValue(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { get: (key: string) => (key === "data" ? data : null) } as any
  );
}

describe("P2Page", () => {
  let P2Page: React.ComponentType;

  beforeEach(async () => {
    dispatchSpy.mockClear();
    vi.mocked(useSimulationModule.useSimulation).mockReturnValue({
      state: makeState(),
      dispatch: mockDispatch,
    });
    vi.resetModules();
    const mod = await import("@/app/simulate/p2/page");
    P2Page = mod.default;
  });

  it("shows P1 name in the welcome banner when data param is valid", () => {
    mockSearchParams(buildP2DataParam());
    render(<P2Page />);
    expect(screen.getByText(/alice/i)).toBeInTheDocument();
  });

  it("does not display P1 income value in the page", () => {
    mockSearchParams(buildP2DataParam());
    render(<P2Page />);
    // P1 income 3000 should not appear as visible text
    const content = document.body.textContent ?? "";
    expect(content).not.toMatch(/\b3000\b/);
  });

  it("shows error message when data param is missing", () => {
    mockSearchParams(null);
    render(<P2Page />);
    expect(screen.getByText(/lien invalide/i)).toBeInTheDocument();
  });

  it("shows error message when data param is malformed", () => {
    mockSearchParams("not-valid!!!");
    render(<P2Page />);
    expect(screen.getByText(/lien invalide/i)).toBeInTheDocument();
  });

  it("shows the tier 1 form for P2 to fill their data", () => {
    mockSearchParams(buildP2DataParam());
    render(<P2Page />);
    expect(screen.getByTestId("tier1-incomes")).toBeInTheDocument();
  });
});
