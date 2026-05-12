import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";
import type { AuditInput, AuditResult } from "@/lib/audit/types";
import { formatUsd } from "@/lib/utils";

export const runtime = "nodejs";

const Body = z.object({
  input: z.object({
    teamSize: z.number().int().min(1).max(10000),
    useCase: z.string().max(100),
    tools: z.array(z.any()).max(20),
  }),
  result: z.object({
    totalMonthlySavings: z.number(),
    totalAnnualSavings: z.number(),
    totalCurrentMonthly: z.number(),
    totalRecommendedMonthly: z.number(),
    isOptimal: z.boolean(),
    credexEligible: z.boolean(),
    findings: z.array(z.any()).max(20),
  }),
});

const SYSTEM_PROMPT = `You are SpendLens, a direct AI spend analyst for startups.
You receive an audit result for a team's AI tool stack.
Return valid JSON with exactly two fields:

{
  "summary": "One paragraph, 60-100 words. Talk to them ('you', 'your'). Lead with the biggest dollar number. Name specific tools and dollar amounts for each recommendation. No fluff, no bullets, no headers, no emojis. Plain prose, calm tone, like a CFO friend who looked at their invoices.",
  "priority_action": "One sentence. The single most impactful move: 'Switch [Tool] from [Plan] to [Plan] to save [$/mo].' If stack is optimal, suggest what to watch as they scale."
}

Rules:
- If isOptimal is true, do NOT invent savings. Acknowledge the stack is tight and name the tier breakpoints to watch as the team grows.
- Always reference tool names exactly as given in the findings.
- Include dollar amounts for every recommendation you mention.
- The priority_action must be actionable this week.`;

interface AiResult {
  summary: string;
  priorityAction: string | null;
  source: string;
}

function parseAiResponse(raw: string, source: string): AiResult {
  let summary: string;
  let priorityAction: string | null = null;

  try {
    const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const parsed = JSON.parse(cleaned);
    summary = parsed.summary ?? raw;
    priorityAction = parsed.priority_action ?? null;
  } catch {
    summary = raw;
  }

  return { summary, priorityAction, source };
}

function buildUserMessage(input: z.infer<typeof Body>["input"], result: z.infer<typeof Body>["result"]) {
  return JSON.stringify({
    teamSize: input.teamSize,
    useCase: input.useCase,
    currentMonthly: result.totalCurrentMonthly,
    recommendedMonthly: result.totalRecommendedMonthly,
    monthlySavings: result.totalMonthlySavings,
    annualSavings: result.totalAnnualSavings,
    isOptimal: result.isOptimal,
    findings: (result.findings as AuditResult["findings"]).map((f) => ({
      tool: f.toolLabel,
      currentPlan: f.tool,
      action: f.action,
      reason: f.reason,
      currentSpend: f.currentSpend,
      recommendedSpend: f.recommendedSpend,
      monthlySavings: f.monthlySavings,
      severity: f.severity,
    })),
  });
}

function callGroq(
  apiKey: string,
  userMessage: string,
): Promise<AiResult> {
  const groq = new Groq({ apiKey });
  return groq.chat.completions
    .create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    })
    .then((c) => {
      const raw = c.choices[0]?.message?.content?.trim();
      if (!raw) throw new Error("empty_groq");
      return parseAiResponse(raw, "groq-llama-3.3-70b");
    });
}

function callOpenRouter(
  apiKey: string,
  model: string,
  userMessage: string,
  sourceName: string,
): Promise<AiResult> {
  return fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://spendlens.dev",
      "X-Title": "SpendLens",
    },
    body: JSON.stringify({
      model,
      temperature: 0.5,
      max_tokens: 400,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
    }),
    signal: AbortSignal.timeout(12000),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error(`openrouter_${res.status}`);
      const data = await res.json();
      const raw = data.choices?.[0]?.message?.content?.trim();
      if (!raw) throw new Error("empty_openrouter");
      return parseAiResponse(raw, sourceName);
    });
}

function templatedFallback(input: AuditInput, result: AuditResult): AiResult {
  if (result.isOptimal) {
    return {
      summary: `Your stack looks tight at ${formatUsd(result.totalCurrentMonthly)}/mo for a team of ${input.teamSize}. Nothing to cut today. As you grow, watch for seat-tier breakpoints — Cursor Pro→Business makes sense around 10 seats, Claude Pro→Team at 5+. Come back when your stack changes.`,
      priorityAction: null,
      source: "template",
    };
  }
  const top = [...result.findings]
    .filter((f) => f.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings);
  const topTwo = top.slice(0, 2);
  const actions = topTwo.map((f) => `${f.toolLabel}: ${f.action} (saves ${formatUsd(f.monthlySavings)}/mo)`).join("; ");
  return {
    summary: `You can save ${formatUsd(result.totalAnnualSavings)} per year — ${formatUsd(result.totalMonthlySavings)} a month — without losing capability. The moves that matter most: ${actions}. Pricing verified against vendor sites May 2026.`,
    priorityAction: top[0]
      ? `${top[0].toolLabel}: ${top[0].action} to save ${formatUsd(top[0].monthlySavings)}/mo.`
      : null,
    source: "template",
  };
}

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }

  const { input, result } = body;
  const groqKey = process.env.GROQ_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;

  if (!groqKey && !openrouterKey) {
    const fallback = templatedFallback(input as AuditInput, result as AuditResult);
    return NextResponse.json(fallback);
  }

  const userMessage = buildUserMessage(input, result);
  const candidates: Promise<AiResult>[] = [];

  if (groqKey) {
    candidates.push(callGroq(groqKey, userMessage));
  }

  if (openrouterKey) {
    candidates.push(
      callOpenRouter(openrouterKey, "google/gemini-2.0-flash-thinking-exp:free", userMessage, "gemini-2.0-thinking"),
    );
    candidates.push(
      callOpenRouter(openrouterKey, "anthropic/claude-3.5-sonnet:free", userMessage, "claude-3.5-sonnet"),
    );
    candidates.push(
      callOpenRouter(openrouterKey, "deepseek/deepseek-chat", userMessage, "deepseek-v3"),
    );
  }

  try {
    const winner = await Promise.any(candidates);
    return NextResponse.json(winner);
  } catch (err) {
    console.error("[summarize] all models failed:", err);
    const fallback = templatedFallback(input as AuditInput, result as AuditResult);
    return NextResponse.json({ ...fallback, source: "template_after_error" });
  }
}
