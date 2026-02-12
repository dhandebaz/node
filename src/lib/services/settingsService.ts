
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
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";

// Initial Default Data (used if DB is empty)
const DEFAULT_SETTINGS: AppSettings = {
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
      enabled: false,
      apiKey: "",
      authDomain: "",
      projectId: "",
      storageBucket: "",
      messagingSenderId: "",
      appId: "",
      measurementId: "",
      status: "disconnected",
    },
    {
      id: "int_twilio",
      name: "Twilio SMS",
      enabled: false,
      apiKey: "",
      status: "disconnected",
    },
    {
      id: "int_stripe",
      name: "Stripe Payments",
      enabled: false,
      apiKey: "",
      status: "disconnected",
    },
    {
      id: "int_paypal",
      name: "PayPal",
      enabled: false,
      clientId: "",
      clientSecret: "",
      status: "disconnected",
    },
    {
      id: "int_paddle",
      name: "Paddle",
      enabled: false,
      vendorId: "",
      apiKey: "",
      publicKey: "", // Client-side token
      status: "disconnected",
    },
    {
      id: "int_razorpay",
      name: "Razorpay",
      enabled: false,
      clientId: "", // Key ID
      clientSecret: "", // Key Secret
      status: "disconnected",
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
    environment: "mock",
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
  analytics: {
    firebaseConfig: "",
    enabled: false
  }
};

