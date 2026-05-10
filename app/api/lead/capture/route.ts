import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { z } from "zod";
import { Resend } from "resend";
import crypto from "crypto";

export const runtime = "nodejs";

const Body = z.object({
  auditId: z.string().min(1).max(30).regex(/^[A-Za-z0-9_-]+$/),
  email: z.string().email().max(320),
  companyName: z.string().max(200).optional(),
  role: z.string().max(100).optional(),
  teamSize: z.number().int().min(1).max(100000).optional(),
  savingsMonthly: z.number().optional(),
  credexEligible: z.boolean().optional(),
  // Honeypot — must be empty
  website: z.string().max(0).optional(),
});

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

async function checkRateLimit(supabase: ReturnType<typeof getServiceClient>, ipHash: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await supabase
    .from("rate_limits")
    .select("*", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("action", "lead_capture")
    .gte("window_start", windowStart);

  return (count ?? 0) < 5;
}

async function recordRateLimit(supabase: ReturnType<typeof getServiceClient>, ipHash: string) {
  await supabase.from("rate_limits").insert({
    ip_hash: ipHash,
    action: "lead_capture",
    window_start: new Date().toISOString(),
  });
}

export async function POST(req: Request) {
  let body: z.infer<typeof Body>;
  try {
    body = Body.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "bad_input" }, { status: 400 });
  }

  // Honeypot check
  if (body.website && body.website.length > 0) {
    return NextResponse.json({ success: true });
  }

  const supabase = getServiceClient();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const ipHash = hashIp(ip);

  const allowed = await checkRateLimit(supabase, ipHash);
  if (!allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { error } = await supabase.from("leads").insert({
    audit_id: body.auditId,
    email: body.email,
    company_name: body.companyName || null,
    role: body.role || null,
    team_size: body.teamSize || null,
    savings_monthly: body.savingsMonthly || null,
    credex_eligible: body.credexEligible || false,
  });

  if (error) {
    console.error("[lead/capture] insert failed:", error);
    return NextResponse.json({ error: "save_failed" }, { status: 500 });
  }

  await recordRateLimit(supabase, ipHash);

  // Send confirmation email (fire-and-forget)
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    try {
      const resend = new Resend(resendKey);
      const isHighSavings = body.credexEligible;

      await resend.emails.send({
        from: "SpendLens <onboarding@resend.dev>",
        to: body.email,
        subject: isHighSavings
          ? "Your SpendLens audit — you qualify for extra savings"
          : "Your SpendLens audit results",
        html: buildEmailHtml(body.auditId, body.savingsMonthly ?? 0, isHighSavings ?? false),
      });
    } catch (err) {
      console.error("[lead/capture] email send failed:", err);
    }
  }

  return NextResponse.json({ success: true });
}

function buildEmailHtml(auditId: string, savingsMonthly: number, credexEligible: boolean): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://spendlens.vercel.app";
  const auditUrl = `${baseUrl}/audit/${encodeURIComponent(auditId)}`;
  const savingsAnnual = Math.round(savingsMonthly * 12);

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
  <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #059669; margin-bottom: 4px;">SpendLens</p>
  <h1 style="font-size: 22px; margin: 0 0 20px;">Your AI spend audit</h1>

  ${savingsMonthly > 0 ? `
  <p style="font-size: 16px; line-height: 1.6;">
    We found <strong>$${savingsMonthly.toLocaleString()}/month</strong> in potential savings — that's <strong>$${savingsAnnual.toLocaleString()}/year</strong> back in your runway.
  </p>
  ` : `
  <p style="font-size: 16px; line-height: 1.6;">
    Good news: your stack looks well-optimized. We'll notify you when new savings opportunities apply to your tools.
  </p>
  `}

  <p style="margin: 24px 0;">
    <a href="${auditUrl}" style="background: #18181b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 500;">View your full audit</a>
  </p>

  ${credexEligible ? `
  <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 16px; margin: 24px 0;">
    <p style="margin: 0; font-weight: 600; color: #3730a3;">You qualify for a Credex consultation</p>
    <p style="margin: 8px 0 0; font-size: 14px; color: #4338ca;">At your spend level, committed-use discounts and credit sourcing typically save another 15–30%. A member of the Credex team will reach out within 48 hours.</p>
  </div>
  ` : ""}

  <p style="font-size: 13px; color: #71717a; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 16px;">
    Pricing verified against vendor sites as of May 2026. Not affiliated with the tools listed.<br>
    Built by <a href="https://credex.ai" style="color: #71717a;">Credex</a>.
  </p>
</body>
</html>`;
}
