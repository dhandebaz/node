
import { 
  KaisaGlobalConfig, 
  KaisaStats, 
  KaisaAdminAuditLog, 
  KaisaModuleType, 
  KaisaRoleType,
  KaisaBusinessType,
  KaisaTask,
  KaisaUserActivity,
  KaisaCreditUsage,
  IntegrationConfigDetails
} from "@/types/kaisa";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { userService } from "./userService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES, EventType } from "@/types/events";

const KAISA_CONFIG_KEY = "KAISA_GLOBAL_CONFIG";

// Initial Config (Default if DB is empty)
const DEFAULT_GLOBAL_CONFIG: KaisaGlobalConfig = {
  systemStatus: "operational",
  roles: [
    { type: "owner", priceMonthly: 0, enabled: true, inviteOnly: false },
    { type: "manager", priceMonthly: 299, enabled: true, inviteOnly: false },
    { type: "co-founder", priceMonthly: 999, enabled: true, inviteOnly: true },
  ],
  modules: [
    { type: "Frontdesk", enabledGlobal: true, enabledFor: ["Doctor", "Homestay", "Retail", "Other"] },
    { type: "Billing", enabledGlobal: true, enabledFor: ["Doctor", "Retail"] },
    { type: "Social Media", enabledGlobal: true, enabledFor: ["Homestay", "Retail"] },
    { type: "CRM", enabledGlobal: true, enabledFor: ["Doctor", "Homestay", "Retail", "Other"] },
    { type: "Inventory", enabledGlobal: true, enabledFor: ["Retail"] },
  ],
  integrations: [
    { 
      name: "Calendar", 
      status: "active", 
      enabledGlobal: true,
      config: {
        googleClientId: "",
        googleClientSecret: ""
      }
    },
    { 
      name: "CRM", 
      status: "active", 
      enabledGlobal: true,
      config: {
        supportedProviders: ["Salesforce", "HubSpot", "Zoho"]
      }
    },
    { 
      name: "Listings", 
      status: "issues", 
      enabledGlobal: true,
      config: {
        icalGenerationEnabled: true,
        icalBaseUrl: "https://api.nodebase.io/ical"
      }
    },
    { 
      name: "Messaging", 
      status: "active", 
      enabledGlobal: true,
      config: {
        metaAppId: "",
        metaAppSecret: ""
      }
    },
  ],
};

