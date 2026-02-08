import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("payment_accounts")
      .select("status, onboarding_url")
      .eq("user_id", user.id)
      .eq("provider", "razorpay")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: data?.status || "not_set",
      onboardingUrl: data?.onboarding_url || null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load payment setup" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = body?.action || "start";

    if (action === "complete") {
      const { data, error } = await supabase
        .from("payment_accounts")
        .upsert({
          user_id: user.id,
          provider: "razorpay",
          status: "active",
          onboarding_url: null,
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id, provider" })
        .select("status, onboarding_url")
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        status: data?.status || "active",
        onboardingUrl: data?.onboarding_url || null
      });
    }

    const onboardingUrl = `https://rzp.io/i/${randomUUID().slice(0, 8)}`;
    const { data, error } = await supabase
      .from("payment_accounts")
      .upsert({
        user_id: user.id,
        provider: "razorpay",
        status: "setup_in_progress",
        onboarding_url: onboardingUrl,
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id, provider" })
      .select("status, onboarding_url")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      status: data?.status || "setup_in_progress",
      onboardingUrl: data?.onboarding_url || onboardingUrl
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to start payment setup" }, { status: 500 });
  }
}
