import {
    KaisaGlobalConfig,
    KaisaRoleType,
    KaisaModuleType,
    KaisaBusinessType,
    IntegrationConfigDetails
} from "@/types/kaisa";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES, EventType } from "@/types/events";
import { log } from "@/lib/logger";

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

async function logAction(
    adminId: string,
    actionType: string,
    details: string,
    scope: "global" | "user" = "global",
    targetUserId?: string
) {
    let eventType: EventType = EVENT_TYPES.ADMIN_MANUAL_OVERRIDE;
    if (actionType === 'module_toggle') eventType = EVENT_TYPES.ADMIN_AI_MANAGER_TOGGLED;
    if (actionType === 'config_change') eventType = EVENT_TYPES.AI_SETTINGS_CHANGED;
    if (actionType === 'role_update') eventType = EVENT_TYPES.AI_SETTINGS_CHANGED;

    // Determine entity
    let entityType = 'system';
    let entityId = null;
    if (scope === 'user' && targetUserId) {
        entityType = 'user';
        entityId = targetUserId;
    }

    try {
        await logEvent({
            tenant_id: null, // Global admin action
            actor_type: 'admin',
            actor_id: adminId,
            event_type: eventType,
            entity_type: entityType,
            entity_id: entityId,
            metadata: {
                details: details,
                scope: scope,
                action_type: actionType
            }
        });
    } catch (error) {
        log.error("Failed to log admin action:", error);
    }
}

export const kaisaConfigService = {
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
            log.error("Failed to fetch kaisa config, using defaults", e);
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
            log.error("Failed to save kaisa config:", error);
            throw new Error("Failed to save kaisa config to database");
        }
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

        await logAction(adminId, "module_toggle", `Updated ${moduleType}: Global=${enabledGlobal}`);

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

        await logAction(adminId, "role_update", `Updated role ${roleType}`);

        return true;
    },

    async setSystemStatus(adminId: string, status: "operational" | "paused"): Promise<boolean> {
        const config = await this.getConfig();
        config.systemStatus = status;

        await this.saveConfig(config, adminId);

        await logAction(adminId, "emergency_action", `System status changed to ${status}`);

        return true;
    },

    async toggleIntegration(adminId: string, name: string, enabled: boolean): Promise<boolean> {
        const config = await this.getConfig();
        const int = config.integrations.find(i => i.name === name);
        if (!int) return false;

        int.enabledGlobal = enabled;

        await this.saveConfig(config, adminId);

        await logAction(adminId, "config_change", `Integration ${name} global enabled set to ${enabled}`);

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

        await logAction(adminId, "config_change", `Updated integration config for ${name}`);

        return true;
    },
};
