
export type OmniBusinessType = "Doctor" | "Homestay" | "Retail" | "Other";
export type OmniRoleType = "owner" | "manager" | "co-founder";
export type OmniModuleType = "Frontdesk" | "Billing" | "Social Media" | "CRM" | "Inventory";

export interface OmniRoleConfig {
  type: OmniRoleType;
  priceMonthly: number; // Locked: 299 or 999
  enabled: boolean;
  inviteOnly: boolean;
}

export interface OmniModuleConfig {
  type: OmniModuleType;
  enabledGlobal: boolean;
  enabledFor: OmniBusinessType[]; // Empty means none, all present means all
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

export interface OmniIntegrationConfig {
  name: "Calendar" | "CRM" | "Listings" | "Messaging";
  status: "active" | "issues" | "disabled";
  enabledGlobal: boolean;
  config?: IntegrationConfigDetails;
}

export interface OmniGlobalConfig {
  systemStatus: "operational" | "paused"; // Global emergency switch
  roles: OmniRoleConfig[];
  modules: OmniModuleConfig[];
  integrations: OmniIntegrationConfig[];
}

export interface OmniStats {
  totalUsers: number;
  activeUsers: number;
  pausedUsers: number;
  byType: Record<OmniBusinessType, number>;
  byRole: Record<OmniRoleType, number>;
}

export interface OmniAdminAuditLog {
  id: string;
  adminId: string;
  actionType: "config_change" | "emergency_action" | "module_toggle" | "role_update" | "user_pause";
  scope: "global" | "user";
  targetUserId?: string;
  details: string;
  timestamp: string;
}

// Customer Dashboard Types

export type OmniTaskStatus = "pending" | "in_progress" | "completed" | "scheduled" | "failed" | "queued";
export type OmniTaskPriority = "low" | "medium" | "high";

export interface OmniTask {
  id: string;
  userId: string;
  title: string;
  description: string; // "Task intent summary"
  status: OmniTaskStatus;
  priority: OmniTaskPriority;
  module: OmniModuleType;
  scheduledFor?: string;
  completedAt?: string;
  createdAt: string;
}

export interface OmniUserActivity {
  id: string;
  userId: string;
  type: "system_action" | "user_command" | "alert";
  description: string;
  module: OmniModuleType;
  timestamp: string;
}

export interface OmniCreditUsage {
  balance: number;
  monthlyLimit: number;
  usedThisMonth: number;
  history: {
    date: string;
    amount: number;
    description: string;
  }[];
}
