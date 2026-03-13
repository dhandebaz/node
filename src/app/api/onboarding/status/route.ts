import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ status: "unauthorized" }, { status: 401 });
    }

    const { data: account, error } = await supabase
      .from("accounts")
      .select("onboarding_status")
      .eq("user_id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }

    // Map DB status to API status
    // 'complete' in DB -> 'ready' for client
    const status = account?.onboarding_status === "complete" ? "ready" : "processing";

    return NextResponse.json({ status });
  } catch (error) {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
