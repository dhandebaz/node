import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { ControlService } from "@/lib/services/controlService";

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
      return NextResponse.json({ error: error.message }, { status: 503 });
    }

    // Branding Check
    const { data: tenant } = await supabase
      .from("tenants")
      .select("is_branding_enabled, business_type")
      .eq("id", tenantId)
      .single();

    let finalContent = content;
    // Append branding if enabled and not already present (to avoid double stamping)
    if (tenant?.is_branding_enabled) {
      let brandingText = "Powered by Nodebase AI"; // Default
      
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
    
    // Insert into DB
    const { data: message, error } = await supabase.from("messages").insert({
        tenant_id: tenantId,
        listing_id: listingId,
        guest_id: guestId,
        direction: 'outbound',
        role: senderType === 'ai' ? 'assistant' : 'host',
        content: finalContent,
        channel: body?.channel || "web",
        timestamp: new Date().toISOString(),
        is_read: true
    }).select().single();

    if (error) {
       console.error("Message insert error:", error);
       // Fallback for mock if DB fails or table doesn't match expected schema exactly
       // But we should try to error out to catch issues.
       throw error;
    }

    return NextResponse.json({ 
        message: {
            id: message.id,
            conversationId,
            senderType,
            channel: message.channel,
            content: message.content,
            timestamp: message.timestamp
        } 
    });
  } catch (error: any) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: error?.message || "Failed to send message" }, { status: 500 });
  }
}
