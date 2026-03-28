import { KaisaTask, KaisaUserActivity, KaisaCreditUsage } from "@/types/kaisa";
import { getSupabaseServer } from "@/lib/supabase/server";
import { userService } from "@/lib/services/userService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";
import { log } from "@/lib/logger";

export const kaisaUserService = {
  async toggleUserKaisaStatus(
    adminId: string,
    userId: string,
    status: "active" | "paused",
  ): Promise<boolean> {
    const success = await userService.updateKaisaStatus(
      adminId,
      userId,
      status,
    );
    if (!success) return false;

    // Log the action (System level / Admin level)
    try {
      await logEvent({
        tenant_id: null,
        actor_type: "admin",
        actor_id: adminId,
        event_type: EVENT_TYPES.ADMIN_AI_MANAGER_TOGGLED, // Closest match
        entity_type: "user",
        entity_id: userId,
        metadata: {
          details: `User kaisa status set to ${status}`,
          scope: "user",
          action_type: "user_pause",
        },
      });
    } catch (e) {
      log.error("Failed to log user status toggle", e);
    }

    return true;
  },

  async getUserTasks(userId: string): Promise<KaisaTask[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("kaisa_tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      log.error(`Error fetching tasks for user ${userId}`, error);
      return [];
    }

    return data.map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      title: t.intent || "Task",
      description: "Task generated from intent",
      status: t.status,
      priority: "medium", // Default
      module: t.module || "Frontdesk",
      createdAt: t.created_at,
      completedAt: t.completed_at,
    }));
  },

  async getUserActivityLog(userId: string): Promise<KaisaUserActivity[]> {
    const supabase = await getSupabaseServer();
    // Fetch user actions from audit_events
    const { data, error } = await supabase
      .from("audit_events")
      .select("*")
      .or(`actor_id.eq.${userId},entity_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data) {
      if (error) log.error(`Error fetching activity for user ${userId}`, error);
      return [];
    }

    return data.map((logItem: any) => ({
      id: logItem.id,
      userId: userId,
      type: logItem.actor_id === userId ? "user_command" : "system_action",
      description: logItem.metadata?.details || logItem.event_type,
      module: logItem.metadata?.module || "Frontdesk",
      timestamp: logItem.created_at,
    }));
  },

  /**
   * Get credit usage for a user (or rather their tenant).
   * Optimization: Pass tenantId if known to avoid an extra DB lookup.
   */
  async getCreditUsage(
    userId: string,
    tenantId?: string,
  ): Promise<KaisaCreditUsage> {
    const supabase = await getSupabaseServer();

    let targetTenantId = tenantId;

    // 1. Resolve Tenant ID if not provided
    if (!targetTenantId) {
      const { data: tenantUser } = await supabase
        .from("tenant_users")
        .select("tenant_id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      targetTenantId = tenantUser?.tenant_id;
    }

    if (!targetTenantId) {
      return {
        balance: 0,
        monthlyLimit: 0,
        usedThisMonth: 0,
        history: [],
      };
    }

    // 2. Get Balance from Wallet
    const { data: wallet } = await supabase
      .from("wallets")
      .select("balance")
      .eq("tenant_id", targetTenantId)
      .maybeSingle();

    // 3. Get History from Wallet Transactions
    const { data: historyData } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("tenant_id", targetTenantId)
      .order("created_at", { ascending: false })
      .limit(10);

    // 4. Fetch monthly limit from active subscription plan
    let monthlyLimit = 1000; // Default fallback
    try {
      const { data: tenantUser } = await supabase
        .from("tenant_users")
        .select("tenants(subscription_plan)")
        .eq("tenant_id", targetTenantId)
        .eq("role", "owner")
        .limit(1)
        .maybeSingle();

      const planId = (tenantUser as any)?.tenants?.subscription_plan;
      if (planId) {
        const { data: plan } = await supabase
          .from("billing_plans")
          .select("features")
          .eq("id", planId)
          .maybeSingle();

        // features is an array of strings like "1000 AI credits/month"
        const features: string[] = (plan?.features as string[]) ?? [];
        const creditFeature = features.find((f) => /\d+.*credit/i.test(f));
        if (creditFeature) {
          const match = creditFeature.match(/(\d[\d,]*)/);
          if (match) {
            monthlyLimit = parseInt(match[1].replace(/,/g, ""), 10);
          }
        }
      }
    } catch {
      // Non-critical  -  fall back to default
    }

    // 5. Calculate credits used this calendar month from wallet_transactions
    let usedThisMonth = 0;
    try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: monthlyUsage } = await supabase
        .from("wallet_transactions")
        .select("amount")
        .eq("tenant_id", targetTenantId)
        .in("type", [
          "ai_usage",
          "deduction",
          "integration_sync",
          "calendar_sync",
        ])
        .gte("created_at", startOfMonth.toISOString());

      if (monthlyUsage && monthlyUsage.length > 0) {
        usedThisMonth = monthlyUsage.reduce(
          (sum: number, tx: any) => sum + Math.abs(Number(tx.amount)),
          0,
        );
      }
    } catch {
      // Non-critical  -  fall back to 0
    }

    return {
      balance: wallet?.balance || 0,
      monthlyLimit,
      usedThisMonth,
      history:
        historyData?.map((h: any) => ({
          date: h.created_at,
          amount: Number(h.amount),
          description: h.description || h.type,
        })) || [],
    };
  },
};
