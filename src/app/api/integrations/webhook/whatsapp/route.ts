import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { geminiService } from "@/lib/services/geminiService";

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

    // Check for paused AI
    const { data: existingGuest } = await supabase
      .from('guests')
      .select('ai_paused')
      .eq('phone', sender)
      .eq('tenant_id', tenantId)
      .single();

    if (existingGuest?.ai_paused) {
      await supabase.from("messages").insert({
        tenant_id: tenantId,
        direction: 'inbound',
        channel: 'whatsapp',
        content: text,
        sender_id: sender,
        timestamp: new Date().toISOString(),
        read: false
      });
      return NextResponse.json({ success: true, ai_paused: true });
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
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
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

    // Generate AI Reply
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type")
      .eq("id", tenantId)
      .single();

    const businessType = tenant?.business_type || "business";
    const prompt = 'You are an AI assistant for a ' + businessType + ' business. Reply to this customer message: ' + text;

    const aiReply = await geminiService.generateText(prompt);

    // Insert messages
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      direction: 'inbound',
      channel: 'whatsapp',
      content: text,
      sender_id: sender,
      timestamp: new Date().toISOString(),
      read: false
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

    // Send Reply back to VPS
    await fetch(process.env.WAHA_SERVER_URL + '/api/sendText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session: tenantId,
        chatId: sender,
        text: aiReply
      })
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
