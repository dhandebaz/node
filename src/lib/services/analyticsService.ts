import { getSupabaseServer } from "@/lib/supabase/server";
import { subDays, startOfDay, endOfDay, subMonths } from "date-fns";
import { PricingService } from "./pricingService";

export type TimeRange = 'today' | '7d' | '30d';

export interface PersonaMetrics {
  // Airbnb
  occupancyRate?: number;
  revenue?: number;
  directBookings?: number;
  otaBookings?: number;
  avgResponseTime?: number; // in minutes
  aiAssistedBookings?: number;

  // Kirana
  ordersCount?: number;
  repeatCustomers?: number;
  avgOrderValue?: number;
  aiHandledOrders?: number;

  // Clinic
  appointmentsCount?: number;
  noShowRate?: number;
  reminderEffectiveness?: number;

  // Thrift
  dmsConverted?: number;
  aiResponseSpeed?: number;
}

export interface AIROIMetrics {
  aiRepliesSent: number;
  creditsUsed: number;
  costIncurred: number;
  outcomes: number; // Bookings/Orders/Appointments
  valueGenerated: number;
  netGain: number;
}

export interface AdminHealthMetrics {
  activeTenants: number;
  aiUsageByPersona: Record<string, number>;
  creditsConsumedToday: number;
  errorRate: number;
  integrationsHealth: {
    connected: number;
    disconnected: number;
    error: number;
  };
  growth: {
    newTenantsToday: number;
    totalReferrals: number;
    rewardedReferrals?: number;
  };
}

export class AnalyticsService {
  
  private static getDateRange(range: TimeRange) {
    const now = new Date();
    const end = endOfDay(now);
    let start = startOfDay(now);

    if (range === '7d') start = subDays(now, 7);
    if (range === '30d') start = subDays(now, 30);

    return { start: start.toISOString(), end: end.toISOString() };
  }

  static async getPersonaMetrics(tenantId: string, businessType: string, range: TimeRange): Promise<PersonaMetrics> {
    const supabase = await getSupabaseServer();
    const { start, end } = this.getDateRange(range);
    
    // Common: Revenue & AI Stats
    // This is a simplified implementation. Real-world would be more complex SQL.
    
    // 1. Bookings / Orders (mapped to 'bookings' table for now for all personas)
    // Assuming 'bookings' table handles appointments/orders too via 'type' or just context
    const { data: bookings } = await supabase
      .from("bookings")
      .select("*")
      .eq("tenant_id", tenantId)
      .gte("created_at", start)
      .lte("created_at", end);
      
    const totalRevenue = bookings?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0;
    const totalCount = bookings?.length || 0;

    // 2. AI Usage (Replies)
    // We can count AI_REPLY_SENT events from audit_events/usage_events (if we have a table)
    // Or query 'messages' table where role='assistant' (if we track tenant_id on messages)
    // Let's assume we query 'messages' joined with 'conversations' or check 'audit_events' if available.
    // Since we don't have a reliable 'audit_events' table queryable by tenant easily (schema varies), 
    // let's use 'wallet_transactions' type='ai_usage' as a proxy for count.
    const { data: aiTxns } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("tenant_id", tenantId)
      .eq("type", "ai_reply")
      .gte("created_at", start)
      .lte("created_at", end);
      
    const aiRepliesCount = aiTxns?.length || 0;

    // 3. AI Influence (Heuristic)
    // AI-assisted = Booking created by a guest who received an AI reply in the last 24h
    // This requires complex join. For MVP, let's use a simpler proxy:
    // If booking source is 'direct' and tenant has AI enabled, assume 50% attribution? No, "No fake metrics".
    // Better: Count bookings where guest_id matches a message receiver.
    // Let's return 0 for now if we can't calculate strictly, or try a join if possible.
    // Strict approach: 
    // We need 'messages' table.
    
    let metrics: PersonaMetrics = {};

    if (businessType === 'airbnb_host') {
       const direct = bookings?.filter(b => b.source === 'direct').length || 0;
       const ota = totalCount - direct;
       
       metrics = {
         revenue: totalRevenue,
         occupancyRate: 0, // Need total days available vs booked days. Hard to calc quickly.
         directBookings: direct,
         otaBookings: ota,
         aiAssistedBookings: 0 // TODO: Implement strict linking
       };
    } else if (businessType === 'kirana_store') {
       metrics = {
         ordersCount: totalCount,
         revenue: totalRevenue,
         avgOrderValue: totalCount ? totalRevenue / totalCount : 0,
         aiHandledOrders: 0
       };
    } else if (businessType === 'doctor_clinic') {
       metrics = {
         appointmentsCount: totalCount,
         revenue: totalRevenue,
         noShowRate: 0 // Need status='no_show'
       };
    } else {
       metrics = {
         dmsConverted: 0,
         revenue: totalRevenue,
         aiResponseSpeed: 0
       };
    }

    return metrics;
  }