export const kaisaService = {
  async getConfig(): Promise<KaisaGlobalConfig> {
    const supabase = await getSupabaseServer();
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", KAISA_CONFIG_KEY)
        .single();
      
      if (error || !data) {
        return JSON.parse(JSON.stringify(DEFAULT_GLOBAL_CONFIG));
      }
      
      // Merge with default to ensure new fields are present
      const dbConfig = data.value as KaisaGlobalConfig;
      return {
        ...DEFAULT_GLOBAL_CONFIG,
        ...dbConfig,
        roles: dbConfig.roles || DEFAULT_GLOBAL_CONFIG.roles,
        modules: dbConfig.modules || DEFAULT_GLOBAL_CONFIG.modules,
        integrations: dbConfig.integrations || DEFAULT_GLOBAL_CONFIG.integrations,
      };
    } catch (e) {
      console.error("Failed to fetch kaisa config, using defaults", e);
      return JSON.parse(JSON.stringify(DEFAULT_GLOBAL_CONFIG));
    }
  },

  async saveConfig(config: KaisaGlobalConfig, adminId?: string): Promise<void> {
    const supabase = await getSupabaseAdmin();
    const { error } = await supabase
      .from("system_settings")
      .upsert({ 
        key: KAISA_CONFIG_KEY, 
        value: config,
        updated_by: adminId && adminId !== "SYSTEM" ? adminId : null
      });

    if (error) {
      console.error("Failed to save kaisa config:", error);
      throw new Error("Failed to save kaisa config to database");
    }
  },

  async getStats(): Promise<KaisaStats> {
    const users = await userService.getUsers();
    const kaisaUsers = users.filter(u => u.roles.isKaisaUser && u.products.kaisa);
    
    const stats: KaisaStats = {
      totalUsers: kaisaUsers.length,
      activeUsers: kaisaUsers.filter(u => u.status.account === "active").length,
      pausedUsers: kaisaUsers.filter(u => u.status.account === "suspended").length, 
      byType: { Doctor: 0, Homestay: 0, Retail: 0, Other: 0 },
      byRole: { owner: 0, manager: 0, "co-founder": 0 },
    };

    kaisaUsers.forEach(u => {
      if (u.products.kaisa?.businessType) {
        const type = u.products.kaisa.businessType as KaisaBusinessType;
        if (stats.byType[type] !== undefined) stats.byType[type]++;
        else stats.byType.Other++;
      }
      if (u.products.kaisa?.role) {
        stats.byRole[u.products.kaisa.role]++;
      }
    });

    return stats;
  },

  async toggleModule(
    adminId: string, 
    moduleType: KaisaModuleType, 
    enabledGlobal: boolean,
    enabledFor?: KaisaBusinessType[]
  ): Promise<boolean> {
    const config = await this.getConfig();
    const mod = config.modules.find(m => m.type === moduleType);
    if (!mod) return false;

    mod.enabledGlobal = enabledGlobal;
    if (enabledFor) mod.enabledFor = enabledFor;

    await this.saveConfig(config, adminId);

    await this.logAction({
      adminId,
      actionType: "module_toggle",
      scope: "global",
      details: `Updated ${moduleType}: Global=${enabledGlobal}`,
    });

    return true;
  },

  async updateRoleConfig(
    adminId: string,
    roleType: KaisaRoleType,
    updates: { enabled?: boolean; inviteOnly?: boolean }
  ): Promise<boolean> {
    const config = await this.getConfig();
    const role = config.roles.find(r => r.type === roleType);
    if (!role) return false;

    if (updates.enabled !== undefined) role.enabled = updates.enabled;
    if (updates.inviteOnly !== undefined) role.inviteOnly = updates.inviteOnly;

    await this.saveConfig(config, adminId);

    await this.logAction({
      adminId,
      actionType: "role_update",
      scope: "global",
      details: `Updated role ${roleType}`,
    });

    return true;
  },

  async setSystemStatus(adminId: string, status: "operational" | "paused"): Promise<boolean> {
    const config = await this.getConfig();
    config.systemStatus = status;
    
    await this.saveConfig(config, adminId);
    
    await this.logAction({
      adminId,
      actionType: "emergency_action",
      scope: "global",
      details: `System status changed to ${status}`,
    });

    return true;
  },

  async toggleIntegration(adminId: string, name: string, enabled: boolean): Promise<boolean> {
    const config = await this.getConfig();
    const int = config.integrations.find(i => i.name === name);
    if (!int) return false;

    int.enabledGlobal = enabled;
    
    await this.saveConfig(config, adminId);
    
    await this.logAction({
      adminId,
      actionType: "config_change",
      scope: "global",
      details: `Integration ${name} global enabled set to ${enabled}`,
    });

    return true;
  },

  async getIntegrationStats(name: string): Promise<Record<string, number>> {
    // Placeholder stats
    return {};
  },

  async updateIntegrationConfig(
    adminId: string, 
    name: string, 
    configData: IntegrationConfigDetails
  ): Promise<boolean> {
    const config = await this.getConfig();
    const int = config.integrations.find(i => i.name === name);
    if (!int) return false;

    int.config = { ...int.config, ...configData };
    
    await this.saveConfig(config, adminId);
    
    await this.logAction({
      adminId,
      actionType: "config_change",
      scope: "global",
      details: `Updated integration config for ${name}`,
    });

    return true;
  },

  async toggleUserKaisaStatus(
    adminId: string,
    userId: string,
    status: "active" | "paused"
  ): Promise<boolean> {
    const success = await userService.updateKaisaStatus(adminId, userId, status);
    if (!success) return false;

    await this.logAction({
      adminId,
      actionType: "user_pause",
      scope: "user",
      targetUserId: userId,
      details: `User kaisa status set to ${status}`,
    });

    return true;
  },

  async getAuditLogs(): Promise<KaisaAdminAuditLog[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("audit_events")
      .select("*")
      .eq("actor_type", "admin")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((log: any) => ({
      id: log.id,
      adminId: log.actor_id,
      actionType: log.metadata?.action_type || "config_change",
      scope: log.metadata?.scope || "global",
      targetUserId: log.entity_id,
      details: log.metadata?.details || "",
      timestamp: log.created_at
    }));
  },

  // Customer Dashboard Methods
  async getUserTasks(userId: string): Promise<KaisaTask[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("kaisa_tasks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      return [];
    }

    return data.map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      title: t.intent || "Task",
      description: "Task generated from intent",
      status: t.status as any,
      priority: "medium",
      module: t.module || "Frontdesk",
      createdAt: t.created_at,
      completedAt: t.completed_at
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

    if (error || !data) return [];

    return data.map((log: any) => ({
      id: log.id,
      userId: userId,
      type: log.actor_id === userId ? "user_command" : "system_action",
      description: log.metadata?.details || log.event_type,
      module: log.metadata?.module || "Frontdesk",
      timestamp: log.created_at
    }));
  },

  async getCreditUsage(userId: string): Promise<KaisaCreditUsage> {
    const supabase = await getSupabaseServer();
    
    // 1. Get Balance
    const { data: creditData } = await supabase
      .from("kaisa_credits")
      .select("*")
      .eq("user_id", userId)
      .single();
      
    // 2. Get History (from wallet_transactions or audit_events)
    // Using wallet_transactions as primary source for credit usage
    const { data: historyData } = await supabase
      .from("wallet_transactions")
      .select("*")
      .eq("tenant_id", userId) // Assuming tenant_id matches user_id for now or joined
      .eq("type", "ai_usage") // or 'ai_reply'
      .order("created_at", { ascending: false })
      .limit(10);

    return {
      balance: creditData?.balance || 0,
      monthlyLimit: creditData?.monthly_limit || 1000,
      usedThisMonth: creditData?.used_this_month || 0,
      history: historyData?.map((h: any) => ({
        date: h.created_at,
        amount: Number(h.amount),
        description: h.metadata?.description || "AI Usage"
      })) || []
    };
  },

  async logAction(log: Omit<KaisaAdminAuditLog, "id" | "timestamp">) {
    let eventType: EventType = EVENT_TYPES.ADMIN_MANUAL_OVERRIDE;
    if (log.actionType === 'module_toggle') eventType = EVENT_TYPES.ADMIN_AI_MANAGER_TOGGLED;
    if (log.actionType === 'config_change') eventType = EVENT_TYPES.AI_SETTINGS_CHANGED;
    
    // Determine entity
    let entityType = 'system';
    let entityId = null;
    if (log.scope === 'user' && log.targetUserId) {
        entityType = 'user';
        entityId = log.targetUserId;
    }

    try {
      await logEvent({
        tenant_id: null, // Global admin action
        actor_type: 'admin',
        actor_id: log.adminId,
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        metadata: {
            details: log.details,
            scope: log.scope,
            action_type: log.actionType
        }
      });
    } catch (error) {
      console.error("Failed to log admin action:", error);
    }
  }
};
