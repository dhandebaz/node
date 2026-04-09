import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { ControlService } from "@/lib/services/controlService";
import { whatsappBusinessService } from "@/lib/services/whatsappBusinessService";
import { FlowService } from "@/lib/services/flowService";
import { InboxService } from "@/lib/services/inboxService";
import { ContactService } from "@/lib/services/contactService";
import { NotificationService } from "@/lib/services/notificationService";
import { generateText } from "ai";
import { getToneInstruction, resolveAISettings } from "@/lib/ai/config";
import { settingsService } from "@/lib/services/settingsService";
import { log } from "@/lib/logger";
import { cache } from "@/lib/cache/redis";
import { waitUntil } from "@vercel/functions";

const VERIFY_TOKEN = process.env.META_WHATSAPP_VERIFY_TOKEN;

/**
 * WhatsApp Business API Webhook Verification (GET)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (!VERIFY_TOKEN) {
    log.error("META_WHATSAPP_VERIFY_TOKEN not configured!");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    log.info("WhatsApp webhook verified successfully");
    return new Response(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

/**
 * WhatsApp Business API Webhook Message Processing (POST)
 */
export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // Get WhatsApp credentials from database
    const supabase = await getSupabaseAdmin();
    
    const { data: integration } = await supabase
      .from("integrations")
      .select("id, status, credentials")
      .eq("tenant_id", tenantId)
      .eq("provider", "whatsapp")
      .eq("status", "active")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ error: "WhatsApp not configured for this tenant" }, { status: 403 });
    }

    const credentials = integration.credentials as any;
    const accessToken = credentials?.access_token;
    const phoneNumberId = credentials?.phone_number_id;

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json({ error: "WhatsApp credentials incomplete" }, { status: 500 });
    }

    const appSecret = process.env.META_APP_SECRET;

    // Verify webhook signature
    if (appSecret && !whatsappBusinessService.verifyWebhookSignature(rawBody, signature, appSecret)) {
      log.warn("Invalid WhatsApp webhook signature", { tenantId });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Handle webhook verification requests from Meta
    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ignored" });
    }

    // Process each entry
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;

        // Skip status updates (delivery receipts, reads, etc.)
        if (!value.messages || value.messages.length === 0) {
          continue;
        }

        // Process each message
        for (const message of value.messages) {
          const messageId = message.id;
          const cacheKey = `wa_msg_id:${messageId}`;

          // IDEMPOTENCY CHECK
          const processed = await cache.get(cacheKey);
          if (processed) {
            log.info("[WhatsApp] Duplicate message ignored", { messageId });
            continue;
          }

          // Mark as processing (24h TTL)
          await cache.set(cacheKey, "processing", 86400);

          // BACKGROUND PROCESSING
          waitUntil(
            processIncomingMessage(tenantId, message, value, supabase, {
              accessToken,
              phoneNumberId,
              appSecret
            })
          );
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    log.error("WhatsApp webhook error:", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

async function processIncomingMessage(
  tenantId: string,
  message: any,
  value: any,
  supabase: any,
  config: { accessToken: string; phoneNumberId: string; appSecret?: string }
) {
  const { accessToken, phoneNumberId } = config;

  // Skip non-text messages and status updates
  if (message.type !== "text" && message.type !== "image" && message.type !== "document") {
    log.info("Skipping non-text message type:", message.type);
    return;
  }

  // Skip messages from our own bot (outgoing status updates)
  if (message.from === phoneNumberId) {
    return;
  }

  const sender = message.from;
  const messageId = message.id;
  const timestamp = message.timestamp;

  // Extract text content
  let text = "";
  if (message.type === "text" && message.text) {
    text = message.text.body;
  } else if (message.type === "image" && message.image) {
    text = "[Image]";
  } else if (message.type === "document" && message.document) {
    text = "[Document]";
  }

  if (!text) return;

  log.info("[WhatsApp] Incoming message", { tenantId, sender, messageId, type: message.type });

  // Mark message as read
  await whatsappBusinessService.markAsRead(messageId, config);

  // Resolve contact (unified customer profile)
  const contactResult = await ContactService.resolveContact(tenantId, [
    { type: "phone", value: sender },
    { type: "whatsapp_id", value: sender }
  ], {
    name: sender
  });

  const contact = contactResult.contact;
  let guestId: string | null = null;
  let aiPaused = false;

  if (contactResult.isNewContact) {
    log.info("New contact created from WhatsApp", { contactId: contact?.id, phone: sender });
  }

  // Send notification to host
  await NotificationService.notifyNewCustomer({
    tenantId,
    isNewContact: contactResult.isNewContact,
    wasLinked: contactResult.wasLinked,
    linkedChannels: contactResult.linkedChannels,
    contactId: contact?.id,
    contactName: contact?.name || sender,
    channel: "whatsapp"
  });

  // Get or create guest linked to contact
  const { data: existingGuest } = await supabase
    .from("guests")
    .select("id, ai_paused, contact_id")
    .eq("phone", sender)
    .eq("tenant_id", tenantId)
    .maybeSingle();

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
      name: sender,
      phone: sender,
      channel: "whatsapp"
    } as any).select("id").single();
    guestId = newGuest?.id ?? null;
  }

  // Sync conversation
  const conversation = await InboxService.syncConversation({
    tenantId,
    externalId: sender,
    channel: "whatsapp",
    contactName: contact?.name || sender,
    lastMessagePreview: text?.slice(0, 100)
  });
  const conversationId = conversation?.id;

  // Insert inbound message
  await supabase.from("messages").insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    guest_id: guestId,
    direction: "inbound",
    role: "user",
    channel: "whatsapp",
    content: text,
    created_at: new Date(timestamp * 1000).toISOString(),
    metadata: { read: false, whatsapp_message_id: messageId }
  });

  if (aiPaused) {
    return;
  }

  // Check actions
  try {
    await ControlService.checkAction(tenantId, "ai");
    await ControlService.checkAction(tenantId, "message");
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Action blocked";
    return;
  }

  // Check wallet balance
  const { data: wallet } = await supabase
    .from("wallets")
    .select("balance")
    .eq("tenant_id", tenantId)
    .single();

  if (!wallet || wallet.balance < 1) {
    return;
  }

  // Deduct credit
  await supabase
    .from("wallets")
    .update({ balance: wallet.balance - 1 })
    .eq("tenant_id", tenantId);

  await supabase.from("wallet_transactions").insert({
    tenant_id: tenantId,
    type: "deduction",
    amount: 1,
    metadata: { description: "WhatsApp AI Reply" }
  });

  // Visual flow execution
  const flowResults = await FlowService.executeTrigger(tenantId, "message_received", {
    content: text,
    sender: sender,
    channel: "whatsapp"
  });

  if (flowResults?.some((r) => r.halted)) {
    return;
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

  let aiReply = "";
  let usage: any = { totalTokens: 0 };

  // If hospitality, use the specialized Host AI Engine
  if (tenant?.business_type === "hospitality" || tenant?.business_type === "hotel") {
    const { OmniAIExecutive } = await import("@/lib/services/omniAIExecutive");
    
    const context = {
      clientName: contact.name,
      resourceId: searchResults?.id || "unknown",
      startDate: searchResults?.check_in || "N/A",
      endDate: searchResults?.check_out || "N/A",
      channel: "WHATSAPP" as const,
      language: "English"
    };

    const engineResult = await OmniAIExecutive.processIncomingMessage(text, context);
    aiReply = engineResult.responseText;
    log.info(`[WhatsApp] Host AI Intent classified as: ${engineResult.intent}`);

    // CRM Status Movement Trigger
    if (engineResult.suggestedStatus && conversationId) {
      try {
        await InboxService.updateConversationStatus(
          tenantId,
          conversationId,
          engineResult.suggestedStatus as any
        );
        log.info(`[WhatsApp] CRM Movement: Moved conversation ${conversationId} to ${engineResult.suggestedStatus}`);
      } catch (err) {
        log.error("[WhatsApp] CRM Movement failed", { error: err });
      }
    }
  } else {
    // Standard AI generic fallback
    const prompt = [
      `You are an AI assistant for a ${tenant?.business_type || "business"}.`,
      getToneInstruction(aiSettings?.tone),
      aiSettings?.customInstructions?.trim(),
      `Reply to this customer message: ${text}`,
    ].filter(Boolean).join(" ");

    const result = await generateText({
      model: kaisaRuntime.model,
      prompt,
    });
    aiReply = result.text;
    usage = result.usage;
  }

  // Record AI usage
  await supabase.from("ai_usage_events").insert({
    tenant_id: tenantId,
    action_type: "ai_reply",
    tokens_used: usage.totalTokens ?? 0,
    credits_deducted: 1,
    model: kaisaRuntime.model,
    metadata: {
      channel: "whatsapp",
      sender,
      provider: kaisaRuntime.provider,
    },
  });

  // Record outbound message
  await supabase.from("messages").insert({
    tenant_id: tenantId,
    conversation_id: conversationId,
    guest_id: guestId,
    direction: "outbound",
    role: "assistant",
    channel: "whatsapp",
    content: aiReply,
    created_at: new Date().toISOString(),
    metadata: { read: true }
  });

  // Send reply via WhatsApp Business API
  const result = await whatsappBusinessService.sendText(
    { recipientPhone: sender, message: aiReply },
    { accessToken, phoneNumberId }
  );

  if (!result.success) {
    log.error("[WhatsApp] Failed to send reply", { error: result.error });
  }
}
