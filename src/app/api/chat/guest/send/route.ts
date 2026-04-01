import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { InboxService } from "@/lib/services/inboxService";
import { rateLimit } from "@/lib/ratelimit";
import { ContactService } from "@/lib/services/contactService";
import { NotificationService } from "@/lib/services/notificationService";

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

    // Validate content length to prevent abuse
    if (content.length > 5000) {
      return NextResponse.json({ error: "Message too long (max 5000 characters)" }, { status: 400 });
    }

    // Sanitize content - remove any HTML/script tags
    const sanitizedContent = content.replace(/<[^>]*>/g, '').trim();

    // Validate conversationId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID format" }, { status: 400 });
    }

    const supabase = await getSupabaseAdmin();

    // Verify the conversation exists
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, tenant_id")
      .eq("id", conversationId)
      .single();

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const tenantId = conversation.tenant_id;
    const listingId: string | null = null;

    // Create or update guest with contact resolution
    let guestId: string | null = null;

    if (guestPhone) {
      // Resolve contact for unified profile
      const contactResult = await ContactService.resolveContact(tenantId, [
        { type: "phone", value: guestPhone }
      ], {
        name: guestName,
        ip: request.headers.get("x-forwarded-for") || undefined,
        userAgent: request.headers.get("user-agent") || undefined
      });

      const contact = contactResult.contact;

      // Create guest linked to contact
      const { data: existingGuest } = await supabase
        .from("guests")
        .select("id, contact_id")
        .eq("phone", guestPhone)
        .eq("tenant_id", tenantId)
        .maybeSingle();

      if (existingGuest) {
        guestId = existingGuest.id;
        if (contact?.id && !existingGuest.contact_id) {
          await ContactService.linkGuestToContact(tenantId, existingGuest.id, contact.id);
        }
      } else {
        const { data: newGuest } = await supabase.from("guests").insert({
          tenant_id: tenantId,
          contact_id: contact?.id,
          name: guestName || "Guest",
          phone: guestPhone,
          channel: 'web',
          id_verification_status: 'none'
        } as any).select("id").single();
        guestId = newGuest?.id ?? null;
      }
    }

    // Insert message
    const { error } = await supabase
      .from("messages")
      .insert({
        tenant_id: tenantId,
        conversation_id: conversationId,
        guest_id: guestId,
        listing_id: listingId,
        role: 'guest',
        channel: 'web',
        direction: 'inbound',
        content: sanitizedContent,
        metadata: { read: false, guest_name: guestName },
        created_at: new Date().toISOString()
      } as any);

    if (error) throw error;

    // Send notification to host
    await NotificationService.notifyMessageReceived(tenantId, {
      sender: guestName || guestPhone || "Guest",
      preview: sanitizedContent.slice(0, 50),
      channel: "web",
      guestId: guestId || undefined
    });

    return NextResponse.json({ 
      success: true,
      conversationId: conversationId,
      guestId: guestId
    });

  } catch (error: any) {
    console.error("Public chat send error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
