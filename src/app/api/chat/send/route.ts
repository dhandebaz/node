import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { withErrorHandler } from "@/lib/api/withErrorHandler";

export const POST = withErrorHandler(async function(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || 'unknown';
    const { success } = await rateLimit.limit(`chat_send_${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

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
            metadata: { read: false },
            created_at: new Date().toISOString()
        });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});