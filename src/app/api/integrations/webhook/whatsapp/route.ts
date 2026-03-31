import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { ControlService } from "@/lib/services/controlService";
import { wahaService } from "@/lib/services/wahaService";
import { FlowService } from "@/lib/services/flowService";
import { InboxService } from "@/lib/services/inboxService";
import { ContactService } from "@/lib/services/contactService";
import { NotificationService } from "@/lib/services/notificationService";
import { generateText } from "ai";
import { getToneInstruction, resolveAISettings } from "@/lib/ai/config";
import { settingsService } from "@/lib/services/settingsService";
import { log } from "@/lib/logger";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const body = await request.json();

    if (body.event !== "message" || body.payload?.fromMe === true) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const sender = body.payload.from;
    const text = body.payload.body;

    const supabase = await getSupabaseServer();

    // Verify tenant has WhatsApp integration
    const { data: integration } = await supabase
      .from("integrations")
      .select("id, status")
      .eq("tenant_id", tenantId)
      .eq("type", "whatsapp")
      .eq("status", "active")
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ error: "WhatsApp not configured for this tenant" }, { status: 403 });
    }

    // Resolve contact (unified customer profile)
    const contactResult = await ContactService.resolveContact(tenantId, [
      { type: "phone", value: sender },
      { type: "whatsapp_id", value: sender }
    ], {
      name: sender
    });

    const contact = contactResult.contact;
    let guestId = null;
    let aiPaused = false;

    if (contactResult.isNewContact) {
      log.info("New contact created from WhatsApp", { contactId: contact?.id, phone: sender });
    } else if (contactResult.wasLinked) {
      log.info("Existing contact linked via WhatsApp", { 
        contactId: contact?.id, 
        linkedChannels: contactResult.linkedChannels 
      });
    }

    // Send notification to host about new customer/cross-channel link
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
      .maybeSingle() as any;

    if (existingGuest) {
      guestId = existingGuest.id;
      aiPaused = !!existingGuest.ai_paused;
      
      // Link guest to contact if not already linked
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
      guestId = newGuest?.id;
    }

    // Sync conversation and get conversation_id
    const conversation = await InboxService.syncConversation({
      tenantId,
      externalId: sender,
      channel: "whatsapp",
      contactName: contact?.name || sender,
      lastMessagePreview: text?.slice(0, 100)
    });
    const conversationId = conversation?.id;

    // Insert message with conversation_id
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      conversation_id: conversationId,
      guest_id: guestId,
      direction: "inbound",
      role: "user",
      channel: "whatsapp",
      content: text,
      created_at: new Date().toISOString(),
      metadata: { read: false }
    });

    if (aiPaused) {
      return NextResponse.json({ success: true, ai_paused: true });
    }

    try {
      await ControlService.checkAction(tenantId, "ai");
      await ControlService.checkAction(tenantId, "payment");
      await ControlService.checkAction(tenantId, "message");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Action blocked";
      return NextResponse.json({
        success: true,
        blocked: true,
        reason: message,
      });
    }

    // Check Wallet Balance
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("tenant_id", tenantId)
      .single();

    if (walletError || !wallet) {
      console.error("Wallet fetch error", walletError);
      return NextResponse.json({ error: "Wallet not found" }, { status: 500 });
    }

    if (wallet.balance < 1) {
      return NextResponse.json({
        success: true,
        blocked: true,
        reason: "Insufficient credits",
      });
    }

    // Deduct Credit
    const { error: deductionError } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance - 1 })
      .eq("tenant_id", tenantId);

    if (deductionError) {
      console.error("Deduction error", deductionError);
      return NextResponse.json(
        { error: "Failed to deduct credit" },
        { status: 500 },
      );
    }

    await supabase.from("wallet_transactions").insert({
      tenant_id: tenantId,
      type: "deduction",
      amount: 1,
      metadata: { description: "WhatsApp AI Reply" }
    });

    // Visual Flow Execution (Custom Logic Interception)
    const flowResults = await FlowService.executeTrigger(
      tenantId,
      "message_received",
      {
        content: text,
        sender: sender,
        isGroup: sender.endsWith("@g.us"),
      },
    );

    // If a flow halted the execution, we stop here (e.g. it handled the reply or did a handover)
    if (flowResults?.some((r) => r.halted)) {
      return NextResponse.json({ success: true, flow_handled: true });
    }

    // Generate AI Reply
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type, ai_settings")
      .eq("id", tenantId)
      .single();

    const businessType = tenant?.business_type || "business";
    const appSettings = await settingsService.getSettings();
    const kaisaRuntime = resolveAISettings({
      provider: appSettings.api.kaisaProvider,
      model: appSettings.api.kaisaModel,
    });

    const aiSettings = tenant?.ai_settings as any;

    const prompt = [
      `You are an AI assistant for a ${businessType} business.`,
      getToneInstruction(aiSettings?.tone),
      aiSettings?.customInstructions?.trim(),
      `Reply to this customer message: ${text}`,
    ]
      .filter(Boolean)
      .join(" ");

    const { text: aiReply, usage } = await generateText({
      model: kaisaRuntime.model,
      prompt,
    });

    // Record AI Usage
    await supabase.from("ai_usage_events").insert({
      tenant_id: tenantId,
      action_type: "ai_reply",
      tokens_used: usage.totalTokens ?? 0,
      credits_deducted: 1, // Or dynamic based on tokens
      model: kaisaRuntime.model,
      metadata: {
        channel: "whatsapp",
        sender,
        provider: kaisaRuntime.provider,
      },
    });

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

    try {
      await wahaService.sendText({
        sessionName: tenantId,
        chatId: sender,
        text: aiReply,
      });
    } catch (e) {
      console.error("WAHA sendText failed:", e);
      return NextResponse.json({ success: true, send_failed: true });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
