
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { BillingPlan, Subscription, Invoice, PaymentMethod } from "@/types/billing";

export const billingService = {
  async getPlans(product?: 'kaisa' | 'space'): Promise<BillingPlan[]> {
    const supabase = await getSupabaseServer();
    let query = supabase.from("billing_plans").select("*");
    
    if (product) {
      query = query.eq("product", product);
    }
    
    const { data, error } = await query;
    if (error) return [];
    
    return data.map(mapDbPlanToAppPlan);
  },

  async getPlanById(planId: string): Promise<BillingPlan | undefined> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("billing_plans")
      .select("*")
      .eq("id", planId)
      .single();
      
    if (error || !data) return undefined;
    return mapDbPlanToAppPlan(data);
  },

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId);
      
    if (error) return [];
    return data.map(mapDbSubToAppSub);
  },

  async getUserInvoices(userId: string): Promise<Invoice[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false });
      
    if (error) return [];
    return data.map(mapDbInvoiceToAppInvoice);
  },
  
  async getUserPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("payment_methods")
      .select("*")
      .eq("user_id", userId);
      
    if (error) return [];
    return data.map(mapDbPmToAppPm);
  },

  // Actions
  async upgradeSubscription(userId: string, subscriptionId: string, newPlanId: string): Promise<Subscription> {
    const supabase = await getSupabaseServer();
    
    // 1. Get Subscription
    const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("id", subscriptionId)
        .eq("user_id", userId)
        .single();
        
    if (!sub) throw new Error("Subscription not found");

    // 2. Get New Plan
    const { data: plan } = await supabase
        .from("billing_plans")
        .select("*")
        .eq("id", newPlanId)
        .single();
        
    if (!plan) throw new Error("Plan not found");

    // 3. Update Subscription
    const { data: updatedSub, error } = await supabase
        .from("subscriptions")
        .update({
            plan_id: newPlanId,
            updated_at: new Date().toISOString()
        })
        .eq("id", subscriptionId)
        .select()
        .single();

    if (error || !updatedSub) throw new Error("Failed to update subscription");
    
    // 4. Create Invoice (Mock charge)
    await supabase.from("invoices").insert({
        user_id: userId,
        subscription_id: subscriptionId,
        amount: plan.price,
        currency: plan.currency,
        status: "paid",
        items: [{ description: `Upgrade to ${plan.name}`, amount: plan.price }],
        billing_details: { name: "User" } // Simplify
    });
    
    // 5. Update User's cached plan
    const adminSupabase = await getSupabaseAdmin();
    await adminSupabase.from("users").update({ subscription_plan: newPlanId }).eq("id", userId);

    return mapDbSubToAppSub(updatedSub);
  },

  async cancelSubscription(userId: string, subscriptionId: string): Promise<Subscription> {
    const supabase = await getSupabaseServer();
    
    const { data: updatedSub, error } = await supabase
        .from("subscriptions")
        .update({
            cancel_at_period_end: true,
            updated_at: new Date().toISOString()
        })
        .eq("id", subscriptionId)
        .eq("user_id", userId)
        .select()
        .single();

    if (error || !updatedSub) throw new Error("Failed to cancel subscription");
    return mapDbSubToAppSub(updatedSub);
  },
  
  async resumeSubscription(userId: string, subscriptionId: string): Promise<Subscription> {
    const supabase = await getSupabaseServer();
    
    const { data: updatedSub, error } = await supabase
        .from("subscriptions")
        .update({
            cancel_at_period_end: false,
            updated_at: new Date().toISOString()
        })
        .eq("id", subscriptionId)
        .eq("user_id", userId)
        .select()
        .single();

    if (error || !updatedSub) throw new Error("Failed to resume subscription");
    return mapDbSubToAppSub(updatedSub);
  }
};

// Mappers
function mapDbPlanToAppPlan(db: any): BillingPlan {
    return {
        id: db.id,
        name: db.name,
        description: db.description,
        price: Number(db.price),
        currency: db.currency,
        interval: db.interval,
        product: db.product,
        features: db.features || [],
        type: db.type
    };
}

function mapDbSubToAppSub(db: any): Subscription {
    return {
        id: db.id,
        userId: db.user_id,
        planId: db.plan_id,
        status: db.status,
        currentPeriodStart: db.current_period_start,
        currentPeriodEnd: db.current_period_end,
        cancelAtPeriodEnd: db.cancel_at_period_end,
        metadata: db.metadata
    };
}

function mapDbInvoiceToAppInvoice(db: any): Invoice {
    return {
        id: db.id,
        userId: db.user_id,
        subscriptionId: db.subscription_id,
        amount: Number(db.amount),
        currency: db.currency,
        status: db.status,
        date: db.date,
        items: db.items || [],
        billingDetails: db.billing_details || {}
    };
}

function mapDbPmToAppPm(db: any): PaymentMethod {
    return {
        id: db.id,
        type: db.type,
        last4: db.last4,
        brand: db.brand,
        isDefault: db.is_default
    };
}
