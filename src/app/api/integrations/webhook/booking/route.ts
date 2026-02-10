import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { ControlService } from "@/lib/services/controlService";

// Mock payload structure from external provider (e.g. unified integration service)
interface WebhookPayload {
  external_booking_id: string;
  source: 'airbnb' | 'booking' | 'vrbo' | 'other';
  listing_id: string; // Internal listing ID
  guest_name: string;
  guest_email?: string;
  start_date: string;
  end_date: string;
  status: 'confirmed' | 'cancelled';
  total_amount?: number;
  currency?: string;
}

export async function POST(request: Request) {
  try {
    // 1. Admin Access Required (Webhook is a system-to-system call)
    // We use service role to bypass RLS for lookup, but we must be careful
    const supabase = await getSupabaseAdmin();
    
    const payload = (await request.json()) as WebhookPayload;
    
    if (!payload.listing_id || !payload.start_date || !payload.end_date) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 2. Resolve Tenant from Listing
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, tenant_id, host_id")
      .eq("id", payload.listing_id)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const tenantId = listing.tenant_id;

    // Check kill switch for bookings
    try {
      await ControlService.checkAction(tenantId, 'booking');
    } catch (error: any) {
      // Log dropped webhook due to kill switch
      console.warn(`Booking webhook dropped for tenant ${tenantId}: ${error.message}`);
      // Return 503 so webhook provider might retry later (or 200 to discard if we want to drop definitively)
      // Usually better to fail so they retry when system is up.
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    // 3. Check for existing booking (Deduplication)
    // We assume 'source' + 'external_booking_id' is unique, or just check overlap if no external ID stored
    // For this implementation, we'll check if we have a booking with this external ID in metadata (if supported)
    // Or we check start/end/listing match for same source.
    
    // Since we don't have external_id column guaranteed, we'll check overlap + source
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("listing_id", payload.listing_id)
      .eq("source", payload.source)
      .eq("start_date", payload.start_date)
      .eq("end_date", payload.end_date)
      .maybeSingle();

    if (existingBooking) {
      // Already exists, maybe update status?
      // For now, just log and return
      return NextResponse.json({ message: "Booking already exists", id: existingBooking.id });
    }

    // 4. Find or Create Guest
    let guestId = null;
    if (payload.guest_name) {
       // Simple lookup by email if present, else create
       if (payload.guest_email) {
         const { data: existingGuest } = await supabase
           .from("guests")
           .select("id")
           .eq("email", payload.guest_email)
           .eq("tenant_id", tenantId)
           .maybeSingle();
         guestId = existingGuest?.id;
       }

       if (!guestId) {
         const { data: newGuest, error: guestError } = await supabase
           .from("guests")
           .insert({
             tenant_id: tenantId,
             name: payload.guest_name,
             email: payload.guest_email || null,
             created_at: new Date().toISOString()
           })
           .select("id")
           .single();
         
         if (!guestError && newGuest) {
            guestId = newGuest.id;
         }
       }
    }

    // 5. Insert Booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        tenant_id: tenantId,
        listing_id: payload.listing_id,
        guest_id: guestId, // Can be null if guest creation failed, but ideally required
        start_date: payload.start_date,
        end_date: payload.end_date,
        status: payload.status === 'confirmed' ? 'confirmed' : 'cancelled',
        source: payload.source,
        amount: payload.total_amount || 0,
        created_at: new Date().toISOString()
        // metadata: { external_id: payload.external_booking_id } // If column existed
      })
      .select("id")
      .single();

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    // 6. Log SYSTEM_BOOKING_IMPORTED
    await logEvent({
      tenant_id: tenantId,
      actor_type: 'system',
      event_type: EVENT_TYPES.SYSTEM_BOOKING_IMPORTED,
      entity_type: 'booking',
      entity_id: booking.id,
      metadata: {
        external_id: payload.external_booking_id,
        source: payload.source,
        status: payload.status
      }
    });

    return NextResponse.json({ success: true, id: booking.id });

  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: error?.message || "Internal Server Error" }, { status: 500 });
  }
}
