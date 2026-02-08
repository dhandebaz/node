import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("id, listing_id, guest_id, start_date, end_date, status, id_status, source, amount, guest_contact, payment_id, created_at, guests(name, phone, email), listings!inner(host_id)")
      .eq("listings.host_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (bookings || []).map((b: any) => ({
      id: b.id,
      listing_id: b.listing_id,
      guest_name: b.guests?.name || "Guest",
      guest_contact: b.guest_contact || b.guests?.phone || b.guests?.email || null,
      check_in: b.start_date,
      check_out: b.end_date,
      amount: Number(b.amount || 0),
      status: b.status,
      id_status: b.id_status,
      payment_id: b.payment_id || null,
      created_at: b.created_at,
      source: b.source || "direct"
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load bookings" }, { status: 500 });
  }
}
