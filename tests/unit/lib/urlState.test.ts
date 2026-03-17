import { describe, it, expect } from "vitest";
import { encodeState, decodeState } from "@/lib/urlState";
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
  hourlyRate: 9.57,
};

const minimalInput: SimulationInput = {
  p1: {
    name: "",
    income: 2000,
    personalCharges: 0,
    workQuota: 1.0,
    fullTimeIncome: 2000,
    partTimeReason: null,
  },
  p2: {
    name: "",
    income: 2000,
    personalCharges: 0,
    workQuota: 1.0,
    fullTimeIncome: 2000,
    partTimeReason: null,
  },
  commonCharges: 1000,
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

describe("urlState", () => {
  it("round-trips a full SimulationInput", () => {
    expect(decodeState(encodeState(fullInput))).toEqual(fullInput);
  });

  it("round-trips a minimal SimulationInput", () => {
    expect(decodeState(encodeState(minimalInput))).toEqual(minimalInput);
  });

  it("produces a URL-safe string (no +, /, =)", () => {
    const encoded = encodeState(fullInput);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("returns null for malformed input", () => {
    expect(decodeState("not-valid-base64!!!")).toBeNull();
  });

  it("returns null when decoded JSON has wrong shape", () => {
    // Encode a valid base64 string with wrong JSON structure
    const bad = btoa(JSON.stringify({ foo: "bar" }))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");
    expect(decodeState(bad)).toBeNull();
  });

  it("returns null for empty string", () => {
    expect(decodeState("")).toBeNull();
  });
});
