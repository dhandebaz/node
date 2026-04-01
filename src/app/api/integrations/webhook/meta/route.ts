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

function verifyMetaSignature(payload: string, signature: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !signature) return true; // Skip if no secret configured

  const crypto = require('crypto');
  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(payload)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Meta Webhook Verification (GET)
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.META_VERIFY_TOKEN;
  
  // Fail if no verify token is configured (security best practice)
  if (!verifyToken) {
    log.error("META_VERIFY_TOKEN not configured!");
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

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

    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    // Verify Meta signature if app secret is configured
    if (!verifyMetaSignature(rawBody, signature)) {
      log.warn("Invalid Meta webhook signature", { tenantId });
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Meta sends messages in entry -> messaging/changes
    const entry = body.entry?.[0];
    if (!entry) return NextResponse.json({ success: true, ignored: true });

    const supabase = await getSupabaseAdmin();

    // 1. Handle Changes (LeadGen, Feed, Comments)
    if (entry.changes) {
      for (const change of entry.changes) {
        const { field, value } = change;

        // --- Lead Generation Use Case ---
        if (field === "leadgen") {
          const leadgenId = value.leadgen_id;
          log.info("[MetaWebhook] New lead received", { leadgenId, tenantId });
          
          // Fetch full lead data using Marketing Service
          const { data: integration } = await supabase
            .from("integrations")
            .select("access_token")
            .eq("tenant_id", tenantId)
            .eq("provider", "meta")
            .maybeSingle();

          if (integration?.access_token) {
            const { decryptToken } = await import("@/lib/crypto");
            const { MetaMarketingService } = await import("@/lib/services/metaMarketingService");
            const leadData = await MetaMarketingService.getLeads(leadgenId, decryptToken(integration.access_token));
            
            // Record lead in contacts or a specific leads table
            if (leadData.success && leadData.leads?.[0]) {
              const lead = leadData.leads[0];
              await ContactService.resolveContact(tenantId, [
                { type: "other", value: lead.id }
              ], {
                name: "Meta Lead"
              });
            }
          }
        }

        // --- Page Feed / Moderation Use Case ---
        if (field === "feed" || field === "comments") {
          const item = value.item; // 'comment' or 'status'
          const verb = value.verb; // 'add', 'edited', 'deleted'
          
          if (verb === "add" && (item === "comment" || item === "status")) {
            log.info("[MetaWebhook] New Page activity", { item, tenantId });
            // Here we could trigger a notification or record a message in a "Moderation" inbox
            await NotificationService.notifyNewCustomer({
               tenantId,
               channel: "facebook_page",
               contactName: value.from?.name || "Page Visitor"
            } as any);
          }
        }
      }
      return NextResponse.json({ success: true, processed: "changes" });
    }

    // 2. Handle Messaging (Instagram/Messenger)
    const messaging = entry.messaging?.[0];
    if (!messaging || !messaging.message || messaging.message.is_echo) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const senderId = messaging.sender.id;
    const text = messaging.message.text;
    const channel = entry.id ? 'instagram' : 'messenger';

    // Verify tenant has Meta integration
    const integrationType = channel === 'instagram' ? 'instagram' : 'messenger';
    const { data: integration } = await supabase
      .from("integrations")
      .select("id, status")
      .eq("tenant_id", tenantId)
      .eq("type" as any, integrationType)
      .eq("status", "active")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ error: `${channel} not configured for this tenant` }, { status: 403 });
    }

    const contactName = `User ${senderId.slice(-4)}`;
    const identifierType = channel === 'instagram' ? 'instagram_id' : 'other';

    // Resolve contact (unified customer profile)
    const contactResult = await ContactService.resolveContact(tenantId, [
      { type: identifierType, value: senderId }
    ], {
      name: contactName
    });

    const contact = contactResult.contact;
    let guestId = null;
    let aiPaused = false;

    if (contactResult.wasLinked) {
      log.info(`Existing contact linked via ${channel}`, { 
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
      contactName: contact?.name || contactName,
      channel: channel as string
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
        name: contactName,
        phone: senderId,
        channel
      } as any).select("id").single();
      guestId = newGuest?.id;
    }

    // Sync conversation and get conversation_id
    const conversation = await InboxService.syncConversation({
      tenantId,
      externalId: senderId,
      channel: channel as 'instagram' | 'messenger',
      contactName: contact?.name || contactName,
      lastMessagePreview: text?.slice(0, 100)
    });
    const conversationId = conversation?.id;

    // Record Inbound Message with conversation_id
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
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

    const { text: aiReply } = await generateText({
      model: kaisaRuntime.model,
      prompt,
    });

    // 4. Record and Dispatch Outbound with conversation_id
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
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
    log.error("Meta Webhook error:", { error: (error as Error).message });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
