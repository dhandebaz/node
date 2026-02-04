
import { 
  AppSettings, 
  SettingsAuditLog, 
  IntegrationConfig, 
  FeatureFlag,
  AuthSettings,
  PlatformSettings,
  NotificationSettings,
  SecuritySettings,
  ApiSettings
} from "@/types/settings";

// Initial Mock Data
let SETTINGS: AppSettings = {
  auth: {
    otpProvider: "Firebase",
    otpExpirySeconds: 300,
    otpRetryLimit: 3,
    adminLoginEnabled: true,
    rateLimitWindowSeconds: 60,
    rateLimitMaxRequests: 10,
    firebaseConfig: "",
    firebaseEnabled: false,
  },
  api: {
    publicApiEnabled: false,
    partnerApiEnabled: true,
    webhookOutgoingEnabled: true,
  },
  integrations: [
    {
      id: "int_firebase",
      name: "Firebase Auth",
      enabled: true,
      apiKey: "sk_live_xxxxxxxxxxxx",
      status: "connected",
      lastChecked: "2024-02-14T10:00:00Z",
    },
    {
      id: "int_twilio",
      name: "Twilio SMS",
      enabled: false,
      apiKey: "AC_xxxxxxxxxxxx",
      status: "disconnected",
    },
    {
      id: "int_stripe",
      name: "Stripe Payments",
      enabled: true,
      apiKey: "rk_live_xxxxxxxxxxxx",
      status: "connected",
      lastChecked: "2024-02-14T12:00:00Z",
    },
  ],
  features: [
    {
      id: "feat_kaisa_beta",
      key: "kaisa_v2",
      name: "kaisa AI v2 (Beta)",
      description: "Next-gen agentic capabilities",
      enabled: false,
      restrictedToRoles: ["manager"],
    },
    {
      id: "feat_space_cdn",
      key: "space_cdn",
      name: "Space CDN Global",
      description: "Enable CDN provisioning for all users",
      enabled: true,
    },
    {
      id: "feat_node_dashboard",
      key: "node_dash_preview",
      name: "Node Dashboard Preview",
      description: "Early access to Node investment dashboard",
      enabled: false,
      restrictedToProducts: ["node"],
    },
  ],
  platform: {
    maintenanceMode: false,
    readOnlyMode: false,
    signupEnabled: {
      kaisa: true,
      space: true,
      node: false, // Invite only usually
    },
  },
  notifications: {
    systemMessagesEnabled: true,
    emailChannelEnabled: true,
    smsChannelEnabled: true,
  },
  security: {
    sessionTimeoutMinutes: 60,
    adminAccessLocked: false,
  },
};

let AUDIT_LOGS: SettingsAuditLog[] = [
  {
    id: "LOG-INIT",
    adminId: "SYSTEM",
    section: "platform",
    action: "initialize",
    details: "System initialized with default settings",
    timestamp: new Date().toISOString(),
  },
];

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    // Return deep copy to prevent mutation, mask keys if needed (already masked in mock for simplicity)
    return JSON.parse(JSON.stringify(SETTINGS));
  },

  async updateAuthSettings(adminId: string, updates: Partial<AuthSettings>): Promise<void> {
    const old = { ...SETTINGS.auth };
    SETTINGS.auth = { ...SETTINGS.auth, ...updates };
    await this.log(adminId, "auth", "update_settings", `Updated auth config: ${Object.keys(updates).join(", ")}`);
  },

  async toggleIntegration(adminId: string, integrationId: string, enabled: boolean): Promise<void> {
    const int = SETTINGS.integrations.find(i => i.id === integrationId);
    if (!int) return;
    int.enabled = enabled;
    await this.log(adminId, "integrations", "toggle", `${enabled ? "Enabled" : "Disabled"} integration: ${int.name}`);
  },

  async updateIntegration(adminId: string, integrationId: string, updates: Partial<IntegrationConfig>): Promise<void> {
    const int = SETTINGS.integrations.find(i => i.id === integrationId);
    if (!int) return;
    
    // Mask API key in logs if updated
    const safeUpdates = { ...updates };
    if (safeUpdates.apiKey) safeUpdates.apiKey = "***MASKED***";

    Object.assign(int, updates);
    await this.log(adminId, "integrations", "update_config", `Updated integration ${int.name}: ${Object.keys(safeUpdates).join(", ")}`);
  },

  async updateApi(adminId: string, updates: Partial<ApiSettings>): Promise<void> {
    SETTINGS.api = { ...SETTINGS.api, ...updates };
    await this.log(adminId, "api" as any, "update_config", `Updated API settings: ${Object.keys(updates).join(", ")}`);
  },

  async rotateApiKeys(adminId: string): Promise<void> {
    SETTINGS.api.rotationLastPerformed = new Date().toISOString();
    await this.log(adminId, "api" as any, "rotate_keys", "Rotated internal API keys");
  },

  async toggleFeature(adminId: string, featureId: string, enabled: boolean): Promise<void> {
    const feat = SETTINGS.features.find(f => f.id === featureId);
    if (!feat) return;
    feat.enabled = enabled;
    await this.log(adminId, "features", "toggle", `${enabled ? "Enabled" : "Disabled"} feature: ${feat.name}`);
  },

  async updatePlatform(adminId: string, updates: Partial<PlatformSettings>): Promise<void> {
    SETTINGS.platform = { ...SETTINGS.platform, ...updates };
    await this.log(adminId, "platform", "update_mode", `Updated platform mode: ${JSON.stringify(updates)}`);
  },
  
  async updatePlatformSignups(adminId: string, product: keyof PlatformSettings["signupEnabled"], enabled: boolean): Promise<void> {
    SETTINGS.platform.signupEnabled[product] = enabled;
    await this.log(adminId, "platform", "update_signup", `${enabled ? "Enabled" : "Disabled"} signups for ${product}`);
  },

  async updateNotifications(adminId: string, updates: Partial<NotificationSettings>): Promise<void> {
    SETTINGS.notifications = { ...SETTINGS.notifications, ...updates };
    await this.log(adminId, "notifications", "update_config", `Updated notification config`);
  },

  async updateSecurity(adminId: string, updates: Partial<SecuritySettings>): Promise<void> {
    SETTINGS.security = { ...SETTINGS.security, ...updates };
    await this.log(adminId, "security", "update_config", `Updated security settings`);
  },

  async forceLogoutAll(adminId: string): Promise<void> {
    SETTINGS.security.forceLogoutTriggeredAt = new Date().toISOString();
    await this.log(adminId, "security", "force_logout", "Triggered global force logout");
  },

  async getAuditLogs(): Promise<SettingsAuditLog[]> {
    return [...AUDIT_LOGS].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async log(adminId: string, section: SettingsAuditLog["section"], action: string, details: string) {
    AUDIT_LOGS.push({
      id: `LOG-${Date.now()}`,
      adminId,
      section,
      action,
      details,
      timestamp: new Date().toISOString(),
    });
  }
};
