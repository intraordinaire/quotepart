import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getFullLink, getP2InviteLink } from "@/lib/shareLink";
import { decodeState } from "@/lib/urlState";
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
    workQuota: 0.8,
    fullTimeIncome: 3125,
    partTimeReason: "couple-choice",
  },
  commonCharges: 1500,
  hasChildren: true,
  domesticSliders: {
    p1: {
      groceries: 60,
      cooking: 70,
      cleaning: 50,
      admin: 40,
      childrenAppointments: 30,
      schoolSupport: 50,
      maintenance: 80,
      planning: 55,
    },
    p2: {
      groceries: 40,
      cooking: 30,
      cleaning: 50,
      admin: 60,
      childrenAppointments: 70,
      schoolSupport: 50,
      maintenance: 20,
      planning: 45,
    },
  },
  hourlyRate: 9.52,
};

const BASE_URL = "https://example.com";

beforeEach(() => {
  vi.stubGlobal("window", { location: { origin: BASE_URL } });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("getFullLink", () => {
  it("generates a valid URL", () => {
    const link = getFullLink(fullInput);
    expect(() => new URL(link)).not.toThrow();
  });

  it("encodes the entire SimulationInput", () => {
    const link = getFullLink(fullInput);
    const url = new URL(link);
    const data = url.searchParams.get("data");
    expect(data).not.toBeNull();
    expect(data!.length).toBeGreaterThan(50);
  });

  it("includes P1 income in the encoded data", () => {
    const link = getFullLink(fullInput);
    const url = new URL(link);
    const data = url.searchParams.get("data")!;
    const decoded = decodeState(data);
    expect(decoded).not.toBeNull();
    expect(decoded!.p1.income).toBe(3000);
  });
});

describe("getP2InviteLink", () => {
  it("generates a valid URL pointing to /simulate/p2", () => {
    const link = getP2InviteLink(fullInput);
    const url = new URL(link);
    expect(url.pathname).toBe("/simulate/p2");
  });

  it("encodes the full SimulationInput (soft privacy)", () => {
    const link = getP2InviteLink(fullInput);
    const url = new URL(link);
    const data = url.searchParams.get("data")!;
    const decoded = decodeState(data);
    expect(decoded).not.toBeNull();
    expect(decoded!.commonCharges).toBe(1500);
    expect(decoded!.hasChildren).toBe(true);
    expect(decoded!.p1.income).toBe(3000);
    expect(decoded!.p1.name).toBe("P1");
  });

  it("round-trips accented French names", () => {
    const accentedInput: SimulationInput = {
      ...fullInput,
      p1: { ...fullInput.p1, name: "Élodie" },
      p2: { ...fullInput.p2, name: "François" },
    };
    const link = getP2InviteLink(accentedInput);
    const url = new URL(link);
    const data = url.searchParams.get("data")!;
    const decoded = decodeState(data);
    expect(decoded).not.toBeNull();
    expect(decoded!.p1.name).toBe("Élodie");
    expect(decoded!.p2.name).toBe("François");
  });
});
