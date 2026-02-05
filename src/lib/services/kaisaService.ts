
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
import { userService } from "./userService"; // Reusing mock user store

// Initial Mock Config
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
        googleClientId: "mock-client-id",
        googleClientSecret: "mock-secret"
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

let AUDIT_LOGS: KaisaAdminAuditLog[] = [];

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
      pausedUsers: kaisaUsers.filter(u => u.status.account === "suspended").length, // Mapping suspended to paused context
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
    const mod = GLOBAL_CONFIG.modules.find(m => m.type === moduleType);
    if (!mod) return false;

    const oldState = JSON.stringify(mod);
    mod.enabledGlobal = enabledGlobal;
    if (enabledFor) mod.enabledFor = enabledFor;

    await this.logAction({
      adminId,
      actionType: "module_toggle",
      scope: "global",
      details: `Updated ${moduleType}: Global=${enabledGlobal}, Types=${enabledFor ? enabledFor.join(',') : 'unchanged'}`,
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
      details: `Updated role ${roleType}: ${JSON.stringify(updates)}`,
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
    const users = await userService.getUsers();
    const stats: Record<string, number> = {};

    if (name === "Listings") {
      // Count users with "Bookings" module active as a proxy for active iCal users
      // In a real DB, this would count actual Listing records or generated iCal links
      const activeIcalUsers = users.filter(u => 
        u.products.kaisa?.status === "active" && 
        u.products.kaisa?.activeModules?.includes("Bookings")
      ).length;
      stats["active_icals"] = activeIcalUsers;
    }

    return stats;
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
    return [...AUDIT_LOGS].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  // Customer Dashboard Methods
  async getUserTasks(userId: string): Promise<KaisaTask[]> {
    // Mock data based on userId
    return [
      {
        id: "TSK-001",
        userId,
        title: "Confirm Booking #442",
        description: "Guest requesting early check-in. Validating availability.",
        status: "in_progress",
        priority: "high",
        module: "Frontdesk",
        createdAt: new Date().toISOString(),
      },
      {
        id: "TSK-002",
        userId,
        title: "Monthly Revenue Report",
        description: "Generating financial summary for January.",
        status: "completed",
        priority: "medium",
        module: "Billing",
        completedAt: new Date(Date.now() - 86400000).toISOString(),
        createdAt: new Date(Date.now() - 90000000).toISOString(),
      },
      {
        id: "TSK-003",
        userId,
        title: "Post Weekend Special",
        description: "Drafting social media post for upcoming long weekend.",
        status: "scheduled",
        priority: "low",
        module: "Social Media",
        scheduledFor: new Date(Date.now() + 86400000).toISOString(),
        createdAt: new Date().toISOString(),
      }
    ];
  },

  async getUserActivityLog(userId: string): Promise<KaisaUserActivity[]> {
    return [
      {
        id: "ACT-001",
        userId,
        type: "system_action",
        description: "Sent booking confirmation email to guest",
        module: "Frontdesk",
        timestamp: new Date().toISOString(),
      },
      {
        id: "ACT-002",
        userId,
        type: "user_command",
        description: "User approved 'Weekend Special' draft",
        module: "Social Media",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "ACT-003",
        userId,
        type: "alert",
        description: "Low inventory alert: Towels",
        module: "Inventory",
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      }
    ];
  },

  async getCreditUsage(userId: string): Promise<KaisaCreditUsage> {
    return {
      balance: 450,
      monthlyLimit: 1000,
      usedThisMonth: 550,
      history: [
        { date: "2024-02-14", amount: 15, description: "Daily Ops" },
        { date: "2024-02-13", amount: 22, description: "Report Generation" },
      ]
    };
  },

  async logAction(log: Omit<KaisaAdminAuditLog, "id" | "timestamp">) {
    AUDIT_LOGS.push({
      ...log,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    });
  }
};
