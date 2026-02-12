import { 
  SpaceGlobalConfig, 
  SpaceServiceProfile, 
  SpaceAuditLog, 
  SpaceStats,
  SpaceResourceLimits,
  SpaceProject,
  SpaceDnsRecord,
  SpaceServiceStatus
} from "@/types/space";
import { settingsService } from "./settingsService";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { logEvent, EVENT_TYPES } from "@/lib/events";

const SPACE_CONFIG_KEY = "SPACE_GLOBAL_CONFIG";

const DEFAULT_SPACE_CONFIG: SpaceGlobalConfig = {
  maintenanceMode: false,
  plans: [
    {
      type: "shared",
      name: "Starter Shared",
      enabled: true,
      inviteOnly: false,
      priceMonthly: 199,
    },
    {
      type: "dedicated",
      name: "Pro Cloud",
      enabled: true,
      inviteOnly: true,
      priceMonthly: 2999,
    },
    {
      type: "cdn",
      name: "Global CDN",
      enabled: true,
      inviteOnly: false,
      priceMonthly: 499,
    },
  ],
};

export const spaceService = {
  // Config
  async getConfig(): Promise<SpaceGlobalConfig> {
    const supabase = await getSupabaseServer();
    try {
      const { data, error } = await supabase
        .from("system_settings")
        .select("value")
        .eq("key", SPACE_CONFIG_KEY)
        .single();
      
      if (error || !data) {
        return JSON.parse(JSON.stringify(DEFAULT_SPACE_CONFIG));
      }
      
      const dbConfig = data.value as SpaceGlobalConfig;
      return {
        ...DEFAULT_SPACE_CONFIG,
        ...dbConfig,
        plans: dbConfig.plans || DEFAULT_SPACE_CONFIG.plans
      };
    } catch (e) {
      console.error("Failed to fetch space config, using defaults", e);
      return JSON.parse(JSON.stringify(DEFAULT_SPACE_CONFIG));
    }
  },

  async saveConfig(config: SpaceGlobalConfig, adminId?: string): Promise<void> {
    const supabase = await getSupabaseAdmin();
    const { error } = await supabase
      .from("system_settings")
      .upsert({ 
        key: SPACE_CONFIG_KEY, 
        value: config,
        updated_by: adminId && adminId !== "SYSTEM" ? adminId : null
      });

    if (error) {
      console.error("Failed to save space config:", error);
      throw new Error("Failed to save space config to database");
    }
  },

  async togglePlan(adminId: string, planName: string, enabled: boolean): Promise<boolean> {
    const config = await this.getConfig();
    const plan = config.plans.find((p) => p.name === planName);
    if (!plan) return false;

    plan.enabled = enabled;
    await this.saveConfig(config, adminId);

    await this.logAction({
      adminId,
      actionType: "plan_toggle",
      details: `${enabled ? "Enabled" : "Disabled"} plan: ${planName}`,
    });
    return true;
  },
  
  async togglePlanInviteOnly(adminId: string, planName: string, inviteOnly: boolean): Promise<boolean> {
    const config = await this.getConfig();
    const plan = config.plans.find((p) => p.name === planName);
    if (!plan) return false;

    plan.inviteOnly = inviteOnly;
    await this.saveConfig(config, adminId);

    await this.logAction({
      adminId,
      actionType: "plan_toggle",
      details: `Set plan ${planName} invite-only to ${inviteOnly}`,
    });
    return true;
  },

  // Stats
  async getStats(): Promise<SpaceStats> {
    const supabase = await getSupabaseServer();
    
    // Total Customers (unique users with services)
    // Supabase doesn't support distinct count easily without raw sql or client side.
    // We'll approximate or fetch all services (expensive) or use a view.
    // For MVP, fetch all services id/userId/status/type.
    
    const { data: services } = await supabase
      .from("space_services")
      .select("user_id, status, type");
      
    if (!services) return {
      totalCustomers: 0,
      activeServices: 0,
      suspendedServices: 0,
      byType: { Shared: 0, Dedicated: 0, CDN: 0 },
      cdnEnabledCount: 0
    };

    const totalCustomers = new Set(services.map(s => s.user_id)).size;
    const activeServices = services.filter(s => s.status === "active").length;
    const suspendedServices = services.filter(s => s.status === "suspended").length;
    const cdnEnabledCount = services.filter(s => s.type === "CDN" && s.status === "active").length;

    const byType = {
      Shared: services.filter(s => s.type === "Shared").length,
      Dedicated: services.filter(s => s.type === "Dedicated").length,
      CDN: services.filter(s => s.type === "CDN").length,
    };

    return {
      totalCustomers,
      activeServices,
      suspendedServices,
      byType,
      cdnEnabledCount,
    };
  },

  // Services
  async getAllServices(): Promise<SpaceServiceProfile[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("space_services")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      type: s.type,
      status: s.status as SpaceServiceStatus,
      planName: s.plan_name,
      dataCenterId: s.datacenter_id,
      createdAt: s.created_at,
      limits: s.limits
    }));
  },

  async getUserServices(userId: string): Promise<SpaceServiceProfile[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("space_services")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((s: any) => ({
      id: s.id,
      userId: s.user_id,
      type: s.type,
      status: s.status as SpaceServiceStatus,
      planName: s.plan_name,
      dataCenterId: s.datacenter_id,
      createdAt: s.created_at,
      limits: s.limits
    }));
  },

  async updateServiceStatus(
    adminId: string,
    serviceId: string,
    status: SpaceServiceProfile["status"],
    reason?: string
  ): Promise<boolean> {
    const supabase = await getSupabaseAdmin();
    const { error, data } = await supabase
      .from("space_services")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", serviceId)
      .select()
      .single();

    if (error) return false;

    await this.logAction({
      adminId,
      actionType: "status_change",
      targetServiceId: serviceId,
      targetUserId: data.user_id,
      details: `Changed status to ${status}. Reason: ${reason || "Admin action"}`,
    });

    return true;
  },

  async updateResourceLimits(
    adminId: string,
    serviceId: string,
    limits: Partial<SpaceResourceLimits>
  ): Promise<boolean> {
    const supabase = await getSupabaseAdmin();
    // Fetch current limits
    const { data: current } = await supabase
        .from("space_services")
        .select("limits, user_id")
        .eq("id", serviceId)
        .single();
        
    if (!current) return false;
    
    const newLimits = { ...current.limits, ...limits };
    
    const { error } = await supabase
      .from("space_services")
      .update({ limits: newLimits, updated_at: new Date().toISOString() })
      .eq("id", serviceId);

    if (error) return false;

    await this.logAction({
      adminId,
      actionType: "limit_change",
      targetServiceId: serviceId,
      targetUserId: current.user_id,
      details: `Updated limits: ${JSON.stringify(limits)}`,
    });

    return true;
  },

  // Customer Dashboard Methods
  async getUserProjects(userId: string): Promise<SpaceProject[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("space_projects")
      .select("*")
      .eq("user_id", userId);

    if (error || !data) return [];

    return data.map((p: any) => ({
      id: p.id,
      serviceId: p.service_id,
      userId: p.user_id,
      domain: p.domain,
      name: p.name,
      type: p.type,
      status: p.status,
      sslEnabled: p.ssl_enabled,
      lastBackup: p.last_backup || new Date().toISOString(),
      createdAt: p.created_at
    }));
  },

  async getProjectById(projectId: string): Promise<SpaceProject | null> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("space_projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      serviceId: data.service_id,
      userId: data.user_id,
      domain: data.domain,
      name: data.name,
      type: data.type,
      status: data.status,
      sslEnabled: data.ssl_enabled,
      lastBackup: data.last_backup || new Date().toISOString(),
      createdAt: data.created_at
    };
  },

  async getProjectDns(projectId: string): Promise<SpaceDnsRecord[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("space_dns_records")
      .select("*")
      .eq("project_id", projectId);

    if (error || !data) return [];

    return data.map((d: any) => ({
      id: d.id,
      type: d.type,
      name: d.name,
      value: d.value,
      ttl: d.ttl
    }));
  },

  async getResourceUsage(userId: string) {
    // Mock usage data - in reality this would come from a monitoring service/DB
    // For MVP we keep it mocked but could store in DB if needed.
    return {
        cpu: Math.floor(Math.random() * 60) + 10,
        memory: Math.floor(Math.random() * 70) + 20,
        storage: 35,
        bandwidth: 20
    };
  },

  // Audit Logs
  async getAuditLogs(): Promise<SpaceAuditLog[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("audit_events")
      .select("*")
      .eq("actor_type", "admin")
      .eq("metadata->>scope", "space") // Filter by scope if we add it
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return data.map((log: any) => ({
      id: log.id,
      adminId: log.actor_id,
      actionType: log.metadata?.action_type || "status_change",
      targetServiceId: log.entity_id,
      targetUserId: log.metadata?.targetUserId, // We might need to store this in metadata
      details: log.metadata?.details || "",
      timestamp: log.created_at
    }));
  },

  async logAction(log: Omit<SpaceAuditLog, "id" | "timestamp">) {
    await logEvent({
      tenant_id: null,
      actor_type: 'admin',
      actor_id: log.adminId,
      event_type: EVENT_TYPES.ADMIN_SPACE_ACTION, // Generic event type
      entity_type: 'space_service',
      entity_id: log.targetServiceId,
      metadata: {
        action_type: log.actionType,
        details: log.details,
        targetUserId: log.targetUserId,
        scope: 'space'
      }
    });
  }
};
