import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();
    const { id: bookingId } = await params;

    // Verify booking existence and ownership (tenant isolation)
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id")
      .eq("id", bookingId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Fetch audit events for this booking
    // Note: We filter by tenant_id explicitly for safety, though RLS should handle it
    const { data: events, error: eventsError } = await supabase
      .from("audit_events")
      .select("id, actor_type, event_type, created_at, metadata, users:actor_id(full_name, email)")
      .eq("tenant_id", tenantId)
      .eq("entity_type", "booking")
      .eq("entity_id", bookingId)
      .order("created_at", { ascending: false });

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    return NextResponse.json({ events });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load booking events" }, { status: 500 });
  }
}
