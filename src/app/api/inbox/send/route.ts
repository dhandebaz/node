import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { ControlService } from "@/lib/services/controlService";
import { ChannelService } from "@/lib/services/channelService";
import { InboxService } from "@/lib/services/inboxService";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conversationId, content, senderType } = body || {};

    if (!conversationId || !content || !senderType) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tenantId = await requireActiveTenant();

    // Check kill switch for messaging
    try {
      await ControlService.checkAction(tenantId, 'message');
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: error?.status || 503 });
    }

    // Branding Check
    const { data: tenant } = await supabase
      .from("tenants")
      .select("is_branding_enabled, business_type")
      .eq("id", tenantId)
      .single();

    let finalContent = content;
    if (tenant?.is_branding_enabled) {
      let brandingText = "Powered by Nodebase AI";
      
      switch (tenant.business_type) {
        case 'kirana_store':
        case 'thrift_store':
          brandingText = "This store uses Nodebase AI";
          break;
        case 'doctor_clinic':
          brandingText = "Automated by Nodebase";
          break;
        case 'airbnb_host':
        default:
          brandingText = "Powered by Nodebase AI";
          break;
      }

      if (!finalContent.includes(brandingText)) {
        finalContent += `\n\n${brandingText}`;
      }
    }

    const [listingId, guestId] = conversationId.split(":");
    
    // Fetch conversation to get channel and externalId
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, channel, external_id")
      .eq("id", conversationId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    // If conversation exists, use it; otherwise sync it
    let convId = conversation?.id;
    const channel = body?.channel || conversation?.channel || "web";
    const externalId = conversation?.external_id;

    if (!convId && externalId) {
      const synced = await InboxService.syncConversation({
        tenantId,
        externalId,
        channel: channel as any,
        lastMessagePreview: finalContent?.slice(0, 100)
      });
      convId = synced?.id;
    }
    
    // Insert into DB with conversation_id
    const { data: message, error } = await supabase.from("messages").insert({
        tenant_id: tenantId,
        conversation_id: convId,
        listing_id: listingId,
        guest_id: guestId,
        direction: 'outbound',
        role: senderType === 'ai' ? 'assistant' : 'host',
        content: finalContent,
        channel: channel,
        created_at: new Date().toISOString(),
        metadata: { read: true }
    }).select().single();

    if (error || !message) {
       console.error("Message insert error:", error);
       throw error || new Error("Failed to insert message");
    }

    const m = message as any;

    // Dispatch via ChannelService for non-web channels
    if (channel !== "web" && externalId) {
      try {
        await ChannelService.sendMessage({
          tenantId,
          recipientId: externalId,
          content: finalContent,
          channel: channel as any
        });
      } catch (dispatchError) {
        console.error("Failed to dispatch message via channel:", dispatchError);
      }
    }

    return NextResponse.json({ 
        message: {
            id: m.id,
            conversationId: convId || conversationId,
            senderType,
            channel: m.channel,
            content: m.content,
            timestamp: m.created_at
        } 
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: error?.message || "Failed to send message" }, { status: 500 });
  }
}
