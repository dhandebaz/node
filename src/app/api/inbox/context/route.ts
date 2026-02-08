import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const contextMap: Record<string, any> = {
  "conv-1001": {
    role: "Host AI",
    managerName: "Host AI",
    status: "pending",
    updatedAt: new Date().toISOString(),
    fields: [
      { label: "Listing", value: "Sea Breeze Villa" },
      { label: "Dates", value: "12–15 Oct" },
      { label: "Availability", value: "Open", tone: "good" },
      { label: "Booking", value: "Awaiting confirmation", tone: "warn" },
      { label: "Payment", value: "Pending", tone: "warn" },
      { label: "ID Status", value: "Not submitted", tone: "bad" }
    ],
    quickActions: [
      { id: "send-price", label: "Send price", variant: "primary", action: "send_price" },
      { id: "send-payment", label: "Send payment link", variant: "primary", action: "send_payment_link" },
      { id: "remind-payment", label: "Remind for payment", variant: "secondary", action: "remind_payment" },
      { id: "request-id", label: "Request ID", variant: "secondary", action: "request_id" }
    ]
  },
  "conv-1002": {
    role: "Dukan AI",
    managerName: "Dukan AI",
    status: "active",
    updatedAt: new Date().toISOString(),
    fields: [
      { label: "Customer", value: "Riya Patel" },
      { label: "Order", value: "Shipped", tone: "good" },
      { label: "Payment", value: "Paid", tone: "good" },
      { label: "Delivery", value: "ETA Tomorrow", tone: "warn" }
    ],
    quickActions: [
      { id: "send-tracking", label: "Send tracking", variant: "primary", action: "send_tracking" },
      { id: "confirm-delivery", label: "Confirm delivery", variant: "primary", action: "confirm_delivery" },
      { id: "escalate", label: "Escalate to staff", variant: "secondary", action: "escalate" }
    ]
  },
  "conv-1003": {
    role: "Nurse AI",
    managerName: "Nurse AI",
    status: "active",
    updatedAt: new Date().toISOString(),
    fields: [
      { label: "Patient", value: "Dr. Nikhil Verma" },
      { label: "Appointment", value: "Friday 4 PM", tone: "warn" },
      { label: "Status", value: "Reschedule requested", tone: "warn" },
      { label: "Follow-up", value: "Required", tone: "bad" }
    ],
    quickActions: [
      { id: "schedule", label: "Schedule appointment", variant: "primary", action: "schedule_appointment" },
      { id: "send-reminder", label: "Send reminder", variant: "primary", action: "send_reminder" },
      { id: "escalate", label: "Escalate to staff", variant: "secondary", action: "escalate" }
    ]
  },
  "conv-1004": {
    role: "Host AI",
    managerName: "Host AI",
    status: "active",
    updatedAt: new Date().toISOString(),
    fields: [
      { label: "Listing", value: "Palm Studio" },
      { label: "Dates", value: "March (TBD)" },
      { label: "Availability", value: "Check calendar", tone: "warn" },
      { label: "Payment", value: "Not started", tone: "bad" },
      { label: "Booking", value: "Inquiry", tone: "warn" }
    ],
    quickActions: [
      { id: "send-price", label: "Send price", variant: "primary", action: "send_price" },
      { id: "confirm-booking", label: "Confirm booking", variant: "primary", action: "confirm_booking" },
      { id: "request-id", label: "Request ID", variant: "secondary", action: "request_id" }
    ]
  }
};

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversationId = request.nextUrl.searchParams.get("conversationId");
    const bookingIdParam = request.nextUrl.searchParams.get("bookingId");
    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    if (bookingIdParam || conversationId.startsWith("booking-")) {
      const bookingId = bookingIdParam || conversationId.replace("booking-", "");
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select("id, id_status, start_date, end_date, guests(name), listings(name)")
        .eq("id", bookingId)
        .maybeSingle();

      if (bookingError || !booking) {
        return NextResponse.json(null);
      }

      const idStatus = booking.id_status || "not_requested";
      const fields = [
        { label: "Listing", value: booking.listings?.name || "Property" },
        { label: "Dates", value: `${new Date(booking.start_date).toLocaleDateString("en-IN")} → ${new Date(booking.end_date).toLocaleDateString("en-IN")}` },
        { label: "ID Status", value: idStatus.replace("_", " "), tone: idStatus === "approved" ? "good" : idStatus === "rejected" ? "bad" : "warn" }
      ];

      return NextResponse.json({
        role: "Host AI",
        managerName: "Host AI",
        status: "active",
        updatedAt: new Date().toISOString(),
        fields,
        quickActions: [
          { id: "send-payment", label: "Send payment link", variant: "primary", action: "send_payment_link" },
          { id: "request-id", label: "Request ID", variant: "secondary", action: "request_id" }
        ]
      });
    }

    return NextResponse.json(contextMap[conversationId] || null);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load context" }, { status: 500 });
  }
}
