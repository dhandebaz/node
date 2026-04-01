import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";
import { ControlService } from "@/lib/services/controlService";
import { ChannelService } from "@/lib/services/channelService";
import { FlowService } from "@/lib/services/flowService";
import { InboxService } from "@/lib/services/inboxService";
import { ContactService } from "@/lib/services/contactService";
import { NotificationService } from "@/lib/services/notificationService";
import { generateText } from "ai";
import { getToneInstruction, resolveAISettings } from "@/lib/ai/config";
import { settingsService } from "@/lib/services/settingsService";

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
    chat: {
      id: number;
      type: string;
    };
    text?: string;
    date: number;
  };
  edited_message?: {
    message_id: number;
    from?: { id: number };
    chat: { id: number };
    text?: string;
    edit_date: number;
  };
}

interface TelegramWebhookBody {
  update_id: number;
  message?: TelegramUpdate["message"];
  edited_message?: TelegramUpdate["edited_message"];
}

async function verifyTelegramWebhook(request: Request, tenantId: string): Promise<boolean> {
  const supabase = await getSupabaseAdmin();
  
  const { data: integration } = await supabase
    .from("integrations")
    .select("credentials")
    .eq("tenant_id", tenantId)
    .eq("provider", "telegram")
    .eq("status", "active")
    .maybeSingle();

  if (!integration?.credentials) return false;
  
  const credentials = integration.credentials as any;
  const secretToken = credentials.bot_token;
  
  // Get the secret from the request header (set when webhook was configured)
  const secret = request.headers.get("x-telegram-bot-api-secret-token");
  
  // If no secret is configured on either side, we rely on tenantId verification
  // which is set when the webhook URL was configured
  if (!secret) return true; // Trust if no secret required
  
  // Compare secret tokens
  return secret === secretToken;
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    // Verify webhook authenticity
    const isValid = await verifyTelegramWebhook(request, tenantId);
    if (!isValid) {
      log.warn("Invalid Telegram webhook request", { tenantId });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: TelegramWebhookBody = await request.json();
    const supabase = await getSupabaseAdmin();

    // Verify tenant has Telegram integration
    const { data: integration } = await supabase
      .from("integrations")
      .select("id, status, credentials")
      .eq("tenant_id", tenantId)
      .eq("provider", "telegram")
      .eq("status", "active")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ error: "Telegram not configured for this tenant" }, { status: 403 });
    }

    // Handle edited messages
    const editedMsg = body.edited_message;
    if (editedMsg) {
      log.info("Telegram edited message received (ignoring)", { updateId: body.update_id });
      return NextResponse.json({ success: true, ignored: "edited_message" });
    }

    const message = body.message;
    if (!message) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Ignore group messages
    if (message.chat.type !== "private") {
      return NextResponse.json({ success: true, ignored: "group_message" });
    }

    const senderId = message.from?.id?.toString();
    const chatId = message.chat.id.toString();
    const text = message.text;
    const senderName = message.from
      ? [message.from.first_name, message.from.last_name].filter(Boolean).join(" ") || `User ${senderId?.slice(-4)}`
      : `User ${senderId?.slice(-4)}`;

    if (!senderId) {
      return NextResponse.json({ error: "Missing sender ID" }, { status: 400 });
    }

    // Resolve contact (unified customer profile)
    const contactResult = await ContactService.resolveContact(tenantId, [
      { type: "telegram_id", value: senderId }
    ], {
      name: senderName
    });

    const contact = contactResult.contact;
    let guestId: string | null = null;
    let aiPaused = false;

    if (contactResult.wasLinked) {
      log.info("Existing contact linked via Telegram", {
        contactId: contact?.id,
        linkedChannels: contactResult.linkedChannels
      });
    }

    // Send notification to host
    await NotificationService.notifyNewCustomer({
      tenantId,
      isNewContact: contactResult.isNewContact,
      wasLinked: contactResult.wasLinked,
      linkedChannels: contactResult.linkedChannels,
      contactId: contact?.id,
      contactName: contact?.name || senderName,
      channel: "telegram"
    });

    // Get or create guest linked to contact
    const { data: existingGuest } = await supabase
      .from("guests")
      .select("id, ai_paused, contact_id")
      .eq("phone", senderId)
      .eq("tenant_id", tenantId)
      .maybeSingle() as any;

    if (existingGuest) {
      guestId = existingGuest.id;
      aiPaused = !!existingGuest.ai_paused;

      if (contact?.id && !existingGuest.contact_id) {
        await ContactService.linkGuestToContact(tenantId, existingGuest.id, contact.id);
      }
    } else {
      const { data: newGuest } = await supabase.from("guests").insert({
        tenant_id: tenantId,
        contact_id: contact?.id,
        name: senderName,
        phone: senderId,
        channel: "telegram"
      } as any).select("id").single();
      guestId = newGuest?.id ?? null;
    }

    // Sync conversation and get conversation_id
    const conversation = await InboxService.syncConversation({
      tenantId,
      externalId: senderId,
      channel: "telegram" as any,
      contactName: contact?.name || senderName,
      lastMessagePreview: text?.slice(0, 100)
    });
    const conversationId = conversation?.id;

    // Record inbound message with conversation_id
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      guest_id: guestId,
      direction: "inbound",
      role: "user",
      channel: "telegram",
      content: text,
      created_at: new Date().toISOString(),
      metadata: { read: false, telegram_message_id: message.message_id?.toString() || null }
    });

    if (aiPaused) {
      return NextResponse.json({ success: true, ai_paused: true });
    }

    // Basic action checks
    try {
      await ControlService.checkAction(tenantId, "ai");
      await ControlService.checkAction(tenantId, "message");
    } catch (error: unknown) {
      return NextResponse.json({ success: true, blocked: true });
    }

    // Check wallet balance
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("tenant_id", tenantId)
      .single();

    if (!wallet || wallet.balance < 1) {
      return NextResponse.json({ success: true, blocked: true, reason: "Insufficient credits" });
    }

    // Visual flow execution
    const flowResults = await FlowService.executeTrigger(tenantId, "message_received", {
      content: text,
      sender: senderId,
      channel: "telegram"
    });

    if (flowResults?.some((r) => r.halted)) {
      return NextResponse.json({ success: true, flow_handled: true });
    }

    // Generate AI reply
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

    // Record outbound message
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      guest_id: guestId,
      direction: "outbound",
      role: "assistant",
      channel: "telegram",
      content: aiReply,
      created_at: new Date().toISOString(),
      metadata: { read: true }
    });

    // Dispatch via ChannelService (Telegram Bot API)
    await ChannelService.sendMessage({
      tenantId,
      recipientId: chatId,
      content: aiReply,
      channel: "telegram"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("Telegram Webhook error:", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
