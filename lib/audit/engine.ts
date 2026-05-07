// Audit engine — pure logic, no I/O, no AI.
// Each rule is intentionally a small named function so a finance person can
// read PRICING_DATA.md alongside this file and audit our reasoning.

import { TOOLS, getPlan } from "./pricing";
import type {
  AuditInput,
  AuditResult,
  ToolFinding,
  ToolInput,
  ToolId,
  FindingSeverity,
} from "./types";

// ---------- helpers ----------

function round(n: number): number {
  return Math.round(n * 100) / 100;
}

function severityFromSavings(monthlySavings: number): FindingSeverity {
  if (monthlySavings >= 50) return "save_big";
  if (monthlySavings >= 5) return "save_some";
  return "optimal";
}

function emptyFinding(input: ToolInput, reason: string): ToolFinding {
  return {
    tool: input.tool,
    toolLabel: TOOLS[input.tool].label,
    currentSpend: input.monthlySpend,
    recommendedSpend: input.monthlySpend,
    monthlySavings: 0,
    action: "Keep current plan",
    reason,
    severity: "optimal",
  };
}

// ---------- per-tool rules ----------

/**
 * Cursor: most common waste is teams on Business with no SSO need, or single
 * users on Pro who barely code. Windsurf Pro is the cross-tool downgrade.
 */
function auditCursor(input: ToolInput, ctx: AuditInput): ToolFinding {
  const plan = getPlan("cursor", input.plan);
  if (!plan) return emptyFinding(input, "Plan not recognized — keeping as-is.");

  // Business → Pro when team is small and SSO not implied (we proxy SSO need via teamSize)
  if (input.plan === "business" && ctx.teamSize < 10) {
    const newSpend = 20 * input.seats;
    const savings = input.monthlySpend - newSpend;
    if (savings > 0) {
      return {
        tool: "cursor",
        toolLabel: "Cursor",
        currentSpend: input.monthlySpend,
        recommendedSpend: newSpend,
        monthlySavings: round(savings),
        action: `Downgrade to Cursor Pro × ${input.seats} seat${input.seats > 1 ? "s" : ""}`,
        reason: `Cursor Business ($40/seat) is only worth the premium when SSO and centralized admin are required. With ${ctx.teamSize} team member${ctx.teamSize === 1 ? "" : "s"}, Pro at $20/seat covers the same model access.`,
        severity: severityFromSavings(savings),
        alternativePlan: "pro",
      };
    }
  }

  // Ultra → Pro for non-heavy users
  if (input.plan === "ultra" && input.intensity !== "heavy") {
    const newSpend = 20 * input.seats;
    const savings = input.monthlySpend - newSpend;
    return {
      tool: "cursor",
      toolLabel: "Cursor",
      currentSpend: input.monthlySpend,
      recommendedSpend: newSpend,
      monthlySavings: round(savings),
      action: "Downgrade to Cursor Pro",
      reason: "Cursor Ultra at $200/seat is only justified when you're routinely hitting Pro's 500 fast-request ceiling. Most Pro users don't.",
      severity: severityFromSavings(savings),
      alternativePlan: "pro",
    };
  }

  // Pro single-user, occasional usage → Hobby (free)
  if (input.plan === "pro" && input.seats === 1 && input.intensity === "occasional") {
    const savings = input.monthlySpend;
    return {
      tool: "cursor",
      toolLabel: "Cursor",
      currentSpend: input.monthlySpend,
      recommendedSpend: 0,
      monthlySavings: round(savings),
      action: "Downgrade to Cursor Hobby (free)",
      reason: "You self-reported occasional usage. Hobby's 2,000 completions/month is enough for light coding — upgrade only when you hit the limit.",
      severity: severityFromSavings(savings),
      alternativePlan: "hobby",
    };
  }

  // Cross-tool: Cursor Pro coder → Windsurf Pro saves $5/seat
  if (input.plan === "pro" && ctx.useCase === "coding" && input.intensity !== "heavy") {
    const newSpend = 15 * input.seats;
    const savings = input.monthlySpend - newSpend;
    if (savings > 0) {
      return {
        tool: "cursor",
        toolLabel: "Cursor",
        currentSpend: input.monthlySpend,
        recommendedSpend: newSpend,
        monthlySavings: round(savings),
        action: `Try Windsurf Pro × ${input.seats}`,
        reason: "Windsurf Pro at $15/seat ships comparable tab-completion + agent features for most coding workflows. Worth a 1-week trial before renewing Cursor.",
        severity: severityFromSavings(savings),
        alternativePlan: "pro",
        alternativeTool: "windsurf",
      };
    }
  }

  return emptyFinding(input, "You're on the right Cursor plan for your usage.");
}

