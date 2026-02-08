import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const host = request.headers.get("host") || "nodebase.local";
  const { id } = await params;
  const calendar = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nodebase//Listings Calendar//EN",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:Nodebase Listing ${id}`,
    `X-WR-TIMEZONE:Asia/Kolkata`,
    "END:VCALENDAR"
  ].join("\r\n");

  return new NextResponse(calendar, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename=\"nodebase-${host}-${id}.ics\"`
    }
  });
}
