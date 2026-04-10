import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

interface ContextField {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad";
}

interface QuickAction {
  id: string;
  label: string;
  variant: "primary" | "secondary";
  action: string;
}

interface ContextResponse {
  role: string;
  managerName: string;
  status: string;
  updatedAt: string;
  fields: ContextField[];
  quickActions: QuickAction[];
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();
    const conversationId = request.nextUrl.searchParams.get("conversationId");
    const bookingIdParam = request.nextUrl.searchParams.get("bookingId");

    if (!conversationId && !bookingIdParam) {
      return NextResponse.json({ error: "Missing conversationId or bookingId" }, { status: 400 });
    }

    // Get conversation details
    let conversation: any = null;
    let guestId: string | null = null;
    let guestChannel = "web";
    let contactName = "Contact";

    if (conversationId && !conversationId.startsWith("booking-")) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("*")
        .eq("id", conversationId)
        .eq("tenant_id", tenantId)
        .maybeSingle();
      
      conversation = conv;
      guestChannel = conv?.channel || "web";
      contactName = conv?.contact_name || "Contact";
    }

    // Get booking data if available
    let booking: any = null;
    const bookingId = bookingIdParam || conversation?.metadata?.booking_id;

    if (bookingId) {
      const { data: b } = await supabase
        .from("bookings")
        .select(`
          id, 
          id_status, 
          start_date, 
          end_date, 
          status,
          amount,
          guests(id, name, phone, email, channel),
          listings(id, name)
        `)
        .eq("id", bookingId)
        .maybeSingle();
      
      booking = b;
      if (booking?.guests) {
        guestId = booking.guests.id;
        if (!contactName || contactName === "Contact") {
          contactName = booking.guests.name || "Contact";
        }
      }
    }

    // Get recent messages count for context
    let recentMessages: any[] = [];
    if (conversationId) {
      const { data: msgs } = await supabase
        .from("messages")
        .select("content, role, created_at")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(5);
      recentMessages = msgs || [];
    }

    // Build fields based on available data
    const fields: ContextField[] = [];
    const quickActions: QuickAction[] = [];

    // Listing info
    if (booking?.listings) {
      const listing = Array.isArray(booking.listings) ? booking.listings[0] : booking.listings;
      fields.push({ label: "Listing", value: listing?.name || "Property" });
    }

    // Booking dates
    if (booking?.start_date && booking?.end_date) {
      const startDate = new Date(booking.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      const endDate = new Date(booking.end_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
      fields.push({ label: "Dates", value: `${startDate} → ${endDate}` });
    }

    // Booking status
    if (booking) {
      const statusTone = booking.status === "confirmed" ? "good" : booking.status === "cancelled" ? "bad" : "warn";
      fields.push({ label: "Status", value: booking.status, tone: statusTone });
    }

    // ID verification status
    if (booking?.id_status) {
      const idTone = booking.id_status === "approved" ? "good" : booking.id_status === "rejected" ? "bad" : "warn";
      fields.push({ label: "ID Status", value: booking.id_status.replace(/_/g, " "), tone: idTone });
    }

    // Contact info
    if (contactName !== "Contact") {
      fields.push({ label: "Contact", value: contactName });
    }

    // Payment status
    if (booking?.amount) {
      const paidStatus = booking.status === "confirmed" ? "Paid" : "Pending";
      const paymentTone = booking.status === "confirmed" ? "good" : "warn";
      fields.push({ label: "Payment", value: `₹${booking.amount} - ${paidStatus}`, tone: paymentTone });
    }

    // Channel info
    fields.push({ label: "Channel", value: guestChannel });

    // Recent message context
    if (recentMessages.length > 0) {
      const lastMsg = recentMessages[0];
      fields.push({ label: "Last Message", value: lastMsg.content?.slice(0, 50) + (lastMsg.content?.length > 50 ? "..." : "") });
    }

    // Quick actions based on booking status
    if (booking) {
      if (booking.status !== "confirmed") {
        quickActions.push({ id: "send-payment", label: "Send payment link", variant: "primary", action: "send_payment_link" });
      }
      if (booking.id_status !== "approved") {
        quickActions.push({ id: "request-id", label: "Request ID", variant: "secondary", action: "request_id" });
      }
    }

    // Generic quick actions
    quickActions.push({ id: "send-message", label: "Send message", variant: "primary", action: "send_message" });
    quickActions.push({ id: "escalate", label: "Escalate", variant: "secondary", action: "escalate" });

    // Determine manager based on business type
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type")
      .eq("id", tenantId)
      .single();

    let managerName = "Omni AI";
    let role = "Omni AI";
    
    // We keep the logic for future differentiation, but standardize the UI label to Omni AI for now.
    switch (tenant?.business_type) {
      default:
        managerName = "Omni AI";
        role = "Omni AI";
    }

    const response: ContextResponse = {
      role,
      managerName,
      status: conversation?.status || (booking?.status === "confirmed" ? "active" : "pending"),
      updatedAt: new Date().toISOString(),
      fields,
      quickActions
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Context error:", error);
    return NextResponse.json({ error: error?.message || "Failed to load context" }, { status: 500 });
  }
}
