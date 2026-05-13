import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";
import { z } from "zod";

const Body = z.object({
  auditId: z.string().uuid(),
  email: z.string().email().optional(),
});

function generateReferralCode(): string {
  // Generate a readable 6-character code (e.g., "SAVE42")
  const adjectives = ["SAVE", "FAST", "SMART", "WISE", "EARN"];
  const numbers = Math.floor(Math.random() * 100);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${numbers}`;
}

export async function POST(req: Request) {
  try {
    const body = Body.parse(await req.json());
    const supabase = getServiceClient();

    // Generate unique code
    let code = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from("referral_codes")
        .select("code")
        .eq("code", code)
        .single();

      if (!existing) break;
      code = generateReferralCode();
      attempts++;
    }

    if (attempts >= 10) {
      return NextResponse.json(
        { error: "Could not generate unique code" },
        { status: 500 }
      );
    }

    // Create referral code
    const { data, error } = await supabase
      .from("referral_codes")
      .insert({
        code,
        created_by_email: body.email,
        created_by_audit_id: body.auditId,
        uses: 0,
        referred_audits: 0,
        referred_leads: 0,
      })
      .select()
      .single();

    if (error) {
      console.error("[referral/create] Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to create referral code" },
        { status: 500 }
      );
    }

    return NextResponse.json({ code: data.code });
  } catch (err) {
    console.error("[referral/create] Error:", err);
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
