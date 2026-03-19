import { describe, it, expect } from "vitest";
import { toFullInput } from "@/lib/inputDefaults";
import { DEFAULT_HOURLY_RATE, DEFAULT_SLIDERS } from "@/domain/constants";

describe("toFullInput", () => {
  it("fills missing fields with defaults", () => {
    const result = toFullInput({
      p1: { name: "A", income: 2000 },
      p2: { name: "B", income: 1500 },
    });
    expect(result.p1.personalCharges).toBe(0);
    expect(result.p1.workQuota).toBe(1.0);
    expect(result.p1.fullTimeIncome).toBe(2000);
    expect(result.p1.partTimeReason).toBeNull();
    expect(result.p2.fullTimeIncome).toBe(1500);
    expect(result.commonCharges).toBe(0);
    expect(result.hasChildren).toBe(false);
    expect(result.hourlyRate).toBe(DEFAULT_HOURLY_RATE);
    expect(result.domesticSliders).toEqual({ p1: DEFAULT_SLIDERS });
  });

  it("preserves existing values", () => {
    const result = toFullInput({
      p1: { name: "A", income: 2000, personalCharges: 300, workQuota: 0.8 },
      p2: { name: "B", income: 1500 },
      commonCharges: 1000,
      hasChildren: true,
    });
    expect(result.p1.personalCharges).toBe(300);
    expect(result.p1.workQuota).toBe(0.8);
    expect(result.commonCharges).toBe(1000);
    expect(result.hasChildren).toBe(true);
  });

  it("handles undefined p1/p2 gracefully", () => {
    const result = toFullInput({});
    expect(result.p1.name).toBe("");
    expect(result.p1.income).toBe(0);
    expect(result.p2.name).toBe("");
  });

  it("uses income as fullTimeIncome fallback", () => {
    const result = toFullInput({
      p1: { income: 3000 },
      p2: { income: 2000 },
    });
    expect(result.p1.fullTimeIncome).toBe(3000);
    expect(result.p2.fullTimeIncome).toBe(2000);
  });
});
