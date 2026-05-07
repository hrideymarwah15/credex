import { describe, it, expect } from "vitest";
import { runAudit } from "./engine";

describe("audit engine — Claude Team trap (the headline bug)", () => {
  it("flags 2-person team on Claude Team plan and recommends Pro × 2", () => {
    const result = runAudit({
      teamSize: 2,
      useCase: "writing",
      tools: [
        { tool: "claude", plan: "team", monthlySpend: 150, seats: 5 },
      ],
    });

    expect(result.findings[0].action).toContain("Claude Pro");
    expect(result.findings[0].monthlySavings).toBe(110);
    expect(result.totalMonthlySavings).toBe(110);
    expect(result.totalAnnualSavings).toBe(1320);
  });
});

describe("audit engine — Cursor Business overkill", () => {
  it("downgrades Cursor Business to Pro for sub-10-person teams", () => {
    const result = runAudit({
      teamSize: 4,
      useCase: "coding",
      tools: [
        { tool: "cursor", plan: "business", monthlySpend: 160, seats: 4 },
      ],
    });

    expect(result.findings[0].action).toMatch(/Cursor Pro/);
    expect(result.findings[0].monthlySavings).toBe(80);
    expect(result.findings[0].severity).toBe("save_big");
  });

  it("keeps Cursor Business for larger teams (SSO need is plausible)", () => {
    const result = runAudit({
      teamSize: 15,
      useCase: "coding",
      tools: [
        { tool: "cursor", plan: "business", monthlySpend: 600, seats: 15 },
      ],
    });

    expect(result.findings[0].monthlySavings).toBe(0);
    expect(result.findings[0].severity).toBe("optimal");
  });
});

describe("audit engine — ChatGPT Pro $200 trap", () => {
  it("downgrades ChatGPT Pro to Plus for non-heavy users", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "writing",
      tools: [
        { tool: "chatgpt", plan: "pro", monthlySpend: 200, seats: 1, intensity: "regular" },
      ],
    });

    expect(result.findings[0].action).toContain("Plus");
    expect(result.findings[0].monthlySavings).toBe(180);
  });

  it("keeps ChatGPT Pro for self-reported heavy users", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "research",
      tools: [
        { tool: "chatgpt", plan: "pro", monthlySpend: 200, seats: 1, intensity: "heavy" },
      ],
    });

    expect(result.findings[0].monthlySavings).toBe(0);
  });
});

describe("audit engine — heavy API spend triggers Credex eligibility", () => {
  it("flags Credex consultation for >$1k/mo Anthropic API spend", () => {
    const result = runAudit({
      teamSize: 8,
      useCase: "mixed",
      tools: [
        { tool: "anthropic_api", plan: "api", monthlySpend: 2500, seats: 1 },
      ],
    });

    expect(result.credexEligible).toBe(true);
    expect(result.findings[0].monthlySavings).toBe(500);
    expect(result.findings[0].action).toContain("Credex");
  });

  it("does NOT trigger Credex for modest API spend", () => {
    const result = runAudit({
      teamSize: 2,
      useCase: "writing",
      tools: [
        { tool: "openai_api", plan: "api", monthlySpend: 80, seats: 1 },
      ],
    });

    expect(result.credexEligible).toBe(false);
  });
});

describe("audit engine — optimal stack honesty", () => {
  it("returns isOptimal when nothing meaningful to save", () => {
    const result = runAudit({
      teamSize: 1,
      useCase: "coding",
      tools: [
        { tool: "copilot", plan: "pro", monthlySpend: 10, seats: 1 },
        { tool: "claude", plan: "pro", monthlySpend: 20, seats: 1, intensity: "regular" },
      ],
    });

    expect(result.isOptimal).toBe(true);
    expect(result.totalMonthlySavings).toBeLessThan(5);
    expect(result.credexEligible).toBe(false);
  });
});

describe("audit engine — totals math", () => {
  it("sums monthly and annual savings correctly across multiple tools", () => {
    const result = runAudit({
      teamSize: 3,
      useCase: "coding",
      tools: [
        { tool: "cursor", plan: "business", monthlySpend: 120, seats: 3 }, // -> Pro 60
        { tool: "claude", plan: "team", monthlySpend: 150, seats: 5 },     // -> 3x Pro = 60
        { tool: "chatgpt", plan: "pro", monthlySpend: 200, seats: 1, intensity: "regular" }, // -> Plus 20
      ],
    });

    // 60 + 90 + 180 = 330
    expect(result.totalMonthlySavings).toBe(330);
    expect(result.totalAnnualSavings).toBe(3960);
    expect(result.totalCurrentMonthly).toBe(470);
    expect(result.totalRecommendedMonthly).toBe(140);
  });
});
