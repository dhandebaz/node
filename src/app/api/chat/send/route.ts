import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { conversationId, content, sender } = await request.json();
    if (!conversationId || !content) {
         return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const [listingId, guestId] = conversationId.split(":");
    if (!listingId || !guestId) {
        return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    const { error } = await supabase
        .from("messages")
        .insert({
            guest_id: guestId,
            listing_id: listingId,
            channel: 'web',
            direction: sender === 'guest' ? 'inbound' : 'outbound',
            content,
            is_read: false,
            timestamp: new Date().toISOString()
        });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}