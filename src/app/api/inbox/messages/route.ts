import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
  }

  // Support both legacy (listingId:guestId) and new (UUID) conversation IDs
  let query = supabase.from("messages").select("*");
  
  if (conversationId.includes(":")) {
    const [listingId, guestId] = conversationId.split(":");
    query = query.eq("listing_id", listingId).eq("guest_id", guestId);
  } else {
    query = query.eq("conversation_id", conversationId);
  }

  const { data: messages, error } = await query.order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const formatted = messages.map((m: any) => ({
      id: m.id,
      conversationId,
      senderType: m.direction === 'inbound' ? 'customer' : (m.sender_id === 'ai_assistant' ? 'ai' : 'human'),
      content: m.content,
      timestamp: m.created_at || m.timestamp,
      channel: m.channel,
      mediaUrl: m.metadata?.media_url,
      mediaType: m.metadata?.media_type,
      caption: m.metadata?.caption,
      status: m.status
  }));

  return NextResponse.json({ messages: formatted });
}