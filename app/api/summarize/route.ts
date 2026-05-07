import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";
import type { AuditInput, AuditResult } from "@/lib/audit/types";
import { formatUsd } from "@/lib/utils";

export const runtime = "nodejs";

// We don't trust the client to send the result, but we don't trust ourselves
// to recompute it either — both could drift. Cheaper to validate shape and
// hand the LLM exactly what the user already saw.
const Body = z.object({
  input: z.object({
    teamSize: z.number().int().min(1).max(10000),
    useCase: z.string(),
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

const SYSTEM_PROMPT = `You are SpendLens, a no-nonsense AI spend analyst.
You will be given an audit result for a startup's AI tool stack.
Write ONE short paragraph (60–100 words) the founder will read.

Rules:
- Talk to them, not about them. Use "you" and "your".
- Lead with the dollar number that matters most (annual savings if non-zero, else acknowledge the stack is tight).
- Name 1–2 specific actions they should take this week. Use the tool labels you see.
- No marketing fluff. No bullet points. No headers. No emojis. No "I" or "we".
- If isOptimal is true, do not invent savings — say their stack looks tight and where they'd spend next as they grow.
- Plain prose, calm tone, like a CFO friend.`;

function templatedFallback(input: AuditInput, result: AuditResult): string {
  if (result.isOptimal) {
    return `Your stack looks tight at ${formatUsd(result.totalCurrentMonthly)}/mo for a team of ${input.teamSize}. Nothing to cut today. As you grow, the next decisions worth thinking about are seat-tier breakpoints (Cursor Pro→Business at ~10 seats, Claude Pro→Team at 5+) and whether anyone is heavy enough on Claude or ChatGPT to justify a Max or Pro tier. Come back when your stack changes.`;
  }
  const top = [...result.findings]
    .filter((f) => f.monthlySavings > 0)
    .sort((a, b) => b.monthlySavings - a.monthlySavings)
    .slice(0, 2);
  const actions = top.map((f) => `${f.toolLabel}: ${f.action}`).join("; ");
  return `You can save about ${formatUsd(result.totalAnnualSavings)} per year — ${formatUsd(result.totalMonthlySavings)} a month — without losing capability. The two moves that matter most this week: ${actions}. Current pricing was verified against vendor sites on 2026-05-07, so these numbers are real, not estimates from last quarter.`;
}

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }

  const { input, result } = body;
  const apiKey = process.env.GROQ_API_KEY;

  // No key in env? Use the templated version. Still useful, never throws.
  if (!apiKey) {
    return NextResponse.json({
      summary: templatedFallback(input as AuditInput, result as AuditResult),
      source: "template",
    });
  }

  try {
    const groq = new Groq({ apiKey });
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 220,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            teamSize: input.teamSize,
            useCase: input.useCase,
            currentMonthly: result.totalCurrentMonthly,
            recommendedMonthly: result.totalRecommendedMonthly,
            monthlySavings: result.totalMonthlySavings,
            annualSavings: result.totalAnnualSavings,
            isOptimal: result.isOptimal,
            findings: (result.findings as AuditResult["findings"]).map((f) => ({
              tool: f.toolLabel,
              action: f.action,
              reason: f.reason,
              monthlySavings: f.monthlySavings,
              severity: f.severity,
            })),
          }),
        },
      ],
    });

    const summary = completion.choices[0]?.message?.content?.trim();
    if (!summary) throw new Error("empty_completion");

    return NextResponse.json({ summary, source: "groq" });
  } catch (err) {
    console.error("[summarize] groq failed, falling back:", err);
    return NextResponse.json({
      summary: templatedFallback(input as AuditInput, result as AuditResult),
      source: "template_after_error",
    });
  }
}
