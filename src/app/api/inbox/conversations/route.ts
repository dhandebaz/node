import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

const now = Date.now();

const conversations = [
  {
    id: "conv-1001",
    customerName: "Ananya Sharma",
    customerPhone: "+91 98989 11223",
    channel: "whatsapp",
    lastMessage: "Can we check in early tomorrow morning?",
    lastMessageAt: new Date(now - 1000 * 60 * 12).toISOString(),
    unreadCount: 2,
    manager: { slug: "host-ai", name: "Host AI" },
    status: "payment_pending"
  },
  {
    id: "conv-1002",
    customerName: "Riya Patel",
    customerPhone: "+91 90000 12345",
    channel: "instagram",
    lastMessage: "Order shipped? Please share tracking update.",
    lastMessageAt: new Date(now - 1000 * 60 * 48).toISOString(),
    unreadCount: 0,
    manager: { slug: "dukan-ai", name: "Dukan AI" },
    status: "paid"
  },
  {
    id: "conv-1003",
    customerName: "Dr. Nikhil Verma",
    customerPhone: "+91 98765 43210",
    channel: "messenger",
    lastMessage: "Can we reschedule the appointment to Friday?",
    lastMessageAt: new Date(now - 1000 * 60 * 120).toISOString(),
    unreadCount: 1,
    manager: { slug: "nurse-ai", name: "Nurse AI" },
    status: "scheduled"
  },
  {
    id: "conv-1004",
    customerName: null,
    customerPhone: "+91 88888 54321",
    channel: "web",
    lastMessage: "Need pricing for a 3-night stay in March.",
    lastMessageAt: new Date(now - 1000 * 60 * 260).toISOString(),
    unreadCount: 0,
    manager: { slug: "host-ai", name: "Host AI" },
    status: "open"
  }
];

export async function GET() {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: bookingRows } = await supabase
    .from("bookings")
    .select("id, guest_contact, guests(name, phone, email), listings!inner(host_id)")
    .eq("listings.host_id", user.id);

  const normalizedBookings = (bookingRows || []).map((booking: any) => ({
    id: booking.id,
    guestName: booking.guests?.name || "",
    guestPhone: booking.guest_contact || booking.guests?.phone || booking.guests?.email || ""
  }));

  const withBooking = conversations.map((conversation) => {
    const match = normalizedBookings.find(
      (booking) =>
        (conversation.customerPhone && booking.guestPhone && booking.guestPhone.includes(conversation.customerPhone)) ||
        (conversation.customerName && booking.guestName && booking.guestName === conversation.customerName)
    );
    return {
      ...conversation,
      bookingId: match?.id || null
    };
  });

  return NextResponse.json({
    conversations: withBooking,
    meta: {
      walletStatus: "healthy",
      integrationStatus: "connected",
      channelErrors: []
    }
  });
}
