
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

export const settingsService = {
  async getSettings(): Promise<AppSettings> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", SETTINGS_KEY)
      .single();

    if (error || !data) {
      // Return defaults if not found
      return DEFAULT_SETTINGS;
    }
    
    // Merge with defaults to ensure new fields are present
    return { ...DEFAULT_SETTINGS, ...data.value };
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

    // 3. Audit Log
    // Determine what changed for the log
    const sections = Object.keys(updates) as (keyof AppSettings)[];
    for (const section of sections) {
       await this.logChange(adminId, section, "update", `Updated ${section} settings`);
    }
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
