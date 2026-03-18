import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getFullLink, getP2InviteLink } from "@/lib/shareLink";
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
    // The encoded data should contain P1's income when decoded
    const decoded = JSON.parse(atob(data.replace(/-/g, "+").replace(/_/g, "/")));
    expect(decoded.p1.income).toBe(3000);
  });
});

describe("getP2InviteLink", () => {
  it("generates a valid URL pointing to /simulate/p2", () => {
    const link = getP2InviteLink(fullInput);
    const url = new URL(link);
    expect(url.pathname).toBe("/simulate/p2");
  });

  it("includes common charges in the encoded data", () => {
    const link = getP2InviteLink(fullInput);
    const url = new URL(link);
    const data = url.searchParams.get("data")!;
    const decoded = JSON.parse(atob(data.replace(/-/g, "+").replace(/_/g, "/")));
    expect(decoded.commonCharges).toBe(1500);
    expect(decoded.hasChildren).toBe(true);
  });

  it("does NOT include P1 income in the P2 invite link", () => {
    const link = getP2InviteLink(fullInput);
    const url = new URL(link);
    const data = url.searchParams.get("data")!;
    const decoded = JSON.parse(atob(data.replace(/-/g, "+").replace(/_/g, "/")));
    // P1 income should be stripped from the P2 invite payload
    expect(decoded.p1Income).toBeUndefined();
    expect(decoded.p2Income).toBeUndefined();
    // Only shared data fields should be present
    expect(decoded.p1).toBeUndefined();
    expect(decoded.p2).toBeUndefined();
  });

  it("P2 invite link is shorter than full link (less data)", () => {
    const fullLink = getFullLink(fullInput);
    const inviteLink = getP2InviteLink(fullInput);
    expect(inviteLink.length).toBeLessThan(fullLink.length);
  });
});
