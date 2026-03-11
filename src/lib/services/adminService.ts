import { getSupabaseServer } from "@/lib/supabase/server";
import { PLAN_PRICING, SubscriptionPlan } from "@/lib/constants/pricing";

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number; // Simple MRR estimate
  walletBalances: number; // Total outstanding wallet credits (liability)
}

export interface CustomerSummary {
  id: string;
  phone: string;
  email: string | null;
  plan: string;
  businessType: string;
  joinedAt: string;
  walletBalance: number;
}

export class AdminService {
  /**
   * Fetch high-level stats for the admin dashboard
   */
  static async getOverviewStats(): Promise<AdminStats> {
    const supabase = await getSupabaseServer();

    // 1. Total Users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: 'exact', head: true });

    // 2. Active Subscriptions (users with plan != 'starter' or similar logic)
    // Assuming 'pro' and 'business' are paid plans
    const { count: activeSubscriptions } = await supabase
      .from("users")
      .select("*", { count: 'exact', head: true })
      .in("subscription_plan", ["pro", "business"]);

    // 3. Wallet Liability (Total user balances)
    const { data: wallets } = await supabase
      .from("wallets")
      .select("balance");
    
    const walletBalances = wallets?.reduce((sum, w) => sum + (Number(w.balance) || 0), 0) || 0;

    // 4. MRR Estimate (Fixed Plans + Recent Usage)
    const { data: tenants } = await supabase.from("tenants").select("subscription_plan");
    
    let totalRevenue = 0;
    tenants?.forEach(t => {
        const planKey = t.subscription_plan as SubscriptionPlan;
        if (PLAN_PRICING[planKey]) {
            totalRevenue += PLAN_PRICING[planKey].amount;
        }
    });

    return {
      totalUsers: totalUsers || 0,
      activeSubscriptions: activeSubscriptions || 0,
      totalRevenue,
      walletBalances
    };
  }

  /**
   * Fetch list of customers with wallet and plan details
   */
  static async getCustomers(limit = 50, offset = 0): Promise<CustomerSummary[]> {
    const supabase = await getSupabaseServer();

    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id,
        phone,
        email,
        subscription_plan,
        business_type,
        created_at,
        wallets (
          balance
        )
      `)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error || !users) return [];

    return users.map(u => ({
      id: u.id,
      phone: u.phone || "N/A",
      email: u.email,
      plan: u.subscription_plan || "starter",
      businessType: u.business_type || "unknown",
      joinedAt: u.created_at,
      // @ts-ignore - Supabase types join handling
      walletBalance: u.wallets?.[0]?.balance || 0
    }));
  }

  /**
   * Fetch recent audit/activity logs
   */
  static async getRecentActivity(limit = 10) {
    const supabase = await getSupabaseServer();
    // Assuming we have an audit_logs table or similar
    // Fallback to ai_usage_events for now as "activity"
    const { data } = await supabase
        .from("ai_usage_events")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
    
    return data || [];
  }
}
