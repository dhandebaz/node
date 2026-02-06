
export type KaisaBusinessType = "Doctor" | "Homestay" | "Retail" | "Other";
export type KaisaRoleType = "owner" | "manager" | "co-founder";
export type KaisaModuleType = "Frontdesk" | "Billing" | "Social Media" | "CRM" | "Inventory";

export interface KaisaRoleConfig {
  type: KaisaRoleType;
  priceMonthly: number; // Locked: 299 or 999
  enabled: boolean;
  inviteOnly: boolean;
}

export interface KaisaModuleConfig {
  type: KaisaModuleType;
  enabledGlobal: boolean;
  enabledFor: KaisaBusinessType[]; // Empty means none, all present means all
}

export interface IntegrationConfigDetails {
  // Calendar
  googleClientId?: string;
  googleClientSecret?: string;
  
  // CRM
  supportedProviders?: string[];
  
  // Listings
  icalGenerationEnabled?: boolean;
  icalBaseUrl?: string;
  
  // Messaging
  metaAppId?: string;
  metaAppSecret?: string;
  
  // Generic
  [key: string]: any;
}

export interface KaisaIntegrationConfig {
  name: "Calendar" | "CRM" | "Listings" | "Messaging";
  status: "active" | "issues" | "disabled";
  enabledGlobal: boolean;
  config?: IntegrationConfigDetails;
}

export interface KaisaGlobalConfig {
  systemStatus: "operational" | "paused"; // Global emergency switch
  roles: KaisaRoleConfig[];
  modules: KaisaModuleConfig[];
  integrations: KaisaIntegrationConfig[];
}

export interface KaisaStats {
  totalUsers: number;
  activeUsers: number;
  pausedUsers: number;
  byType: Record<KaisaBusinessType, number>;
  byRole: Record<KaisaRoleType, number>;
}

export interface KaisaAdminAuditLog {
  id: string;
  adminId: string;
  actionType: "config_change" | "emergency_action" | "module_toggle" | "role_update" | "user_pause";
  scope: "global" | "user";
  targetUserId?: string;
  details: string;
  timestamp: string;
}

// Customer Dashboard Types

export type KaisaTaskStatus = "pending" | "in_progress" | "completed" | "scheduled" | "failed" | "queued";
export type KaisaTaskPriority = "low" | "medium" | "high";

export interface KaisaTask {
  id: string;
  userId: string;
  title: string;
  description: string; // "Task intent summary"
  status: KaisaTaskStatus;
  priority: KaisaTaskPriority;
  module: KaisaModuleType;
  scheduledFor?: string;
  completedAt?: string;
  createdAt: string;
}

export interface KaisaUserActivity {
  id: string;
  userId: string;
  type: "system_action" | "user_command" | "alert";
  description: string;
  module: KaisaModuleType;
  timestamp: string;
}

export interface KaisaCreditUsage {
  balance: number;
  monthlyLimit: number;
  usedThisMonth: number;
  history: {
    date: string;
    amount: number;
    description: string;
  }[];
}
