import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { WalletService } from "@/lib/services/walletService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { PLAN_PRICING, SubscriptionPlan } from "@/lib/constants/pricing";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!signature || !secret) {
      // Allow passing if no secret defined (dev mode) but warn
      if (!secret) console.warn("RAZORPAY_WEBHOOK_SECRET not set");
      else return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    if (secret && signature) {
        const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
        }
    }

    const event = JSON.parse(body);
    const supabase = await getSupabaseAdmin();

    console.log(`Razorpay Webhook: ${event.event}`, event.payload?.subscription?.entity?.id);

    if (event.event === 'subscription.activated' || event.event === 'subscription.charged') {
       const entity = event.payload.subscription.entity;
       const { notes, id, plan_id } = entity;
       const tenantId = notes?.tenantId;
       const plan = notes?.internal_plan || 'starter'; // Fallback?

       if (!tenantId) {
           console.error("No tenantId in subscription notes", entity);
           return NextResponse.json({ status: "ignored_no_tenant" });
       }

       // 1. Update Tenant Subscription Status
       const { error: updateError } = await supabase
         .from("tenants")
         .update({
             subscription_status: 'active',
             subscription_plan: plan,
             // store razorpay_subscription_id if we have a column, or in metadata
         })
         .eq("id", tenantId);

       if (updateError) console.error("Failed to update tenant subscription", updateError);

       // 2. Add Monthly Credits (Renewal or Activation)
       // We should only add if it's a successful charge. 'subscription.charged' implies success?
       // razorpay sends subscription.charged for every successful payment.
       
       const planKey = plan as keyof typeof PLAN_PRICING;
       const credits = PLAN_PRICING[planKey]?.credits_per_month || 500;
       
       await WalletService.topUp(tenantId, credits, `Monthly Allowance: ${plan}`, {
           subscriptionId: id,
           plan,
           source: 'subscription_allowance',
           eventId: event.id
       });

       await logEvent({
           tenant_id: tenantId,
           actor_type: 'system',
           event_type: EVENT_TYPES.SUBSCRIPTION_UPDATED,
           entity_type: 'subscription',
           entity_id: id,
           metadata: { status: 'active', plan, credits_added: credits }
       });
    }
    
    else if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted') {
        const entity = event.payload.subscription.entity;
        const tenantId = entity.notes?.tenantId;
        
        if (tenantId) {
            await supabase
                .from("tenants")
                .update({ subscription_status: 'cancelled' })
                .eq("id", tenantId);
                
            await logEvent({
                tenant_id: tenantId,
                actor_type: 'system',
                event_type: EVENT_TYPES.SUBSCRIPTION_UPDATED,
                entity_type: 'subscription',
                entity_id: entity.id,
                metadata: { status: 'cancelled' }
            });
        }
    }

    return NextResponse.json({ status: "ok" });

  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}
