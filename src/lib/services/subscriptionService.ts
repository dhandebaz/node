import { getSupabaseServer } from "@/lib/supabase/server";
import { EVENT_TYPES } from "@/types/events";
import { BusinessType } from "@/types";
import { 
  PLAN_LIMITS, 
  PLAN_PRICING, 
  BOOKING_MULTIPLIERS, 
  SubscriptionPlan 
} from "@/lib/constants/pricing";

export type { SubscriptionPlan };

export class SubscriptionService {
  static async getTenantPlan(tenantId: string): Promise<SubscriptionPlan> {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("users")
      .select("subscription_plan")
      .eq("id", tenantId)
      .single();
    
    return (data?.subscription_plan as SubscriptionPlan) || "starter";
  }

  static async getTenantContext(tenantId: string): Promise<{ plan: SubscriptionPlan; businessType: BusinessType }> {
    const supabase = await getSupabaseServer();
    const { data } = await supabase
      .from("users")
      .select("subscription_plan, business_type")
      .eq("id", tenantId)
      .single();
    
    return {
      plan: (data?.subscription_plan as SubscriptionPlan) || "starter",
      businessType: (data?.business_type as BusinessType) || "airbnb_host"
    };
  }

  static async checkLimit(
    tenantId: string, 
    resource: 'listings' | 'integrations'
  ): Promise<{ allowed: boolean; limit: number; current: number }> {
    const { plan } = await this.getTenantContext(tenantId);
    const limit = PLAN_LIMITS[plan][resource];
    const supabase = await getSupabaseServer();

    let current = 0;

    if (resource === 'listings') {
      const { count } = await supabase
        .from("listings")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", tenantId);
      current = count || 0;
    } else if (resource === 'integrations') {
      const { count } = await supabase
        .from("listing_integrations")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", tenantId)
        .eq("status", "connected"); 
      current = count || 0;
    }

    return { allowed: current < limit, limit, current };
  }

  static async checkMonthlyLimit(
    tenantId: string,
    resource: 'bookings'
  ): Promise<{ allowed: boolean; limit: number; current: number }> {
    const { plan, businessType } = await this.getTenantContext(tenantId);
    
    // Apply Multiplier for Bookings based on Persona
    const baseLimit = PLAN_LIMITS[plan].bookings_per_month;
    const multiplier = BOOKING_MULTIPLIERS[businessType] || 1;
    const limit = baseLimit * multiplier;

    const supabase = await getSupabaseServer();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);

    const { count } = await supabase
      .from("bookings")
      .select("*", { count: 'exact', head: true })
      .eq("tenant_id", tenantId)
      .gte("created_at", startOfMonth.toISOString());

    const current = count || 0;
    return { allowed: current < limit, limit, current };
  }

  static async checkDailyLimit(
    tenantId: string,
    resource: 'ai_replies'
  ): Promise<{ allowed: boolean; limit: number; current: number }> {
    const plan = await this.getTenantPlan(tenantId);
    const limit = PLAN_LIMITS[plan].ai_replies_per_day;
    const supabase = await getSupabaseServer();

    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);

    const { count } = await supabase
      .from("audit_events")
      .select("*", { count: 'exact', head: true })
      .eq("tenant_id", tenantId)
      .eq("event_type", EVENT_TYPES.AI_REPLY_SENT)
      .gte("created_at", startOfDay.toISOString());

    const current = count || 0;
    return { allowed: current < limit, limit, current };
  }
}