  static async getAIROIMetrics(tenantId: string, range: TimeRange): Promise<AIROIMetrics> {
    const supabase = await getSupabaseServer();
    const { start, end } = this.getDateRange(range);

    // 1. Cost (Wallet Transactions)
    const { data: txns } = await supabase
      .from("wallet_transactions")
      .select("amount, metadata")
      .eq("tenant_id", tenantId)
      .eq("type", "ai_reply") // Filter for AI reply costs
      .gte("created_at", start)
      .lte("created_at", end);

    const costIncurred = Math.abs(txns?.reduce((sum, t) => sum + Number(t.amount), 0) || 0);
    const aiRepliesSent = txns?.length || 0;

    // 2. Value Generated (Bookings/Orders)
    // We need to define "AI Generated". 
    // Heuristic: Direct bookings created AFTER an AI reply in the same thread.
    // Since we can't easily query that without complex joins, let's look at "Direct" bookings as a proxy for "AI + Web"
    // and maybe refine later. 
    // Prompt says: "Value generated – Credits spent = Net gain". "No overclaiming".
    // Let's conservatively only count bookings that have a clear link.
    // If we can't link, maybe we show "Potential Value" or just "Total Revenue" vs "AI Cost"?
    // The user wants "AI-assisted bookings count".
    // Let's try to query messages.
    
    // FETCH: All bookings in range
    const { data: bookings } = await supabase
      .from("bookings")
      .select("id, guest_id, amount, created_at, source")
      .eq("tenant_id", tenantId)
      .gte("created_at", start)
      .lte("created_at", end);

    let outcomes = 0;
    let valueGenerated = 0;

    if (bookings && bookings.length > 0) {
        const guestIds = bookings.map(b => b.guest_id);
        
        // Find if these guests received AI messages BEFORE booking
        // We look for messages in the 24h window before booking
        // This is expensive for many bookings. 
        // Optimization: Get all AI messages for these guests in the range.
        
        const { data: messages } = await supabase
            .from("messages")
            .select("guest_id, created_at")
            .in("guest_id", guestIds)
            .eq("role", "assistant") // AI messages
            .gte("created_at", subDays(new Date(start), 1).toISOString()); // Look back a bit further

        if (messages) {
            bookings.forEach(booking => {
                const bookingTime = new Date(booking.created_at).getTime();
                // Check if there's an AI message for this guest within 24h before booking
                const hasAIInteraction = messages.some(m => {
                    const msgTime = new Date(m.created_at).getTime();
                    return m.guest_id === booking.guest_id && 
                           msgTime < bookingTime && 
                           (bookingTime - msgTime) < 24 * 60 * 60 * 1000;
                });

                if (hasAIInteraction) {
                    outcomes++;
                    valueGenerated += (booking.amount || 0);
                }
            });
        }
    }

    return {
      aiRepliesSent,
      creditsUsed: costIncurred, // Assuming 1 credit = 1 unit of currency for simplicity, or display credits
      costIncurred,
      outcomes,
      valueGenerated,
      netGain: valueGenerated - costIncurred
    };
  }

  static async getAdminSystemHealth(): Promise<AdminHealthMetrics> {
    const supabase = await getSupabaseServer();
    
    // 1. Active Tenants (with at least 1 booking or login in last 30d?)
    // Simple: count all
    const { count: activeTenants } = await supabase
        .from("tenants")
        .select("*", { count: 'exact', head: true });

    // 2. Credits Consumed Today
    const today = startOfDay(new Date()).toISOString();
    const { data: txns } = await supabase
        .from("wallet_transactions")
        .select("amount")
        .eq("type", "ai_reply") // Only AI consumption
        .gte("created_at", today);
    
    const creditsConsumedToday = Math.abs(txns?.reduce((sum, t) => sum + Number(t.amount), 0) || 0);

    // 3. AI Usage by Persona (Approximate via tenants table join)
    // This is hard without join. 
    // Let's skip detailed breakdown for MVP or do 2 queries.

    // 4. Growth Stats
    const { count: newTenants } = await supabase
        .from("tenants")
        .select("*", { count: 'exact', head: true })
        .gte("created_at", today);
        
    const { count: totalReferrals } = await supabase
        .from("referrals")
        .select("*", { count: 'exact', head: true });

    const { count: rewardedReferrals } = await supabase
        .from("referrals")
        .select("*", { count: 'exact', head: true })
        .eq("status", "rewarded");
    
    return {
        activeTenants: activeTenants || 0,
        aiUsageByPersona: {},
        creditsConsumedToday,
        errorRate: 0, // Need failure logs
        integrationsHealth: { connected: 0, disconnected: 0, error: 0 },
        growth: {
            newTenantsToday: newTenants || 0,
            totalReferrals: totalReferrals || 0,
            rewardedReferrals: rewardedReferrals || 0
        }
    };
  }
}
