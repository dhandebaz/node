import { NextResponse } from 'next/server';
import { verifyRazorpayWebhook } from '@/lib/crypto/webhook-verify';
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { WalletService } from "@/lib/services/walletService";
import { FailureService } from "@/lib/services/failureService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { PLAN_PRICING, SubscriptionPlan } from "@/lib/constants/pricing";
import { log } from "@/lib/logger";

interface RazorpayEntity {
  id: string;
  notes?: Record<string, string>;
  plan_id?: string;
  current_start?: number;
  current_end?: number;
  status?: string;
  amount?: number;
  currency?: string;
  method?: string;
  error_code?: string;
  error_description?: string;
}

interface RazorpayPayload {
  subscription?: { entity: RazorpayEntity };
  payment?: { entity: RazorpayEntity };
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature') || '';
    const hasSecret = !!process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify signature (skip in dev if no secret configured)
    if (hasSecret) {
      if (!verifyRazorpayWebhook(body, signature)) {
        log.error("[Razorpay Webhook] Invalid signature  -  request rejected");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      log.error("[Razorpay Webhook] RAZORPAY_WEBHOOK_SECRET not configured in production!");
      return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
    } else {
      log.warn("[Razorpay Webhook] Skipping signature verification (dev mode)");
    }

    const event = JSON.parse(body);
    const supabase = await getSupabaseAdmin();
    const payload = event.payload as RazorpayPayload;

    log.info(`[Razorpay Webhook] Event: ${event.event}`, { eventId: event.id });

    // ==========================================
    // Subscription Activated / Charged
    // ==========================================
    if (event.event === 'subscription.activated' || event.event === 'subscription.charged') {
       const entity = payload.subscription?.entity;
       if (!entity) return NextResponse.json({ status: "ignored_no_entity" });

       const tenantId = entity.notes?.tenantId || entity.notes?.tenant_id;
       const plan = entity.notes?.internal_plan || 'starter';

       if (!tenantId) {
           log.error("[Razorpay Webhook] No tenantId in subscription notes", { subscriptionId: entity.id });
           return NextResponse.json({ status: "ignored_no_tenant" });
       }

       // 1. Update Tenant Subscription Status
       const { error: updateError } = await supabase
         .from("tenants")
         .update({
             subscription_status: 'active',
             subscription_plan: plan,
             updated_at: new Date().toISOString(),
         })
         .eq("id", tenantId);

       if (updateError) log.error("[Razorpay Webhook] Failed to update tenant", updateError);
       
       // 2. Update/Upsert subscriptions table
       const { data: user } = await supabase
         .from('tenant_users')
         .select('user_id')
         .eq('tenant_id', tenantId)
         .eq('role', 'owner')
         .single();

       if (user) {
           await supabase.from('subscriptions').upsert({
               user_id: user.user_id,
               status: 'active',
               plan_id: plan,
               current_period_start: entity.current_start 
                 ? new Date(entity.current_start * 1000).toISOString() 
                 : new Date().toISOString(),
               current_period_end: entity.current_end 
                 ? new Date(entity.current_end * 1000).toISOString() 
                 : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
               metadata: { razorpay_subscription_id: entity.id, razorpay_plan_id: entity.plan_id },
               updated_at: new Date().toISOString(),
           }, { onConflict: 'user_id' });
       }

       // 3. Add Monthly Credits
       const planKey = plan as SubscriptionPlan;
       const pricing = PLAN_PRICING[planKey];
       const credits = pricing?.credits_per_month || 500;
       
       await WalletService.topUp(tenantId, credits, `Monthly Allowance: ${plan}`, {
           subscriptionId: entity.id,
           plan,
           source: 'subscription_allowance',
           eventId: event.id, // Idempotency key
       });

       // 4. Resolve any active payment failures (payment succeeded)
       await FailureService.resolveFailure(tenantId, 'razorpay', 'payment');

       await logEvent({
           tenant_id: tenantId,
           actor_type: 'system',
           event_type: EVENT_TYPES.SUBSCRIPTION_UPDATED,
           entity_type: 'subscription',
           entity_id: entity.id,
           metadata: { status: 'active', plan, credits_added: credits },
       });
    }
    
    // ==========================================
    // Subscription Cancelled / Halted / Paused
    // ==========================================
    else if (event.event === 'subscription.cancelled' || event.event === 'subscription.halted' || event.event === 'subscription.paused') {
        const entity = payload.subscription?.entity;
        if (!entity) return NextResponse.json({ status: "ignored_no_entity" });

        const tenantId = entity.notes?.tenantId || entity.notes?.tenant_id;
        
        if (tenantId) {
            await supabase
                .from("tenants")
                .update({ 
                  subscription_status: 'cancelled',
                  updated_at: new Date().toISOString(),
                })
                .eq("id", tenantId);
            
            const { data: user } = await supabase
              .from('tenant_users')
              .select('user_id')
              .eq('tenant_id', tenantId)
              .eq('role', 'owner')
              .single();

            if (user) {
                await supabase.from('subscriptions').update({
                    status: 'canceled',
                    cancel_at_period_end: true,
                    updated_at: new Date().toISOString(),
                }).eq('user_id', user.user_id);
            }

            // Resolve payment failures on cancellation
            await FailureService.resolveFailure(tenantId, 'razorpay', 'payment');

            await logEvent({
                tenant_id: tenantId,
                actor_type: 'system',
                event_type: EVENT_TYPES.SUBSCRIPTION_UPDATED,
                entity_type: 'subscription',
                entity_id: entity.id,
                metadata: { status: 'cancelled', razorpay_event: event.event },
            });
        }
    }
    
    // ==========================================
    // Payment Failed (Dunning)
    // ==========================================
    else if (event.event === 'payment.failed') {
        const entity = payload.payment?.entity;
        if (!entity) return NextResponse.json({ status: "ignored_no_entity" });

        const tenantId = entity.notes?.tenantId || entity.notes?.tenant_id;
        
        if (tenantId) {
            // Raise failure for the failure tracking system
            await FailureService.raiseFailure({
              tenant_id: tenantId,
              category: 'payment',
              source: 'razorpay',
              severity: 'critical',
              message: `Payment failed: ${entity.error_description || 'Unknown error'} (${entity.error_code || 'unknown'})`,
              metadata: { 
                paymentId: entity.id, 
                errorCode: entity.error_code, 
                errorDescription: entity.error_description,
              },
            });

            // Check dunning threshold: 3 failures in 7 days → mark as past_due
            const { data: recentFailures } = await supabase
              .from("failures")
              .select("id")
              .eq("tenant_id", tenantId)
              .eq("category", "payment")
              .eq("is_active", true)
              .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

            if (recentFailures && recentFailures.length >= 3) {
              const { data: user } = await supabase
                .from('tenant_users')
                .select('user_id')
                .eq('tenant_id', tenantId)
                .eq('role', 'owner')
                .single();

              if (user) {
                await supabase.from('subscriptions').update({
                  status: 'past_due',
                  updated_at: new Date().toISOString(),
                }).eq('user_id', user.user_id).eq('status', 'active');
              }

              log.error(`[Dunning] Tenant ${tenantId}: ${recentFailures.length} failures in 7 days  -  marked past_due`);
            }

            await logEvent({
                tenant_id: tenantId,
                actor_type: 'system',
                event_type: EVENT_TYPES.ACTION_BLOCKED,
                entity_type: 'payment',
                entity_id: entity.id,
                metadata: { 
                  reason: entity.error_description || "Payment failed", 
                  errorCode: entity.error_code,
                },
            });
        }
    }

    // ==========================================
    // Payment Captured (Top-up / One-time)
    // ==========================================
    else if (event.event === 'payment.captured') {
        const entity = payload.payment?.entity;
        if (!entity) return NextResponse.json({ status: "ignored_no_entity" });

        const tenantId = entity.notes?.tenantId || entity.notes?.tenant_id;
        const amount = (entity.amount || 0) / 100; // Paise → Rupees

        if (tenantId && amount > 0) {
          await WalletService.topUp(tenantId, amount, `Payment captured`, {
            paymentId: entity.id,
            provider: 'razorpay',
            eventId: event.id,
          });

          // Create invoice
          const { data: user } = await supabase
            .from('tenant_users')
            .select('user_id')
            .eq('tenant_id', tenantId)
            .eq('role', 'owner')
            .single();

          if (user) {
            await supabase.from('invoices').insert({
              user_id: user.user_id,
              amount,
              currency: entity.currency || 'INR',
              status: 'paid',
              date: new Date().toISOString(),
              items: [{ description: 'Wallet Top-up', amount }],
              billing_details: { paymentId: entity.id, method: entity.method },
            });
          }

          // Resolve payment failures
          await FailureService.resolveFailure(tenantId, 'razorpay', 'payment');

          // Mark Onboarding Milestones
          const { data: account } = await supabase.from("accounts").select("onboarding_milestones").eq("tenant_id", tenantId).single();
          const currentMilestones = (account?.onboarding_milestones as string[]) || [];
          if (!currentMilestones.includes("add_credits")) {
            await supabase.from("accounts").update({ 
               onboarding_milestones: [...currentMilestones, "add_credits"] 
            }).eq("tenant_id", tenantId);
          }

          await logEvent({
            tenant_id: tenantId,
            actor_type: 'system',
            event_type: EVENT_TYPES.PAYMENT_CAPTURED || 'payment.captured',
            entity_type: 'payment',
            entity_id: entity.id,
            metadata: { amount, currency: entity.currency },
          });
        }
    }

    else {
      log.info(`[Razorpay Webhook] Unhandled event: ${event.event}`);
    }

    return NextResponse.json({ status: "ok" });

  } catch (error) {
    log.error("[Razorpay Webhook] Processing error:", error);
    // Return 200 to prevent Razorpay retries for parsing errors
    return NextResponse.json({ received: true }, { status: 200 });
  }
}
