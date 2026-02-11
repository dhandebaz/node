import { NextResponse } from 'next/server';
import { getSupabaseServer } from "@/lib/supabase/server";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { FailureService } from "@/lib/services/failureService";
import { ControlService } from "@/lib/services/controlService";
import { getPersonaAIDefaults } from "@/lib/business-context";
import { WalletService } from "@/lib/services/walletService";
import { PricingService } from "@/lib/services/pricingService";
import { SubscriptionService } from "@/lib/services/subscriptionService";

import { MemoryService } from "@/lib/services/memoryService";

export async function POST(request: Request) {
  try {
    // 1. Tenant & Auth Check
    const tenantId = await requireActiveTenant();
    
    // Check Kill Switches & Tenant Controls
    try {
      await ControlService.checkAction(tenantId, 'ai');
    } catch (e: any) {
      await logEvent({
        tenant_id: tenantId,
        actor_type: 'ai',
        event_type: EVENT_TYPES.ACTION_BLOCKED,
        entity_type: 'control',
        entity_id: 'ai_kill_switch',
        metadata: { reason: e.message }
      });
      return NextResponse.json({ error: e.message }, { status: 403 });
    }

    const supabase = await getSupabaseServer();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check for blocking failures
    const blockers = await FailureService.checkBlockers(tenantId);
    const aiBlockers = blockers.filter(f => f.category === 'ai' || f.category === 'payment');
    
    if (aiBlockers.length > 0) {
      return NextResponse.json({ 
        error: "AI actions paused due to system failure", 
        failure: aiBlockers[0] 
      }, { status: 503 });
    }

    // 2. Subscription Limit Check (AI Replies)
    const { allowed: aiAllowed, limit: aiLimit, current: aiCurrent } = await SubscriptionService.checkDailyLimit(tenantId, 'ai_replies');
    if (!aiAllowed) {
       await logEvent({
        tenant_id: tenantId,
        actor_type: 'ai',
        event_type: EVENT_TYPES.ACTION_BLOCKED,
        entity_type: 'subscription',
        entity_id: 'daily_limit',
        metadata: { limit: aiLimit, current: aiCurrent }
      });
      return NextResponse.json({ 
        error: `Daily AI limit reached (${aiLimit}). Upgrade your plan to increase limits.` 
      }, { status: 403 });
    }

    // 3. Wallet Balance Check (Pre-flight)
    const MIN_ESTIMATED_TOKENS = 100;
    const estimatedCost = await PricingService.calculateCost('ai_reply', MIN_ESTIMATED_TOKENS, tenantId);
    const hasBalance = await WalletService.hasSufficientBalance(tenantId, estimatedCost);

    if (!hasBalance) {
       const balance = await WalletService.getBalance(tenantId);
       
       await logEvent({
        tenant_id: tenantId,
        actor_type: 'ai',
        event_type: EVENT_TYPES.ACTION_BLOCKED,
        entity_type: 'wallet',
        entity_id: user.id,
        metadata: { reason: "Insufficient funds", cost: estimatedCost, balance }
      });

      // Raise persistent failure
      await FailureService.raiseFailure({
        tenant_id: tenantId,
        category: 'payment',
        source: 'wallet',
        severity: 'critical',
        message: 'Wallet balance empty. AI paused.',
        metadata: { balance, required: estimatedCost }
      });

      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 402 });
    }

    // 3. Prepare AI Context
    const body = await request.json();
    const { messageId } = body;

    if (!messageId) {
      return NextResponse.json({ error: "Message ID required" }, { status: 400 });
    }

    const { data: message, error: msgError } = await supabase
      .from("messages")
      .select("listing_id, guest_id, content, role")
      .eq("id", messageId)
      .single();

    if (msgError || !message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const listingId = message.listing_id;
    const guestId = message.guest_id;

    // Fetch listing & guest details
    const [listingRes, guestRes, calendarRes] = await Promise.all([
      supabase.from("listings").select("name, city").eq("id", listingId).single(),
      supabase.from("guests").select("name").eq("id", guestId).single(),
      supabase.from("bookings")
        .select("start_date, end_date, status")
        .eq("listing_id", listingId)
        .gte("end_date", new Date().toISOString())
        .neq("status", "cancelled")
    ]);

    const listing = listingRes.data;
    const guest = guestRes.data;
    const calendar = calendarRes.data || [];

    if (!listing || !guest) {
      return NextResponse.json({ error: "Context missing" }, { status: 404 });
    }

    // Fetch Tenant Business Type for AI Persona
    const { data: tenant } = await supabase
      .from("tenants")
      .select("business_type, is_memory_enabled, is_branding_enabled")
      .eq("id", tenantId)
      .single();
    
    const aiDefaults = getPersonaAIDefaults(tenant?.business_type);

    // 4. Retrieve Memory Context (If Enabled)
    let memoryContext = "";
    if (tenant?.is_memory_enabled) {
        try {
            const memories = await MemoryService.getMemories(tenantId, { listingId });
            if (memories.length > 0) {
                // Update usage stats for retrieved memories
                const memoryIds = memories.map(m => m.id);
                await MemoryService.markUsed(tenantId, memoryIds); // Fire & forget
                
                memoryContext = `
IMPORTANT: You have access to the following MEMORIES for this business/listing. 
Use them to personalize your response but DO NOT explicitly mention "I remember...".
${memories.map(m => `- [${m.memory_type.toUpperCase()}] ${m.summary} (Confidence: ${m.confidence})`).join('\n')}
`;
            }
        } catch (memErr) {
            console.error("Memory retrieval failed:", memErr);
            // Non-critical, continue without memory
        }
    }

    // 5. Generate Reply
    const { geminiService } = await import("@/lib/services/geminiService");
    const result = await geminiService.generateReply({
      message: message.content,
      listingName: listing.name,
      city: listing.city,
      calendar: calendar.map(b => ({
        startDate: b.start_date,
        endDate: b.end_date,
        status: b.status || 'booked'
      })),
      guestName: guest.name,
      role: aiDefaults.role,
      instructions: aiDefaults.instructions + memoryContext // Append memory context
    });

    const replyContent = result.content;
    const tokensUsed = result.usage.totalTokens;

    // 6. Calculate & Deduct Actual Cost
    // If tokensUsed is 0 (error or mock), charge minimum or 0? 
    // Let's charge minimum for the attempt if it succeeded in returning content.
    const actualCost = await PricingService.calculateCost('ai_reply', Math.max(tokensUsed, 50), tenantId);
    
    await WalletService.deductCredits(tenantId, actualCost, 'ai_reply', {
      tokens: tokensUsed,
      message_id: messageId
    });

    // 7. Append Branding (If Enabled)
    let finalReply = replyContent;
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

        if (!finalReply.includes(brandingText)) {
            finalReply += `\n\n${brandingText}`;
        }
    }

    // 8. Log Success
    await logEvent({
        tenant_id: tenantId,
        actor_type: 'ai',
        event_type: EVENT_TYPES.AI_REPLY_SENT,
        entity_type: 'message',
        entity_id: messageId,
        metadata: {
            tokens: tokensUsed,
            cost: actualCost,
            branded: tenant?.is_branding_enabled
        }
    });

    return NextResponse.json({ reply: finalReply });

  } catch (error: any) {
    console.error("AI Reply Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
