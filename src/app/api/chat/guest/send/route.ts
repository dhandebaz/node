import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { InboxService } from "@/lib/services/inboxService";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || 'unknown';
    const { success } = await rateLimit.limit(`public_chat_send_${ip}`);
    if (!success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { conversationId, content, guestName, guestPhone } = await request.json();
    
    if (!conversationId || !content) {
      return NextResponse.json({ error: "Missing conversationId or content" }, { status: 400 });
    }

    const [listingId, guestId] = conversationId.split(":");
    if (!listingId) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    // Get tenant_id from listing
    const { data: listing } = await supabase
      .from("listings")
      .select("tenant_id")
      .eq("id", listingId)
      .single();

    if (!listing) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const tenantId = listing.tenant_id!;

    // Create or update guest
    let finalGuestId = guestId;

    if (!finalGuestId && (guestName || guestPhone)) {
      const { data: newGuest } = await supabase
        .from("guests")
        .insert({
          tenant_id: tenantId,
          name: guestName || "Guest",
          phone: guestPhone,
          channel: 'web',
          id_verification_status: 'none'
        } as any)
        .select("id")
        .single();
      
      finalGuestId = newGuest?.id;
    }

    // Sync conversation
    const conversation = await InboxService.syncConversation({
      tenantId,
      externalId: finalGuestId || guestPhone || "guest",
      channel: 'web',
      contactName: guestName,
      lastMessagePreview: content?.slice(0, 100)
    });

    // Insert message
    const convId = conversation?.id ?? conversationId;
    const { error } = await supabase
      .from("messages")
      .insert({
        tenant_id: tenantId,
        conversation_id: convId,
        guest_id: finalGuestId,
        listing_id: listingId,
        role: 'guest',
        channel: 'web',
        direction: 'inbound',
        content,
        metadata: { read: false, guest_name: guestName },
        created_at: new Date().toISOString()
      } as any);

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      conversationId: convId,
      guestId: finalGuestId
    });

  } catch (error: any) {
    console.error("Public chat send error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