/**
 * Claude: the big trap is the 5-seat Team minimum. Tiny teams get wrecked.
 */
function auditClaude(input: ToolInput, ctx: AuditInput): ToolFinding {
  const plan = getPlan("claude", input.plan);
  if (!plan) return emptyFinding(input, "Plan not recognized.");

  // Team plan with under-utilized seats: Team forces 5 seats at $30 = $150 floor
  if (input.plan === "team" && ctx.teamSize < 5) {
    const proSpend = 20 * ctx.teamSize;
    const savings = input.monthlySpend - proSpend;
    if (savings > 0) {
      return {
        tool: "claude",
        toolLabel: "Claude",
        currentSpend: input.monthlySpend,
        recommendedSpend: proSpend,
        monthlySavings: round(savings),
        action: `Cancel Team, switch to ${ctx.teamSize}× Claude Pro`,
        reason: `Claude Team requires a 5-seat minimum at $30/seat = $150/mo floor. With ${ctx.teamSize} actual user${ctx.teamSize === 1 ? "" : "s"}, individual Pro accounts at $20/seat are honest pricing.`,
        severity: severityFromSavings(savings),
        alternativePlan: "pro",
      };
    }
  }

  // Max plans for non-heavy users
  if ((input.plan === "max5" || input.plan === "max20") && input.intensity !== "heavy") {
    const newSpend = 20 * input.seats;
    const savings = input.monthlySpend - newSpend;
    return {
      tool: "claude",
      toolLabel: "Claude",
      currentSpend: input.monthlySpend,
      recommendedSpend: newSpend,
      monthlySavings: round(savings),
      action: "Downgrade to Claude Pro",
      reason: "Max plans only pay off when you're hitting Pro's ~5-hour message limits weekly. Pro is the right tier for regular use.",
      severity: severityFromSavings(savings),
      alternativePlan: "pro",
    };
  }

  // Pro single user, occasional → Free
  if (input.plan === "pro" && input.intensity === "occasional") {
    const savings = input.monthlySpend;
    return {
      tool: "claude",
      toolLabel: "Claude",
      currentSpend: input.monthlySpend,
      recommendedSpend: 0,
      monthlySavings: round(savings),
      action: "Downgrade to Claude Free",
      reason: "Free tier handles occasional Sonnet use. Upgrade only when you start hitting daily limits.",
      severity: severityFromSavings(savings),
      alternativePlan: "free",
    };
  }

  return emptyFinding(input, "You're on the right Claude plan for your usage.");
}

/**
 * ChatGPT: Pro at $200 is the trap. Plus + API is almost always cheaper.
 */
function auditChatGpt(input: ToolInput, _ctx: AuditInput): ToolFinding {
  const plan = getPlan("chatgpt", input.plan);
  if (!plan) return emptyFinding(input, "Plan not recognized.");

  if (input.plan === "pro" && input.intensity !== "heavy") {
    const newSpend = 20 * input.seats;
    const savings = input.monthlySpend - newSpend;
    return {
      tool: "chatgpt",
      toolLabel: "ChatGPT",
      currentSpend: input.monthlySpend,
      recommendedSpend: newSpend,
      monthlySavings: round(savings),
      action: "Downgrade to ChatGPT Plus",
      reason: "Pro's $200/mo is only worth it for daily o1-pro users. Plus + occasional API use covers 95% of workflows for $20.",
      severity: severityFromSavings(savings),
      alternativePlan: "plus",
    };
  }

  if (input.plan === "plus" && input.intensity === "occasional") {
    const savings = input.monthlySpend;
    return {
      tool: "chatgpt",
      toolLabel: "ChatGPT",
      currentSpend: input.monthlySpend,
      recommendedSpend: 0,
      monthlySavings: round(savings),
      action: "Downgrade to Free",
      reason: "ChatGPT Free now includes GPT-4o with limits — sufficient for occasional use.",
      severity: severityFromSavings(savings),
      alternativePlan: "free",
    };
  }

  return emptyFinding(input, "You're on the right ChatGPT plan for your usage.");
}

