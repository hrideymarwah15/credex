import { describe, it, expect } from "vitest";
import { generateCsv } from "./csv";
import type { AuditResult } from "@/lib/audit/types";

const mockResult: AuditResult = {
  findings: [
    {
      tool: "cursor",
      toolLabel: "Cursor",
      currentSpend: 160,
      recommendedSpend: 80,
      monthlySavings: 80,
      action: "Downgrade to Cursor Pro",
      reason: "Business plan features unused under 10 seats",
      severity: "save_big",
    },
    {
      tool: "claude",
      toolLabel: 'Claude "Team"',
      currentSpend: 150,
      recommendedSpend: 40,
      monthlySavings: 110,
      action: "Switch to 2x Claude Pro",
      reason: "Team plan forces 5-seat minimum",
      severity: "save_big",
    },
  ],
  totalCurrentMonthly: 310,
  totalRecommendedMonthly: 120,
  totalMonthlySavings: 190,
  totalAnnualSavings: 2280,
  credexEligible: false,
  isOptimal: false,
  perSeatSpendForBenchmark: 155,
  generatedAt: "2026-05-11T00:00:00Z",
};

describe("CSV export", () => {
  it("produces correct CSV format with headers and totals", () => {
    const csv = generateCsv(mockResult);
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Tool,Current Spend,Recommended Spend,Monthly Savings,Annual Savings,Action,Severity");
    expect(lines.length).toBe(4);
    expect(lines[3]).toContain("TOTAL");
    expect(lines[3]).toContain("$190");
  });

  it("handles CSV special characters with escaping", () => {
    const csv = generateCsv(mockResult);
    expect(csv).toContain('"Claude ""Team"""');
  });
});
