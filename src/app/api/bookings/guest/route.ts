import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || 'unknown';
    const { success } = await rateLimit.limit(`guest_booking_${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { 
      listingId, 
      guestName, 
      guestEmail, 
      guestPhone, 
      checkIn, 
      checkOut, 
      guestCount,
      specialRequests 
    } = body;

    if (!listingId || !guestName || !checkIn || !checkOut) {
      return NextResponse.json({ 
        error: "Missing required fields: listingId, guestName, checkIn, checkOut" 
      }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    // Get listing details and host info
    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, tenant_id, title, base_price, max_guests")
      .eq("id", listingId)
      .single();

    if (listingError || !listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const tenantId = listing.tenant_id!;

    // Create or find guest
    let guestId: string;
    
    if (guestPhone) {
      const { data: existingGuest } = await supabase
        .from("guests")
        .select("id")
        .eq("phone", guestPhone)
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (existingGuest) {
        guestId = existingGuest.id;
        // Update guest info
        await supabase
          .from("guests")
          .update({ 
            name: guestName,
            email: guestEmail || undefined 
          })
          .eq("id", guestId);
      } else {
        const { data: newGuest } = await supabase
          .from("guests")
          .insert({
            tenant_id: tenantId,
            name: guestName,
            phone: guestPhone,
            email: guestEmail || undefined,
            channel: 'web',
            id_verification_status: 'not_requested'
          } as any)
          .select("id")
          .single();
        guestId = newGuest?.id!;
      }
    } else {
      // Create guest without phone
      const { data: newGuest } = await supabase
        .from("guests")
        .insert({
          tenant_id: tenantId,
          name: guestName,
          email: guestEmail || undefined,
          channel: 'web',
          id_verification_status: 'not_requested'
        } as any)
        .select("id")
        .single();
      guestId = newGuest?.id!;
    }

    // Calculate amount (simplified - in real app would calculate from pricing rules)
    const days = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
    const amount = (listing.base_price || 0) * days;

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        listing_id: listingId,
        tenant_id: tenantId,
        guest_id: guestId,
        start_date: checkIn,
        end_date: checkOut,
        guest_contact: guestPhone || guestEmail,
        amount: amount,
        status: 'pending',
        source: 'web',
        id_status: 'not_requested',
        metadata: {
          guest_count: guestCount,
          special_requests: specialRequests,
          booking_type: 'inquiry'
        }
      } as any)
      .select()
      .single();

    if (bookingError) {
      console.error("Booking creation error:", bookingError);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      amount: amount,
      message: "Booking request submitted successfully. You will be contacted shortly."
    });

  } catch (error: any) {
    console.error("Guest booking error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const guestPhone = searchParams.get("phone");
    const guestEmail = searchParams.get("email");

    if (!bookingId && !guestPhone && !guestEmail) {
      return NextResponse.json({ error: "bookingId or phone/email required" }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    let query = supabase
      .from("bookings")
      .select(`
        id, 
        listing_id, 
        start_date, 
        end_date, 
        status, 
        id_status, 
        source, 
        amount, 
        guest_contact, 
        created_at,
        guests(name, phone, email),
        listings(title, location)
      `);

    if (bookingId) {
      query = query.eq("id", bookingId);
    } else if (guestPhone) {
      // Find guest by phone and get their bookings
      const { data: guest } = await supabase
        .from("guests")
        .select("id")
        .eq("phone", guestPhone)
        .single();
      
      if (guest) {
        query = query.eq("guest_id", guest.id);
      } else {
        return NextResponse.json({ bookings: [] });
      }
    } else if (guestEmail) {
      const { data: guest } = await supabase
        .from("guests")
        .select("id")
        .eq("email", guestEmail)
        .single();
      
      if (guest) {
        query = query.eq("guest_id", guest.id);
      } else {
        return NextResponse.json({ bookings: [] });
      }
    }

    const { data: bookings, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const formatted = (bookings || []).map((b: any) => {
      const guest = Array.isArray(b.guests) ? b.guests[0] : b.guests;
      const listing = Array.isArray(b.listings) ? b.listings[0] : b.listings;
      return {
        id: b.id,
        listingName: listing?.title || "Property",
        listingLocation: listing?.location || "",
        checkIn: b.start_date,
        checkOut: b.end_date,
        amount: Number(b.amount || 0),
        status: b.status,
        idStatus: b.id_status,
        guestName: guest?.name,
        guestContact: b.guest_contact || guest?.phone || guest?.email,
        createdAt: b.created_at
      };
    });

    return NextResponse.json({ bookings: formatted });

  } catch (error: any) {
    console.error("Guest booking fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
