import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { geminiService } from "@/lib/services/geminiService";

// Verify Webhook (GET)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.META_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  } else {
    return new Response("Forbidden", { status: 403 });
  }
}

// Handle Messages (POST)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Safely extract the message
    const value = body.entry?.[0]?.changes?.[0]?.value;
    if (!value?.messages?.[0]) {
      // Return success if it's not a message event we care about (e.g. status update)
      return NextResponse.json({ success: true });
    }

    const msg = value.messages[0];
    const sender = msg.from; // Phone number
    const text = msg.text?.body;

    if (!text) {
      return NextResponse.json({ success: true }); // Ignore non-text messages for now
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json({ error: "Missing tenantId" }, { status: 400 });
    }

    const supabase = await getSupabaseServer();

    // 1. Check Wallet Balance
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
        { error: "Insufficient credits to process AI reply" },
        { status: 402 }
      );
    }

    // 2. Deduct Credit
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
      description: "Official WhatsApp AI Reply",
    });

    // 3. Fetch Tenant's WhatsApp Credentials
    const { data: integration, error: integrationError } = await supabase
      .from("integrations")
      .select("credentials")
      .eq("tenant_id", tenantId)
      .eq("provider", "whatsapp")
      .single();

    if (integrationError || !integration || !integration.credentials) {
      console.error("Integration not found", integrationError);
      return NextResponse.json({ error: "WhatsApp integration not found" }, { status: 404 });
    }

    // Parse JSONB credentials
    // Type assertion or check needed if credentials is strict type
    const credentials = integration.credentials as { phoneNumberId: string, accessToken: string };
    const { phoneNumberId, accessToken } = credentials;

    if (!phoneNumberId || !accessToken) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 500 });
    }

    // 4. Generate AI Reply
    // Fetch context (listings, etc) - simplified for brevity/speed as per instruction
    // "Generate AI reply using geminiService.generateText(prompt). Log to messages table."
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type")
      .eq("id", tenantId)
      .single();
      
    const businessType = tenant?.business_type || "business";
    const prompt = `You are a helpful AI assistant for a ${businessType}. User said: "${text}". Reply concisely.`;

    const aiReply = await geminiService.generateText(prompt);

    // 5. Log to Messages Table (Unified Inbox)
    // Insert User Message
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      direction: 'inbound',
      channel: 'whatsapp',
      content: text,
      sender_id: sender, // Using phone number as sender_id for now
      timestamp: new Date().toISOString(),
      read: false
    });

    // Insert AI Reply
    await supabase.from("messages").insert({
      tenant_id: tenantId,
      direction: 'outbound',
      channel: 'whatsapp',
      content: aiReply,
      sender_id: 'ai_assistant',
      timestamp: new Date().toISOString(),
      read: true
    });

    // 6. Send Reply via Meta Graph API
    await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: sender,
        type: 'text',
        text: { body: aiReply }
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
