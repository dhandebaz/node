
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
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { userService } from "./userService";

// Initial Config (Read-only default for now)
let GLOBAL_CONFIG: KaisaGlobalConfig = {
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
    return { ...GLOBAL_CONFIG };
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
    // In-memory update only
    const mod = GLOBAL_CONFIG.modules.find(m => m.type === moduleType);
    if (!mod) return false;

    mod.enabledGlobal = enabledGlobal;
    if (enabledFor) mod.enabledFor = enabledFor;

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
    const role = GLOBAL_CONFIG.roles.find(r => r.type === roleType);
    if (!role) return false;

    if (updates.enabled !== undefined) role.enabled = updates.enabled;
    if (updates.inviteOnly !== undefined) role.inviteOnly = updates.inviteOnly;

    await this.logAction({
      adminId,
      actionType: "role_update",
      scope: "global",
      details: `Updated role ${roleType}`,
    });

    return true;
  },

  async setSystemStatus(adminId: string, status: "operational" | "paused"): Promise<boolean> {
    GLOBAL_CONFIG.systemStatus = status;
    
    await this.logAction({
      adminId,
      actionType: "emergency_action",
      scope: "global",
      details: `System status changed to ${status}`,
    });

    return true;
  },

  async toggleIntegration(adminId: string, name: string, enabled: boolean): Promise<boolean> {
    const int = GLOBAL_CONFIG.integrations.find(i => i.name === name);
    if (!int) return false;

    int.enabledGlobal = enabled;
    
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
    config: IntegrationConfigDetails
  ): Promise<boolean> {
    const int = GLOBAL_CONFIG.integrations.find(i => i.name === name);
    if (!int) return false;

    int.config = { ...int.config, ...config };
    
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
    return [];
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
      console.error("Error fetching tasks:", error);
      return [];
    }

    return data.map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      title: t.intent,
      description: "Task generated from intent",
      status: t.status,
      priority: "medium",
      module: "Frontdesk",
      createdAt: t.created_at,
      completedAt: t.completed_at
    }));
  },

  async getUserActivityLog(userId: string): Promise<KaisaUserActivity[]> {
    // TODO: Implement kaisa_activity_log table
    return [];
  },

  async getCreditUsage(userId: string): Promise<KaisaCreditUsage> {
    // TODO: Implement kaisa_credits table
    return {
      balance: 0,
      monthlyLimit: 0,
      usedThisMonth: 0,
      history: []
    };
  },

  async logAction(log: Omit<KaisaAdminAuditLog, "id" | "timestamp">) {
    // TODO: Implement audit_logs table
    console.log("[Kaisa Audit]", log);
  }
};
