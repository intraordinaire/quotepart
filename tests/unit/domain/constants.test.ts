import { describe, it, expect } from "vitest";
import {
  DOMESTIC_HOURS,
  DEFAULT_HOURLY_RATE,
  WEEKS_PER_MONTH,
  DEFAULT_SLIDERS,
} from "@/domain/constants";

describe("constants", () => {
  it("domestic hours sum to 28h with children", () => {
    const total = Object.values(DOMESTIC_HOURS).reduce((sum, h) => sum + h, 0);
    expect(total).toBe(28);
  });

  it("domestic hours without child categories sum to 23h", () => {
    const childCategories = ["childrenAppointments", "schoolSupport"];
    const total = (Object.entries(DOMESTIC_HOURS) as [string, number][])
      .filter(([key]) => !childCategories.includes(key))
      .reduce((sum, [, h]) => sum + h, 0);
    expect(total).toBe(23);
  });

  it("SMIC rate is 9.52", () => {
    expect(DEFAULT_HOURLY_RATE).toBe(9.52);
  });

  it("weeks per month multiplier is 4.33", () => {
    expect(WEEKS_PER_MONTH).toBe(4.33);
  });

  it("DEFAULT_SLIDERS has all 8 categories at 50", () => {
    expect(Object.keys(DEFAULT_SLIDERS)).toHaveLength(8);
    Object.values(DEFAULT_SLIDERS).forEach((v) => expect(v).toBe(50));
  });
});
