
import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await params;
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

  // 2. Generate iCal Content
  let icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nodebase//Host Calendar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${listing.name} (Nodebase)`,
    "BEGIN:VTIMEZONE",
    "TZID:UTC",
    "BEGIN:STANDARD",
    "DTSTART:19700101T000000",
    "TZOFFSETFROM:+0000",
    "TZOFFSETTO:+0000",
    "TZNAME:UTC",
    "END:STANDARD",
    "END:VTIMEZONE"
  ];

  bookings?.forEach(booking => {
    // Format dates to YYYYMMDD format (all day events usually for bookings)
    // Or YYYYMMDDTHHMMSSZ if specific times.
    // Assuming bookings are date-based (check-in/check-out).
    // iCal for accommodation usually uses VALUE=DATE for DTSTART/DTEND.
    // DTEND is exclusive (check-out date).
    
    const start = booking.start_date.replace(/-/g, '').split('T')[0];
    const end = booking.end_date.replace(/-/g, '').split('T')[0];
    
    // Check if start/end are valid
    if (!start || !end) return;

    icalContent.push("BEGIN:VEVENT");
    icalContent.push(`UID:${booking.id}@nodebase.com`);
    icalContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
    icalContent.push(`DTSTART;VALUE=DATE:${start}`);
    icalContent.push(`DTEND;VALUE=DATE:${end}`);
    icalContent.push(`SUMMARY:Reserved`); // Privacy: don't show guest name
    icalContent.push("END:VEVENT");
  });

  icalContent.push("END:VCALENDAR");

  return new NextResponse(icalContent.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="calendar-${listingId}.ics"`
    }
  });
}
