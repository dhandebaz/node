import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ status: "unauthorized" }, { status: 401 });
    }

    // Check both account status AND actual tenant membership
    // This prevents redirect loops where account says complete but no tenant exists
    const [accountRes, membershipRes] = await Promise.all([
      supabase
        .from("accounts")
        .select("onboarding_status, tenant_id, business_type")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("user_id", user.id)
        .maybeSingle()
    ]);

    if (accountRes.error) {
      return NextResponse.json({ status: "error", message: accountRes.error.message }, { status: 500 });
    }

    const account = accountRes.data;
    const membership = membershipRes.data;

    // A user is only "ready" if:
    // 1. Their account status is 'complete'
    // 2. They have a valid tenant membership
    // 3. They have a selected business type (critical for AI logic)
    const isReady = 
      account?.onboarding_status === "complete" && 
      (membership?.tenant_id || account?.tenant_id) &&
      (account?.business_type);

    const status = isReady ? "ready" : "processing";

    return NextResponse.json({ 
      status,
      debug: process.env.NODE_ENV === 'development' ? {
        hasAccount: !!account,
        onboardingStatus: account?.onboarding_status,
        hasMembership: !!membership,
        tenantId: membership?.tenant_id || account?.tenant_id
      } : undefined
    });
  } catch (error) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