/**
 * Copilot: cheap to begin with. Mostly check Business is justified.
 */
function auditCopilot(input: ToolInput, ctx: AuditInput): ToolFinding {
  const plan = getPlan("copilot", input.plan);
  if (!plan) return emptyFinding(input, "Plan not recognized.");

  if (input.plan === "business" && ctx.teamSize < 5) {
    const newSpend = 10 * input.seats;
    const savings = input.monthlySpend - newSpend;
    if (savings > 0) {
      return {
        tool: "copilot",
        toolLabel: "GitHub Copilot",
        currentSpend: input.monthlySpend,
        recommendedSpend: newSpend,
        monthlySavings: round(savings),
        action: `Downgrade to Copilot Pro × ${input.seats}`,
        reason: "Copilot Business ($19/seat) is worth it for IP indemnity, audit logs, and org policy. Under 5 seats with no compliance requirement, individual Pro at $10/seat is the right tier.",
        severity: severityFromSavings(savings),
        alternativePlan: "pro",
      };
    }
  }

  if (input.plan === "pro_plus" && input.intensity !== "heavy") {
    const newSpend = 10 * input.seats;
    const savings = input.monthlySpend - newSpend;
    return {
      tool: "copilot",
      toolLabel: "GitHub Copilot",
      currentSpend: input.monthlySpend,
      recommendedSpend: newSpend,
      monthlySavings: round(savings),
      action: "Downgrade to Copilot Pro",
      reason: "Pro+ at $39/seat unlocks 1,500 premium requests and Opus/o3 — only justified for heavy users routinely exceeding Pro's 300/mo cap.",
      severity: severityFromSavings(savings),
      alternativePlan: "pro",
    };
  }

  return emptyFinding(input, "You're on the right Copilot plan — it's already one of the cheapest options.");
}

/**
 * Gemini: AI Ultra at $250 almost never justified.
 */
function auditGemini(input: ToolInput, _ctx: AuditInput): ToolFinding {
  if (input.plan === "ai_ultra" && input.intensity !== "heavy") {
    const newSpend = 20 * input.seats;
    const savings = input.monthlySpend - newSpend;
    return {
      tool: "gemini",
      toolLabel: "Gemini",
      currentSpend: input.monthlySpend,
      recommendedSpend: newSpend,
      monthlySavings: round(savings),
      action: "Downgrade to Gemini AI Pro",
      reason: "AI Ultra ($250/seat) bundles Veo 3 video and 30TB storage — only worth it if you actively use those. AI Pro covers Gemini 2.5 Pro + Deep Research for $20.",
      severity: severityFromSavings(savings),
      alternativePlan: "ai_pro",
    };
  }
  return emptyFinding(input, "You're on the right Gemini plan for your usage.");
}

/**
 * Windsurf: cheap baseline. Only check Teams.
 */
function auditWindsurf(input: ToolInput, ctx: AuditInput): ToolFinding {
  if (input.plan === "teams" && ctx.teamSize < 5) {
    const newSpend = 15 * input.seats;
    const savings = input.monthlySpend - newSpend;
    if (savings > 0) {
      return {
        tool: "windsurf",
        toolLabel: "Windsurf",
        currentSpend: input.monthlySpend,
        recommendedSpend: newSpend,
        monthlySavings: round(savings),
        action: `Downgrade to Windsurf Pro × ${input.seats}`,
        reason: "Windsurf Teams adds SSO and admin for $15/seat extra — only worth it under compliance requirements.",
        severity: severityFromSavings(savings),
        alternativePlan: "pro",
      };
    }
  }
  return emptyFinding(input, "You're on the right Windsurf plan for your usage.");
}

