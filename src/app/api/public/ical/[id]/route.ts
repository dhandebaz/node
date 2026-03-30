
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let { id: listingId } = await params;
  
  // Strip .ics extension if present (e.g. from Airbnb or manual URL)
  if (listingId.endsWith(".ics")) {
    listingId = listingId.slice(0, -4);
  }

  const supabase = await getSupabaseServer();

  // 1. Fetch Listing & Bookings
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("name, tenant_id")
    .eq("id", listingId)
    .single();

  if (listingError || !listing) {
    return new NextResponse("Listing not found", { status: 404 });
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("id, start_date, end_date, status, source")
    .eq("listing_id", listingId)
    .neq("status", "cancelled")
    .neq("status", "draft"); // Only confirmed/blocked

  if (bookingsError) {
    return new NextResponse("Error fetching bookings", { status: 500 });
  }

  // 2. Generate iCal Content (Strict Compliance with RFC 5545)
  const icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nodebase//Host Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${listing.name} (Nodebase)`,
  ];

  bookings?.forEach((booking) => {
    if (!booking.start_date || !booking.end_date) return;

    // DTSTART & DTEND for all-day events (VALUE=DATE)
    const start = booking.start_date.replace(/-/g, "").split("T")[0];
    const end = booking.end_date.replace(/-/g, "").split("T")[0];

    icalContent.push("BEGIN:VEVENT");
    icalContent.push(`UID:${booking.id}@nodebase.com`);
    icalContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15)}Z`);
    icalContent.push(`DTSTART;VALUE=DATE:${start}`);
    icalContent.push(`DTEND;VALUE=DATE:${end}`);
    icalContent.push("SUMMARY:Reserved (Nodebase)");
    icalContent.push("STATUS:CONFIRMED");
    icalContent.push("TRANSP:OPAQUE"); // Busy
    icalContent.push("END:VEVENT");
  });

  icalContent.push("END:VCALENDAR");

  return new NextResponse(icalContent.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${listingId}.ics"`
    }
  });
}
