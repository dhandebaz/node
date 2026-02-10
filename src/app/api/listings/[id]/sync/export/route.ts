import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await params;
  const supabase = await getSupabaseServer();

  // 1. Verify listing exists and is public (or valid token)
  // For iCal export, we usually rely on a token in URL or just listing ID if it's public.
  // The prompt says "Generate Nodebase public iCal URL".
  
  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, name, tenant_id")
    .eq("id", listingId)
    .single();

  if (error || !listing) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 2. Fetch bookings to export
  const { data: bookings } = await supabase
    .from("bookings")
    .select("start_date, end_date, status, source")
    .eq("listing_id", listingId)
    .neq("status", "cancelled")
    .gte("end_date", new Date().toISOString());

  // 3. Generate iCal content
  // Basic iCal format
  let icalContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nodebase//Nodebase iCal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${listing.name} (Nodebase)`,
  ];

  bookings?.forEach((booking) => {
    const start = booking.start_date.replace(/[-:]/g, "").split(".")[0] + "Z";
    const end = booking.end_date.replace(/[-:]/g, "").split(".")[0] + "Z";
    const uid = `${booking.start_date}-${listingId}@nodebase.com`; // Stable UID

    icalContent.push(
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:Reserved`, // Obfuscate details for public export
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  });

  icalContent.push("END:VCALENDAR");

  return new NextResponse(icalContent.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="calendar-${listingId}.ics"`,
    },
  });
}
