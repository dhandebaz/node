import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, listing_id, guest_id, start_date, end_date, status, id_status, source, amount, guest_contact, payment_id, created_at, guests(name, phone, email)")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (bookings || []).map((b: any) => {
      const guest = Array.isArray(b.guests) ? b.guests[0] : b.guests;
      return {
        id: b.id,
        listing_id: b.listing_id,
        guest_name: guest?.name || "Guest",
        guest_contact: b.guest_contact || guest?.phone || guest?.email || null,
        check_in: b.start_date,
        check_out: b.end_date,
        amount: Number(b.amount || 0),
        status: b.status,
        id_status: b.id_status,
        payment_id: b.payment_id || null,
        created_at: b.created_at,
        source: b.source || "direct"
      };
    });

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load bookings" }, { status: 500 });
  }
}
