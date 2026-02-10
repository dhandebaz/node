import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";

export async function GET(request: Request) {
  try {
    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    // Fetch recent messages to construct conversations
    // We fetch messages linked to listings owned by the user
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*, guests(name, phone)")
      .eq("tenant_id", tenantId)
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) throw error;

    const conversationMap = new Map();

    messages?.forEach((msg: any) => {
        const key = `${msg.listing_id}:${msg.guest_id}`;
        
        if (!conversationMap.has(key)) {
            const guest = Array.isArray(msg.guests) ? msg.guests[0] : msg.guests;
            
            conversationMap.set(key, {
                id: key,
                customerName: guest?.name || "Guest",
                customerPhone: guest?.phone || null,
                channel: msg.channel,
                lastMessage: msg.content,
                lastMessageAt: msg.timestamp,
                unreadCount: !msg.is_read && msg.direction === 'inbound' ? 1 : 0,
                manager: { slug: "host-ai", name: "Host AI" }, // Placeholder, could be derived from listing
                status: "open", 
                bookingId: null 
            });
        } else {
            const conv = conversationMap.get(key);
            if (!msg.is_read && msg.direction === 'inbound') {
                conv.unreadCount += 1;
            }
        }
    });

    return NextResponse.json(Array.from(conversationMap.values()));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}