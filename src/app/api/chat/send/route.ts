import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/ratelimit";
import { withErrorHandler } from "@/lib/api/withErrorHandler";
import { InboxService } from "@/lib/services/inboxService";
import { requireActiveTenant } from "@/lib/auth/tenant";

export const POST = withErrorHandler(async function(request: NextRequest) {
  try {
    const tenantId = await requireActiveTenant();
    
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

    // Sync conversation to get conversation_id
    const conversation = await InboxService.syncConversation({
      tenantId,
      externalId: guestId,
      channel: 'web',
      lastMessagePreview: content?.slice(0, 100)
    });

    const { error } = await supabase
        .from("messages")
        .insert({
            tenant_id: tenantId,
            conversation_id: conversation?.id,
            guest_id: guestId,
            listing_id: listingId,
            role: sender === 'guest' ? 'guest' : 'host',
            channel: 'web',
            direction: sender === 'guest' ? 'inbound' : 'outbound',
            content,
            metadata: { read: false },
            created_at: new Date().toISOString()
        });

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Chat send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
});
