import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { format, parseISO, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from "date-fns";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenant_id = searchParams.get("tenant_id");
    const report_type = searchParams.get("report_type") || "daily";
    const date_from = searchParams.get("date_from");
    const date_to = searchParams.get("date_to");
    const listing_id = searchParams.get("listing_id");
    const format_type = searchParams.get("format") || "csv";

    if (!tenant_id || !date_from || !date_to) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    let query = supabase
      .from("bookings")
      .select("*, listings(title)")
      .eq("tenant_id", tenant_id)
      .gte("start_date", date_from)
      .lte("start_date", date_to)
      .in("status", ["confirmed", "completed"]);

    if (listing_id && listing_id !== "all") {
      query = query.eq("listing_id", listing_id);
    }

    const { data: bookings, error } = await query;

    if (error) throw error;

    const fromDate = parseISO(date_from);
    const toDate = parseISO(date_to);
    
    let intervals: Date[];
    if (report_type === "daily") {
      intervals = eachDayOfInterval({ start: fromDate, end: toDate });
    } else if (report_type === "weekly") {
      intervals = eachWeekOfInterval({ start: fromDate, end: toDate });
    } else {
      intervals = eachMonthOfInterval({ start: fromDate, end: toDate });
    }

    const data = intervals.map(interval => {
      const intervalStr = format(interval, "yyyy-MM-dd");
      const intervalBookings = bookings?.filter(b => {
        const bookingDate = format(parseISO(b.start_date), "yyyy-MM-dd");
        return report_type === "daily" 
          ? bookingDate === intervalStr
          : report_type === "weekly"
            ? bookingDate >= intervalStr && bookingDate < format(new Date(interval.getTime() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")
            : bookingDate.startsWith(intervalStr.substring(0, 7));
      }) || [];
      
      const revenue = intervalBookings.reduce((sum, b) => sum + (b.amount || 0), 0);
      const bookingsCount = intervalBookings.length;
      const listingTitles = [...new Set(intervalBookings.map(b => (b as any).listings?.title || "Unknown"))];
      
      return {
        date: intervalStr,
        bookings: bookingsCount,
        revenue,
        occupancy: 0,
        properties: listingTitles.join(", ")
      };
    });

    if (format_type === "csv") {
      const csvHeader = "Date,Bookings,Revenue,Occupancy,Properties\n";
      const csvRows = data.map(row => 
        `${row.date},${row.bookings},${row.revenue},${row.occupancy.toFixed(1)}%,"${row.properties}"`
      ).join("\n");
      
      const csvContent = csvHeader + csvRows;
      
      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="revenue-report-${date_from}-to-${date_to}.csv"`
        }
      });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 });
  }
}