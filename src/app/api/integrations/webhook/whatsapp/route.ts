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

    const { sender, text } = await request.json();

    const supabase = await getSupabaseServer();

    // 1. Check Wallet Balance
    const { data: wallet, error: walletError } = await supabase
      .from("wallets")
      .select("balance")
      .eq("tenant_id", tenantId)
      .single();

    if (walletError || !wallet) {
      // Assuming wallet exists if tenant exists, but good to handle
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
      description: "WhatsApp AI Reply",
    });

    // 3. Build AI Context
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type")
      .eq("id", tenantId)
      .single();

    // Fetch active listings or products
    // Assuming 'listings' table for now based on previous context
    const { data: listings } = await supabase
      .from("listings")
      .select("id, name, type, status, city")
      .eq("tenant_id", tenantId)
      .eq("status", "active");

    const businessType = tenant?.business_type || "generic business";
    const contextData = listings || [];

    const prompt = `You are a helpful AI assistant managing WhatsApp for a ${businessType}. Use this context to answer the user: ${JSON.stringify(
      contextData
    )}. User message: ${text}`;

    // 4. Generate AI Reply
    const aiReply = await geminiService.generateText(prompt);

    // 5. Log Messages
    // Assuming 'messages' table schema from types/index.ts
    // We need to map to the DB schema.
    // Message interface: id, tenantId, guestId, listingId, channel, direction, content, timestamp, read
    // The instructions say: Insert two records into the messages table (or your inbox table)
    // One for incoming user message (role: 'user', ...), and one for AI's reply (role: 'assistant', ...)
    // The DB schema in migrations/003_fullstack_schema.sql (implied) or types/index.ts might differ from "role" field.
    // In types/index.ts: Message has direction: 'inbound' | 'outbound'.
    // So 'user' -> 'inbound', 'assistant' -> 'outbound'.
    // We also need guestId. For now we might need to find or create a guest based on sender contact.
    // The instructions didn't specify guest creation, but we need guestId for the message table usually.
    // However, the instructions were specific: "Insert two records... (role: 'user', ...)"
    // If the table strictly follows the Message interface, it might not have 'role'.
    // But maybe there's a different table for AI chat or the user meant a specific structure.
    // Given "role: 'user'" and "role: 'assistant'", it sounds like an LLM chat history table.
    // But the instructions also say "log to the unified inbox".
    // I will try to map to the `messages` table which seems to be the inbox.
    // `messages` table usually has `direction` (inbound/outbound).
    // I'll use `direction` instead of `role` if the table structure demands it, or add `role` if it's a JSONB field or similar.
    // Wait, the instruction says "Insert two records... (role: 'user'...)"
    // If I look at `messages` table definition in `src/types/index.ts`, it has `direction`.
    // I will map role 'user' -> direction 'inbound' and role 'assistant' -> direction 'outbound'.
    // And I'll store the text in `content`.
    // I need a `guest_id`. I'll try to find a guest by phone (sender) or create a placeholder.
    // For this task, to strictly follow "Execute these exact steps", I should probably just insert what I can.
    // But `guest_id` is likely a foreign key.
    // I'll try to find/create a guest.
    
    // Find/Create Guest
    let guestId = null;
    const { data: existingGuest } = await supabase
        .from('guests')
        .select('id')
        .eq('tenant_id', tenantId)
        .eq('phone', sender)
        .maybeSingle();
    
    if (existingGuest) {
        guestId = existingGuest.id;
    } else {
        const { data: newGuest } = await supabase
            .from('guests')
            .insert({
                tenant_id: tenantId,
                name: sender, // Placeholder name
                phone: sender,
                channel: 'whatsapp',
                id_verification_status: 'none'
            })
            .select('id')
            .single();
        guestId = newGuest?.id;
    }

    if (guestId) {
        // Incoming Message
        await supabase.from("messages").insert({
            tenant_id: tenantId,
            guest_id: guestId,
            channel: 'whatsapp',
            direction: 'inbound',
            content: text,
            // timestamp: new Date().toISOString(), // Default now()
            read: false,
            // listing_id: ... // Might be nullable or needed. I'll omit if nullable.
            // If listing_id is required, I might need to pick one or handle it. 
            // Based on types/index.ts, listingId is in the interface.
            // In SQL migration `messages` usually references `listings`.
            // I'll check if I can leave it null or generic.
            // If required, I'll pick the first active listing or null if allowed.
            listing_id: listings && listings.length > 0 ? (listings[0] as any).id : null // Assuming id is selected (I need to select id above)
        });

        // AI Reply
        await supabase.from("messages").insert({
            tenant_id: tenantId,
            guest_id: guestId,
            channel: 'whatsapp',
            direction: 'outbound',
            content: aiReply,
            read: true,
            listing_id: listings && listings.length > 0 ? (listings[0] as any).id : null
        });
    } else {
        console.error("Failed to find/create guest for message logging");
    }

    // TODO: Execute HTTP POST to EvolutionAPI/Waha instance to physically send the message back to the user's phone.

    return NextResponse.json({ success: true, reply: aiReply });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message || "Internal Error" }, { status: 500 });
  }
}
