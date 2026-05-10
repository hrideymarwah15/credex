import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { getServiceClient } from "@/lib/supabase";
import { z } from "zod";

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
    perSeatSpendForBenchmark: z.number().optional(),
    generatedAt: z.string().max(50).optional(),
  }),
  summary: z.string().max(5000).nullable().optional(),
});

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }

  const id = nanoid(12);
  const supabase = getServiceClient();

  const { error } = await supabase.from("audits").insert({
    id,
    input: body.input,
    result: body.result,
    summary: body.summary ?? null,
  });

  if (error) {
    console.error("[audit/save] insert failed:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  return NextResponse.json({ id, url: `/audit/${id}` });
}
