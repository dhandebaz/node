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

    // Fetch from the new unified conversations table
    const { data: conversations, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("last_message_at", { ascending: false });

    if (error) throw error;

    // Map to the format expected by the frontend
    const mappedConversations = conversations?.map((conv: any) => ({
      id: conv.id,
      customerName: conv.contact_name || "Guest",
      customerPhone: conv.external_id || null,
      channel: conv.channel,
      lastMessage: conv.metadata?.last_message_preview || "No messages",
      lastMessageAt: conv.last_message_at,
      unreadCount: conv.metadata?.unread_count || 0,
      manager: { slug: "kaisa-ai", name: "Kaisa AI" },
      status: conv.status || "open",
      bookingId: conv.metadata?.booking_id || null,
      guestId: conv.metadata?.guest_id || null,
      aiPaused: conv.metadata?.ai_paused || false
    }));

    return NextResponse.json({ 
      conversations: mappedConversations || [],
      meta: {
        walletStatus: "healthy", // TODO: Real wallet check
        integrationStatus: "connected", // TODO: Real integration check
        channelErrors: []
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}