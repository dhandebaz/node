import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { randomUUID } from "crypto";
import { saveEncryptedImage } from "@/lib/guestIdStorage";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();
    const { data: record, error } = await supabase
      .from("guest_ids")
      .select("id, booking_id, guest_name, id_type, status")
      .eq("upload_token", token)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!record) {
      return NextResponse.json({ error: "Link expired" }, { status: 404 });
    }

    const { data: booking } = await supabase
      .from("bookings")
      .select("start_date, end_date, listing_id, listings(name, title)")
      .eq("id", record.booking_id)
      .maybeSingle();

    const listing = Array.isArray(booking?.listings) ? booking?.listings?.[0] : booking?.listings;

    return NextResponse.json({
      id: record.id,
      bookingId: record.booking_id,
      guestName: record.guest_name,
      idType: record.id_type,
      status: record.status,
      listingName: listing?.name || listing?.title || "Property",
      checkIn: booking?.start_date,
      checkOut: booking?.end_date
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load upload info" }, { status: 500 });
  }
}

import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get("token")?.toString();
    const frontImage = formData.get("frontImage");
    const backImage = formData.get("backImage");

    if (!token || !(frontImage instanceof File)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();
    const { data: record, error } = await supabase
      .from("guest_ids")
      .select("id, tenant_id, booking_id, id_type, bookings(guest_id)")
      .eq("upload_token", token)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!record) {
      return NextResponse.json({ error: "Link expired" }, { status: 404 });
    }

    const frontBuffer = Buffer.from(await frontImage.arrayBuffer());
    const frontPath = await saveEncryptedImage(frontBuffer, frontImage.type, `${record.id}-front.enc`);
    const backPath = backImage instanceof File
      ? await saveEncryptedImage(Buffer.from(await backImage.arrayBuffer()), backImage.type, `${record.id}-back.enc`)
      : null;

    const { error: updateError } = await supabase
      .from("guest_ids")
      .update({
        status: "submitted",
        uploaded_at: new Date().toISOString(),
        front_image_path: frontPath,
        back_image_path: backPath,
        upload_token: null
      })
      .eq("id", record.id);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    await supabase
      .from("bookings")
      .update({ id_status: "submitted" })
      .eq("id", record.booking_id);

    // Log ID Submitted
    const bookings = record.bookings as any;
    const guestId = Array.isArray(bookings) ? bookings[0]?.guest_id : bookings?.guest_id;
    
    await logEvent({
      tenant_id: record.tenant_id,
      actor_type: 'user',
      actor_id: guestId || null, // Guest is the actor
      event_type: EVENT_TYPES.ID_SUBMITTED,
      entity_type: 'guest_id',
      entity_id: record.id,
      metadata: { booking_id: record.booking_id, id_type: record.id_type }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to upload ID" }, { status: 500 });
  }
}
