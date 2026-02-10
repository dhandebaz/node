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

  // Handle mock IDs gracefully by returning empty (or could keep mock data if needed for demo)
  if (!conversationId.includes(":")) {
      return NextResponse.json({ messages: [] });
  }

  const [listingId, guestId] = conversationId.split(":");

  const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .eq("listing_id", listingId)
      .eq("guest_id", guestId)
      .order("timestamp", { ascending: true });

  if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const formatted = messages.map((m: any) => ({
      id: m.id,
      conversationId,
      senderType: m.direction === 'inbound' ? 'customer' : 'human',
      content: m.content,
      timestamp: m.timestamp,
      channel: m.channel
  }));

  return NextResponse.json({ messages: formatted });
}