const SETTINGS_KEY = "global_config";

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    const supabase = await getSupabaseServer();
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", SETTINGS_KEY)
        .single();
      
      if (error || !data) {
        // Fallback to defaults if not found
        return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      }
      
      const dbSettings = data.value as AppSettings;
      
      // Merge with defaults to ensure schema compatibility
      return {
        ...DEFAULT_SETTINGS,
        ...dbSettings,
        auth: { ...DEFAULT_SETTINGS.auth, ...dbSettings.auth },
        api: { ...DEFAULT_SETTINGS.api, ...dbSettings.api },
        // For arrays like integrations/features, we prefer DB version if it exists, 
        // but might want to merge new definitions from code. 
        // For simplicity, use DB version if present, or Default.
        integrations: dbSettings.integrations?.length ? dbSettings.integrations : DEFAULT_SETTINGS.integrations,
        features: dbSettings.features?.length ? dbSettings.features : DEFAULT_SETTINGS.features,
        platform: { ...DEFAULT_SETTINGS.platform, ...dbSettings.platform },
        notifications: { ...DEFAULT_SETTINGS.notifications, ...dbSettings.notifications },
        security: { ...DEFAULT_SETTINGS.security, ...dbSettings.security },
        analytics: { ...DEFAULT_SETTINGS.analytics, ...dbSettings.analytics },
      };
    } catch (e) {
      console.error("Failed to fetch settings, using defaults", e);
      return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    }
  },

  async saveSettings(settings: AppSettings, adminId?: string): Promise<void> {
    const supabase = await getSupabaseAdmin();
    
    // We filter out masked values before saving if they are being saved back?
    // Actually, the UI should send partial updates, but here we save the whole object.
    // If '***MASKED***' comes in, we should ideally NOT overwrite the real value.
    // However, for this implementation, we assume the caller (update methods) handles fetching real values first.
    
    const { error } = await supabase
      .from("system_settings")
      .upsert({ 
        key: SETTINGS_KEY, 
        value: settings,
        updated_by: adminId && adminId !== "SYSTEM" ? adminId : null
      });

    if (error) {
      console.error("Failed to save settings:", error);
      throw new Error("Failed to save settings to database");
    }
  },

  async updateAuthSettings(adminId: string, updates: Partial<AuthSettings>): Promise<void> {
    const settings = await this.getSettings();
    settings.auth = { ...settings.auth, ...updates };
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "auth", "update_settings", `Updated auth config: ${Object.keys(updates).join(", ")}`);
  },

  async toggleIntegration(adminId: string, integrationId: string, enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    const int = settings.integrations.find(i => i.id === integrationId);
    if (!int) return;
    int.enabled = enabled;
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "integrations", "toggle", `${enabled ? "Enabled" : "Disabled"} integration: ${int.name}`);
  },

  async updateIntegration(adminId: string, integrationId: string, updates: Partial<IntegrationConfig>): Promise<void> {
    const settings = await this.getSettings();
    const int = settings.integrations.find(i => i.id === integrationId);
    if (!int) return;
    
    const safeUpdates = { ...updates };
    if (safeUpdates.apiKey) safeUpdates.apiKey = "***MASKED***";
    if (safeUpdates.clientSecret) safeUpdates.clientSecret = "***MASKED***";
    if (safeUpdates.authToken) safeUpdates.authToken = "***MASKED***";

    Object.assign(int, updates);

    const hasKeys = this.validateIntegrationKeys(int);
    if (hasKeys) {
      int.status = "connected";
      int.enabled = true; 
      int.lastChecked = new Date().toISOString();
    } else {
      int.status = "disconnected";
      int.enabled = false;
    }

    await this.saveSettings(settings, adminId);
    await this.log(adminId, "integrations", "update_config", `Updated integration ${int.name}: ${Object.keys(safeUpdates).join(", ")}`);
  },

  validateIntegrationKeys(int: IntegrationConfig): boolean {
    if (int.id === "int_paddle") {
      return !!(int.vendorId && int.apiKey && int.publicKey);
    }
    if (int.id === "int_paypal") {
      return !!(int.clientId && int.clientSecret);
    }
    if (int.id === "int_razorpay") {
      return !!(int.clientId && int.clientSecret);
    }
    if (int.id === "int_firebase") {
      return !!(int.apiKey && int.authDomain && int.projectId && int.appId);
    }
    if (int.id === "int_twilio") {
      return !!(int.accountSid && int.authToken && int.fromPhoneNumber);
    }
    return !!int.apiKey;
  },

  async updateApi(adminId: string, updates: Partial<ApiSettings>): Promise<void> {
    const settings = await this.getSettings();
    settings.api = { ...settings.api, ...updates };
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "api" as any, "update_config", `Updated API settings: ${Object.keys(updates).join(", ")}`);
  },

  async rotateApiKeys(adminId: string): Promise<void> {
    const settings = await this.getSettings();
    settings.api.rotationLastPerformed = new Date().toISOString();
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "api" as any, "rotate_keys", "Rotated internal API keys");
  },

  async toggleFeature(adminId: string, featureId: string, enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    const feat = settings.features.find(f => f.id === featureId);
    if (!feat) return;
    feat.enabled = enabled;
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "features", "toggle", `${enabled ? "Enabled" : "Disabled"} feature: ${feat.name}`);
  },

  async updatePlatform(adminId: string, updates: Partial<PlatformSettings>): Promise<void> {
    const settings = await this.getSettings();
    settings.platform = { ...settings.platform, ...updates };
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "platform", "update_mode", `Updated platform mode: ${JSON.stringify(updates)}`);
  },

  async isProductionMode(): Promise<boolean> {
    const settings = await this.getSettings();
    return settings.platform.environment === "production";
  },
  
  async updatePlatformSignups(adminId: string, product: keyof PlatformSettings["signupEnabled"], enabled: boolean): Promise<void> {
    const settings = await this.getSettings();
    settings.platform.signupEnabled[product] = enabled;
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "platform", "update_signup", `${enabled ? "Enabled" : "Disabled"} signups for ${product}`);
  },

  async updateNotifications(adminId: string, updates: Partial<NotificationSettings>): Promise<void> {
    const settings = await this.getSettings();
    settings.notifications = { ...settings.notifications, ...updates };
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "notifications", "update_config", `Updated notification config`);
  },

  async updateSecurity(adminId: string, updates: Partial<SecuritySettings>): Promise<void> {
    const settings = await this.getSettings();
    settings.security = { ...settings.security, ...updates };
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "security", "update_config", `Updated security settings`);
  },

  async forceLogoutAll(adminId: string): Promise<void> {
    const settings = await this.getSettings();
    settings.security.forceLogoutTriggeredAt = new Date().toISOString();
    await this.saveSettings(settings, adminId);
    await this.log(adminId, "security", "force_logout", "Triggered global force logout");
  },

  async getAuditLogs(): Promise<SettingsAuditLog[]> {
    const supabase = await getSupabaseAdmin();
    const { data, error } = await supabase
      .from("audit_events")
      .select("*")
      .eq("actor_type", "admin")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) return [];
    
    // Map DB logs to SettingsAuditLog interface
    return data.map((log: any) => ({
      id: log.id,
      adminId: log.actor_id || "SYSTEM",
      section: "platform", // Generic fallback
      action: log.event_type,
      details: log.metadata?.details,
      timestamp: log.created_at
    }));
  },

  async log(adminId: string, section: SettingsAuditLog["section"], action: string, details: string) {
    try {
      const supabase = await getSupabaseAdmin();
      await supabase.from("audit_events").insert({
        actor_type: 'admin',
        actor_id: adminId === "SYSTEM" ? null : adminId,
        event_type: action,
        entity_type: 'settings',
        metadata: {
          section,
          details
        }
      });
    } catch (e) {
      console.error("Failed to write audit log", e);
    }
  }
};
