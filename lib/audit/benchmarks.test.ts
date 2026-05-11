import { describe, it, expect } from "vitest";
import { getBenchmark } from "./benchmarks";

describe("getBenchmark", () => {
  it("places a coding team of 5 at expected percentile", () => {
    const result = getBenchmark("coding", 5, 47);
    expect(result.percentile).toBeGreaterThan(20);
    expect(result.percentile).toBeLessThan(80);
    expect(result.bucket).toBe("1-5");
    expect(result.cohortP50).toBe(52);
  });

  it("handles edge case of team size 1", () => {
    const result = getBenchmark("coding", 1, 20);
    expect(result.bucket).toBe("1-5");
    expect(result.rating).toBe("below");
    expect(result.percentile).toBeGreaterThanOrEqual(0);
  });

  it("rates above-average spend correctly", () => {
    const result = getBenchmark("mixed", 10, 100);
    expect(result.rating).toBe("above");
    expect(result.percentile).toBeGreaterThan(75);
  });
});
