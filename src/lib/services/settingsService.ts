
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
import { cacheService } from "@/lib/services/cacheService";

// Initial Default Data (used if DB is empty)
const DEFAULT_SETTINGS: AppSettings = {
  auth: {
    otpProvider: "Supabase",
    otpExpirySeconds: 300,
    otpRetryLimit: 3,
    adminLoginEnabled: true,
    rateLimitWindowSeconds: 60,
    rateLimitMaxRequests: 10,
  },
  api: {
    publicApiEnabled: false,
    partnerApiEnabled: true,
    webhookOutgoingEnabled: true,
  },
  integrations: [
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
  ],
  platform: {
    environment: "mock",
    maintenanceMode: false,
    readOnlyMode: false,
    signupEnabled: {
      kaisa: true,
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
    enabled: false
  }
};

const SETTINGS_KEY = "global_config";
const SETTINGS_CACHE_KEY = 'system:settings';
const CACHE_TTL = 300; // 5 minutes

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    // 1. Try Cache
    const cached = await cacheService.get<AppSettings>(SETTINGS_CACHE_KEY);
    if (cached) return cached;

    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .single();

    let settings: AppSettings;
    if (error || !data) {
      // Return defaults if not found
      settings = DEFAULT_SETTINGS;
    } else {
      // Merge with defaults to ensure new fields are present
      settings = { ...DEFAULT_SETTINGS, ...data.value };
    }

    // 2. Set Cache
    await cacheService.set(SETTINGS_CACHE_KEY, settings, CACHE_TTL);

    return settings;
  },

  async updateSettings(adminId: string, updates: Partial<AppSettings>): Promise<void> {
    const supabase = await getSupabaseAdmin(); // Admin client for writing system settings
    
    // 1. Get current
    const current = await this.getSettings();
    const newSettings = { ...current, ...updates };

    // 2. Save
    const { error } = await supabase
      .from("system_settings")
      .upsert({ 
        key: SETTINGS_KEY, 
        value: newSettings,
        updated_by: adminId,
        updated_at: new Date().toISOString()
      });

    if (error) throw new Error("Failed to update settings: " + error.message);

    // Invalidate Cache
    await cacheService.del(SETTINGS_CACHE_KEY);

    // 3. Audit Log
    // Determine what changed for the log
    const sections = Object.keys(updates) as (keyof AppSettings)[];
    for (const section of sections) {
       await this.logChange(adminId, section, "update", `Updated ${section} settings`);
    }
  },

  async updateAuthSettings(adminId: string, updates: Partial<AuthSettings>): Promise<void> {
    const current = await this.getSettings();
    await this.updateSettings(adminId, { auth: { ...current.auth, ...updates } });
  },

  async updateApi(adminId: string, updates: Partial<ApiSettings>): Promise<void> {
    const current = await this.getSettings();
    await this.updateSettings(adminId, { api: { ...current.api, ...updates } });
  },

  async rotateApiKeys(adminId: string): Promise<void> {
     // Logic to rotate keys (mock implementation)
     const current = await this.getSettings();
     await this.updateSettings(adminId, { 
       api: { 
         ...current.api, 
         rotationLastPerformed: new Date().toISOString() 
        } 
      });
     await this.logChange(adminId, "api", "rotate", "Rotated API Keys");
  },

  async toggleIntegration(adminId: string, integrationId: string, enabled: boolean): Promise<void> {
     const current = await this.getSettings();
     const integrationIndex = current.integrations.findIndex(i => i.id === integrationId);
     
     if (integrationIndex === -1) throw new Error("Integration not found");

     current.integrations[integrationIndex].enabled = enabled;
     current.integrations[integrationIndex].status = enabled ? "connected" : "disconnected"; // Simplified status logic

     await this.updateSettings(adminId, { integrations: current.integrations });
     await this.logChange(adminId, "integrations", enabled ? "enable" : "disable", `Toggled ${integrationId}`);
  },

  async updateIntegrationConfig(adminId: string, integrationId: string, config: Partial<IntegrationConfig>): Promise<void> {
    const current = await this.getSettings();
    const integrationIndex = current.integrations.findIndex(i => i.id === integrationId);
    
    if (integrationIndex === -1) throw new Error("Integration not found");

    // Merge config
    current.integrations[integrationIndex] = { ...current.integrations[integrationIndex], ...config };
    
    await this.updateSettings(adminId, { integrations: current.integrations });
    await this.logChange(adminId, "integrations", "update", `Updated config for ${integrationId}`);
  },

  // Alias for compatibility
  async updateIntegration(adminId: string, integrationId: string, config: Partial<IntegrationConfig>): Promise<void> {
    return this.updateIntegrationConfig(adminId, integrationId, config);
  },

  async toggleFeature(adminId: string, featureId: string, enabled: boolean): Promise<void> {
    const current = await this.getSettings();
    const featureIndex = current.features.findIndex(f => f.id === featureId);
    
    if (featureIndex === -1) throw new Error("Feature not found");

    current.features[featureIndex].enabled = enabled;
    
    await this.updateSettings(adminId, { features: current.features });
    await this.logChange(adminId, "features", enabled ? "enable" : "disable", `Toggled feature ${featureId}`);
  },

  async updatePlatform(adminId: string, updates: Partial<PlatformSettings>): Promise<void> {
    const current = await this.getSettings();
    await this.updateSettings(adminId, { platform: { ...current.platform, ...updates } });
  },

  async updatePlatformSignups(adminId: string, product: keyof PlatformSettings["signupEnabled"], enabled: boolean): Promise<void> {
    const current = await this.getSettings();
    const newSignup = { ...current.platform.signupEnabled, [product]: enabled };
    
    await this.updateSettings(adminId, { 
      platform: { 
        ...current.platform, 
        signupEnabled: newSignup 
      } 
    });
    await this.logChange(adminId, "platform", "update", `${enabled ? "Enabled" : "Disabled"} signups for ${product}`);
  },

  async updateNotifications(adminId: string, updates: Partial<NotificationSettings>): Promise<void> {
    const current = await this.getSettings();
    await this.updateSettings(adminId, { notifications: { ...current.notifications, ...updates } });
  },

  async updateSecurity(adminId: string, updates: Partial<SecuritySettings>): Promise<void> {
    const current = await this.getSettings();
    await this.updateSettings(adminId, { security: { ...current.security, ...updates } });
  },

  async forceLogoutAll(adminId: string): Promise<void> {
     const current = await this.getSettings();
     await this.updateSettings(adminId, { 
       security: { 
         ...current.security, 
         forceLogoutTriggeredAt: new Date().toISOString() 
        } 
      });
     await this.logChange(adminId, "security", "logout", "Triggered force logout for all users");
  },

  async getAuditLogs(limit = 20): Promise<SettingsAuditLog[]> {
     const supabase = await getSupabaseServer();
     const { data } = await supabase
        .from("admin_audit_logs")
        .select("*")
        .eq("action_type", "settings_update")
        .order("timestamp", { ascending: false })
        .limit(limit);

     return (data || []).map(log => ({
        id: log.id,
        adminId: log.admin_id,
        section: "platform", // Generic fallback
        action: "update",
        details: log.details,
        timestamp: log.timestamp
     }));
  },

  async logChange(adminId: string, section: string, action: string, details: string) {
     const supabase = await getSupabaseAdmin();
     await supabase.from("admin_audit_logs").insert({
        admin_id: adminId,
        action_type: "settings_update",
        details: `[${section.toUpperCase()}] ${action}: ${details}`,
        timestamp: new Date().toISOString()
     });
  }
};
