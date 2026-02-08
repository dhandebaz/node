import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

const getBaseUrl = (request: NextRequest) => {
  const headers = request.headers;
  const protocol = headers.get("x-forwarded-proto") || "http";
  const host = headers.get("x-forwarded-host") || headers.get("host");
  return `${protocol}://${host}`;
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const bookingId = body?.bookingId;
    const idType = body?.idType;

    if (!bookingId || !idType) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, guest_id, listings!inner(host_id), guests(name)")
      .eq("id", bookingId)
      .eq("listings.host_id", user.id)
      .maybeSingle();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const uploadToken = randomUUID();
    const guestName = booking.guests?.name || "Guest";
    const { data: existing } = await supabase
      .from("guest_ids")
      .select("id")
      .eq("booking_id", bookingId)
      .maybeSingle();

    if (existing?.id) {
      const { error: updateError } = await supabase
        .from("guest_ids")
        .update({
          guest_name: guestName,
          id_type: idType,
          status: "requested",
          requested_at: new Date().toISOString(),
          uploaded_at: null,
          reviewed_at: null,
          front_image_path: null,
          back_image_path: null,
          upload_token: uploadToken,
          rejection_reason: null
        })
        .eq("id", existing.id);

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 500 });
      }
    } else {
      const { error: insertError } = await supabase
        .from("guest_ids")
        .insert({
          booking_id: bookingId,
          guest_name: guestName,
          id_type: idType,
          status: "requested",
          requested_at: new Date().toISOString(),
          upload_token: uploadToken
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    await supabase
      .from("bookings")
      .update({ id_status: "requested" })
      .eq("id", bookingId);

    const baseUrl = getBaseUrl(request);
    const uploadUrl = `${baseUrl}/guest-id/${uploadToken}`;

    return NextResponse.json({
      bookingId,
      uploadUrl
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to request ID" }, { status: 500 });
  }
}
