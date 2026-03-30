import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { ControlService } from "@/lib/services/controlService";
import { ChannelService } from "@/lib/services/channelService";
import { FlowService } from "@/lib/services/flowService";
import { generateText } from "ai";
import { getToneInstruction, resolveAISettings } from "@/lib/ai/config";
import { settingsService } from "@/lib/services/settingsService";

/**
 * Meta Webhook Verification (GET)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN || "nodebase_verify_token";

  if (mode === "subscribe" && token === verifyToken) {
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * Meta Webhook Message Processing (POST)
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const body = await request.json();

    // Meta sends messages in entry -> messaging/changes
    const entry = body.entry?.[0];
    if (!entry) return NextResponse.json({ success: true, ignored: true });

    // Handle Instagram/Messenger Messaging
    const messaging = entry.messaging?.[0];
    if (!messaging || !messaging.message || messaging.message.is_echo) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const senderId = messaging.sender.id;
    const text = messaging.message.text;
    const channel = entry.id ? 'instagram' : 'messenger'; // Simplified logic for channel detection

    const supabase = await getSupabaseAdmin();

    // Get or create guest
    let guestId = null;
    let aiPaused = false;
    
    // We use sender_id (scoped to the Meta App) as the unique identifier
    const { data: existingGuest } = await supabase
      .from("guests")
      .select("id, ai_paused")
      .eq("phone", senderId)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (existingGuest) {
      guestId = existingGuest.id;
      aiPaused = !!existingGuest.ai_paused;
    } else {
      const { data: newGuest } = await supabase.from("guests").insert({
        tenant_id: tenantId,
        name: `User ${senderId.slice(-4)}`,
        phone: senderId,
        channel
      }).select("id").single();
      guestId = newGuest?.id;
    }

    // Record Inbound Message
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      guest_id: guestId,
      direction: "inbound",
      role: "user",
      channel: channel,
      content: text,
      created_at: new Date().toISOString(),
      metadata: { read: false, meta_message_id: messaging.message.mid }
    });

    if (aiPaused) {
      return NextResponse.json({ success: true, ai_paused: true });
    }

    // Basic Action Checks
    try {
      await ControlService.checkAction(tenantId, "ai");
      await ControlService.checkAction(tenantId, "message");
    } catch (error: unknown) {
      return NextResponse.json({ success: true, blocked: true });
    }

    // Logic for AI Reply (Same/Similar to WhatsApp Hook)
    // 1. Check Wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("tenant_id", tenantId)
      .single();

    if (!wallet || wallet.balance < 1) {
      return NextResponse.json({ success: true, blocked: true, reason: "Insufficient credits" });
    }

    // 2. Visual Flow Execution
    const flowResults = await FlowService.executeTrigger(tenantId, "message_received", {
      content: text,
      sender: senderId,
      channel: channel
    });

    if (flowResults?.some((r) => r.halted)) {
      return NextResponse.json({ success: true, flow_handled: true });
    }

    // 3. Generate AI Reply
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type, ai_settings")
      .eq("id", tenantId)
      .single();

    const appSettings = await settingsService.getSettings();
    const kaisaRuntime = resolveAISettings({
      provider: appSettings.api.kaisaProvider,
      model: appSettings.api.kaisaModel,
    });

    const aiSettings = tenant?.ai_settings as any;

    const prompt = [
      `You are an AI assistant for a ${tenant?.business_type || "business"}.`,
      getToneInstruction(aiSettings?.tone),
      aiSettings?.customInstructions?.trim(),
      `Reply to this customer message: ${text}`,
    ].filter(Boolean).join(" ");

    const { text: aiReply, usage } = await generateText({
      model: kaisaRuntime.model,
      prompt,
    });

    // 4. Record and Dispatch Outbound
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      guest_id: guestId,
      direction: "outbound",
      role: "assistant",
      channel: channel,
      content: aiReply,
      created_at: new Date().toISOString(),
      metadata: { read: true }
    });

    // Dispatch via ChannelService (uses Meta Graph API Send endpoint)
    await ChannelService.sendMessage({
      tenantId,
      recipientId: senderId,
      content: aiReply,
      channel: channel as 'instagram' | 'messenger'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("Meta Webhook error:", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