/**
 * API tools: we don't model tokens. We benchmark monthly $ and flag heavy
 * spenders for Credex (which is exactly the credit-marketplace fit).
 */
function auditApi(input: ToolInput, _ctx: AuditInput): ToolFinding {
  const label = TOOLS[input.tool].label;

  // Heavy API spend is the Credex bullseye — savings are 15-25% on credits
  if (input.monthlySpend >= 1000) {
    const savings = input.monthlySpend * 0.2;
    return {
      tool: input.tool,
      toolLabel: label,
      currentSpend: input.monthlySpend,
      recommendedSpend: round(input.monthlySpend - savings),
      monthlySavings: round(savings),
      action: "Buy credits through Credex (≈20% off retail)",
      reason: `At $${input.monthlySpend.toFixed(0)}/mo, retail API pricing is the costliest path. Credits sourced from companies that overforecast typically save 15–25% with no behavior change.`,
      severity: "save_big",
    };
  }

  // Mid API spend → cheaper-model swap
  if (input.monthlySpend >= 200) {
    const savings = input.monthlySpend * 0.4;
    return {
      tool: input.tool,
      toolLabel: label,
      currentSpend: input.monthlySpend,
      recommendedSpend: round(input.monthlySpend - savings),
      monthlySavings: round(savings),
      action: "Route 70% of traffic to a cheaper model",
      reason: `If most calls are summarization / classification / extraction, ${input.tool === "anthropic_api" ? "Haiku 4.5" : input.tool === "openai_api" ? "GPT-4o-mini or o3-mini" : "Gemini 2.5 Flash"} is 5–10× cheaper than flagship models with negligible quality loss for those tasks.`,
      severity: "save_some",
    };
  }

  return emptyFinding(input, "API spend is modest — no clear savings without changing usage patterns.");
}

// ---------- dispatcher ----------

const ROUTERS: Record<ToolId, (i: ToolInput, c: AuditInput) => ToolFinding> = {
  cursor: auditCursor,
  copilot: auditCopilot,
  claude: auditClaude,
  chatgpt: auditChatGpt,
  gemini: auditGemini,
  windsurf: auditWindsurf,
  anthropic_api: auditApi,
  openai_api: auditApi,
};

export function runAudit(input: AuditInput): AuditResult {
  const findings: ToolFinding[] = input.tools.map((t) => {
    const router = ROUTERS[t.tool];
    return router ? router(t, input) : emptyFinding(t, "Tool not recognized.");
  });

  const totalCurrentMonthly = round(
    findings.reduce((s, f) => s + f.currentSpend, 0)
  );
  const totalRecommendedMonthly = round(
    findings.reduce((s, f) => s + f.recommendedSpend, 0)
  );
  const totalMonthlySavings = round(totalCurrentMonthly - totalRecommendedMonthly);
  const totalAnnualSavings = round(totalMonthlySavings * 12);

  // Big-savings or heavy-API users qualify for a Credex consultation
  const hasHeavyApi = input.tools.some(
    (t) =>
      (t.tool === "anthropic_api" || t.tool === "openai_api") &&
      t.monthlySpend >= 1000
  );
  const credexEligible = totalMonthlySavings >= 500 || hasHeavyApi;

  const isOptimal = findings.every(
    (f) => f.severity === "optimal" || f.monthlySavings < 5
  );

  const perSeatSpendForBenchmark =
    input.teamSize > 0 ? round(totalCurrentMonthly / input.teamSize) : 0;

  return {
    findings,
    totalCurrentMonthly,
    totalRecommendedMonthly,
    totalMonthlySavings,
    totalAnnualSavings,
    credexEligible,
    isOptimal,
    perSeatSpendForBenchmark,
    generatedAt: new Date().toISOString(),
  };
}
