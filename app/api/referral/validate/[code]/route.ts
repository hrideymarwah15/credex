import { NextResponse } from "next/server";
import { getServiceClient } from "@/lib/supabase";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code: rawCode } = await params;
    const supabase = getServiceClient();
    const code = rawCode.toUpperCase();

    const { data, error } = await supabase
      .from("referral_codes")
      .select("*")
      .eq("code", code)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      valid: true,
      code: data.code,
      uses: data.uses,
    });
  } catch (err) {
    console.error("[referral/validate] Error:", err);
    return NextResponse.json(
      { error: "Failed to validate code" },
      { status: 500 }
    );
  }
}
