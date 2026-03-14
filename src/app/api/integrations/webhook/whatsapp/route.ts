import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { geminiService } from "@/lib/services/geminiService";
import { ControlService } from "@/lib/services/controlService";
import { wahaService } from "@/lib/services/wahaService";
import { FlowService } from "@/lib/services/flowService";

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const body = await request.json();

    if (body.event !== 'message' || body.payload?.fromMe === true) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const sender = body.payload.from;
    const text = body.payload.body;

    const supabase = await getSupabaseServer();

    await supabase.from("messages").insert({
      tenant_id: tenantId,
      direction: 'inbound',
      channel: 'whatsapp',
      content: text,
      sender_id: sender,
      timestamp: new Date().toISOString(),
      read: false
    });

    // Check for paused AI
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('ai_paused')
      .eq('phone', sender)
      .eq('tenant_id', tenantId)
      .single();

    if (existingGuest?.ai_paused) {
      return NextResponse.json({ success: true, ai_paused: true });
    }

    try {
      await ControlService.checkAction(tenantId, 'ai');
      await ControlService.checkAction(tenantId, 'payment');
      await ControlService.checkAction(tenantId, 'message');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Action blocked";
      return NextResponse.json({ success: true, blocked: true, reason: message });
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
      return NextResponse.json({ success: true, blocked: true, reason: "Insufficient credits" });
    }

    // Deduct Credit
    const { error: deductionError } = await supabase
      .from("wallets")
      .update({ balance: wallet.balance - 1 })
      .eq("tenant_id", tenantId);

    if (deductionError) {
      console.error("Deduction error", deductionError);
      return NextResponse.json({ error: "Failed to deduct credit" }, { status: 500 });
    }

    await supabase.from("wallet_transactions").insert({
      tenant_id: tenantId,
      type: "deduction",
      amount: 1,
      description: "WhatsApp AI Reply",
    });

    // Visual Flow Execution (Custom Logic Interception)
    const flowResults = await FlowService.executeTrigger(tenantId, 'message_received', {
      content: text,
      sender: sender,
      isGroup: sender.endsWith('@g.us')
    });

    // If a flow halted the execution, we stop here (e.g. it handled the reply or did a handover)
    if (flowResults?.some(r => r.halted)) {
      return NextResponse.json({ success: true, flow_handled: true });
    }

    // Generate AI Reply
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type")
      .eq("id", tenantId)
      .single();

    const businessType = tenant?.business_type || "business";
    const prompt = 'You are an AI assistant for a ' + businessType + ' business. Reply to this customer message: ' + text;

    const { text: aiReply, usage } = await geminiService.generateText(prompt);

    // Record AI Usage
    await supabase.from("ai_usage_events").insert({
        tenant_id: tenantId,
        action_type: 'ai_reply',
        tokens_used: usage.totalTokens,
        credits_deducted: 1, // Or dynamic based on tokens
        model: 'gemini-1.5-flash',
        metadata: { channel: 'whatsapp', sender }
    });

    await supabase.from("messages").insert({
      tenant_id: tenantId,
      direction: 'outbound',
      channel: 'whatsapp',
      content: aiReply,
      sender_id: 'ai_assistant',
      timestamp: new Date().toISOString(),
      read: true
    });

    try {
      await wahaService.sendText({ sessionName: tenantId, chatId: sender, text: aiReply });
    } catch (e) {
      console.error("WAHA sendText failed:", e);
      return NextResponse.json({ success: true, send_failed: true });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
