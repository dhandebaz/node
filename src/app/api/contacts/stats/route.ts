import { NextRequest, NextResponse } from "next/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { ContactService } from "@/lib/services/contactService";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    const supabase = await getSupabaseServer();

    // Rate limit to prevent abuse
    const ip = request.headers.get("x-forwarded-for") || 'unknown';
    const { success } = await rateLimit.limit(`contacts_stats_${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const segments = await ContactService.getCustomerSegments(tenantId);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: newThisWeek } = await supabase
      .from("contacts")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", oneWeekAgo.toISOString());

    const { count: crossChannelLinks } = await supabase
      .from("guest_identifiers")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .neq("channel", "web");

    const stats = {
      ...segments,
      newThisWeek: newThisWeek || 0,
      crossChannelLinks: crossChannelLinks || 0
    };

    return NextResponse.json({ stats });
  } catch (error: any) {
    console.error("Get contact stats error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
