import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = Date.now();
    const items = [
      {
        id: "act-1001",
        timestamp: new Date(now - 1000 * 60 * 40).toISOString(),
        action: "Sent payment link",
        reason: "Booking confirmed and payment pending",
        outcome: "sent",
        manager: "Host AI"
      },
      {
        id: "act-1002",
        timestamp: new Date(now - 1000 * 60 * 120).toISOString(),
        action: "Escalated discount request",
        reason: "Discount negotiation is restricted",
        outcome: "escalated",
        manager: "Host AI"
      },
      {
        id: "act-1003",
        timestamp: new Date(now - 1000 * 60 * 220).toISOString(),
        action: "Blocked appointment scheduling",
        reason: "Daily scheduling limit reached",
        outcome: "blocked",
        manager: "Nurse AI"
      }
    ];

    return NextResponse.json({ items });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load AI activity" }, { status: 500 });
  }
}
