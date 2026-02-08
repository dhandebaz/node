import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const reason = body?.reason?.toString() || "Please upload a clearer ID image.";

    const { id } = await params;
    const { data: guestId, error } = await supabase
      .from("guest_ids")
      .select("id, booking_id, bookings(guest_id, listings!inner(host_id))")
      .eq("id", id)
      .eq("bookings.listings.host_id", user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!guestId) {
      return NextResponse.json({ error: "Guest ID not found" }, { status: 404 });
    }

    await supabase
      .from("guest_ids")
      .update({
        status: "rejected",
        reviewed_at: new Date().toISOString(),
        rejection_reason: reason
      })
      .eq("id", id);

    await supabase
      .from("bookings")
      .update({ id_status: "rejected" })
      .eq("id", guestId.booking_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to reject ID" }, { status: 500 });
  }
}
