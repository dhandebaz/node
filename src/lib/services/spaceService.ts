
import { 
  SpaceGlobalConfig, 
  SpaceServiceProfile, 
  SpaceAuditLog, 
  SpaceStats,
  SpacePlanConfig,
  SpaceResourceLimits,
  SpaceProject,
  SpaceDnsRecord,
  SpaceServiceStatus
} from "@/types/space";
import { settingsService } from "./settingsService";

// Mock Data Storage
let GLOBAL_CONFIG: SpaceGlobalConfig = {
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

let MOCK_SERVICES: SpaceServiceProfile[] = [
  {
    id: "SVC-1001",
    userId: "USR-001",
    type: "Dedicated",
    status: "active",
    planName: "Pro Cloud",
    dataCenterId: "DC-DEL-01",
    createdAt: "2023-12-05T10:00:00Z",
    limits: {
      storageGB: 100,
      bandwidthGB: 2000,
      vCPU: 4,
      ramGB: 16,
      dedicatedIP: true,
    },
  },
  {
    id: "SVC-1002",
    userId: "USR-001",
    type: "Shared",
    status: "active",
    planName: "Starter",
    dataCenterId: "DC-DEL-01",
    createdAt: "2024-01-15T14:30:00Z",
    limits: {
      storageGB: 10,
      bandwidthGB: 100,
      vCPU: 1,
      ramGB: 2,
      dedicatedIP: false,
    },
  },
  {
    id: "SVC-1003",
    userId: "USR-001",
    type: "Dedicated",
    status: "maintenance" as SpaceServiceStatus,
    planName: "Enterprise",
    dataCenterId: "DC-DEL-01",
    createdAt: "2023-11-25T14:00:00Z",
    limits: {
      storageGB: 10,
      bandwidthGB: 100,
      dedicatedIP: false,
    },
  },
];

let AUDIT_LOGS: SpaceAuditLog[] = [
  {
    id: "LOG-001",
    adminId: "ADMIN-001",
    actionType: "status_change",
    targetServiceId: "SVC-1003",
    targetUserId: "USR-003",
    details: "Suspended service due to policy violation",
    timestamp: "2024-01-05T10:00:00Z",
  },
];

export const spaceService = {
  // Config
  async getConfig(): Promise<SpaceGlobalConfig> {
    return GLOBAL_CONFIG;
  },

  async togglePlan(adminId: string, planName: string, enabled: boolean): Promise<boolean> {
    const plan = GLOBAL_CONFIG.plans.find((p) => p.name === planName);
    if (!plan) return false;

    plan.enabled = enabled;
    await this.logAction({
      adminId,
      actionType: "plan_toggle",
      details: `${enabled ? "Enabled" : "Disabled"} plan: ${planName}`,
    });
    return true;
  },
  
  async togglePlanInviteOnly(adminId: string, planName: string, inviteOnly: boolean): Promise<boolean> {
    const plan = GLOBAL_CONFIG.plans.find((p) => p.name === planName);
    if (!plan) return false;

    plan.inviteOnly = inviteOnly;
    await this.logAction({
        adminId,
        actionType: "plan_toggle",
        details: `Set plan ${planName} invite-only to ${inviteOnly}`,
    });
    return true;
  },

  // Stats
  async getStats(): Promise<SpaceStats> {
    const totalCustomers = new Set(MOCK_SERVICES.map((s) => s.userId)).size;
    const activeServices = MOCK_SERVICES.filter((s) => s.status === "active").length;
    const suspendedServices = MOCK_SERVICES.filter((s) => s.status === "suspended").length;
    const cdnEnabledCount = MOCK_SERVICES.filter((s) => s.type === "CDN" && s.status === "active").length;

    const byType = {
      Shared: MOCK_SERVICES.filter((s) => s.type === "Shared").length,
      Dedicated: MOCK_SERVICES.filter((s) => s.type === "Dedicated").length,
      CDN: MOCK_SERVICES.filter((s) => s.type === "CDN").length,
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
    const isProduction = await settingsService.isProductionMode();
    if (isProduction) return [];
    return MOCK_SERVICES;
  },

  async getUserServices(userId: string): Promise<SpaceServiceProfile[]> {
    const isProduction = await settingsService.isProductionMode();
    if (isProduction) return [];
    return MOCK_SERVICES.filter((s) => s.userId === userId);
  },

  async updateServiceStatus(
    adminId: string,
    serviceId: string,
    status: SpaceServiceProfile["status"],
    reason?: string
  ): Promise<boolean> {
    const service = MOCK_SERVICES.find((s) => s.id === serviceId);
    if (!service) return false;

    const oldStatus = service.status;
    service.status = status;

    await this.logAction({
      adminId,
      actionType: "status_change",
      targetServiceId: serviceId,
      targetUserId: service.userId,
      details: `Changed status from ${oldStatus} to ${status}. Reason: ${reason || "Admin action"}`,
    });

    return true;
  },

  async updateResourceLimits(
    adminId: string,
    serviceId: string,
    limits: Partial<SpaceResourceLimits>
  ): Promise<boolean> {
    const service = MOCK_SERVICES.find((s) => s.id === serviceId);
    if (!service) return false;

    service.limits = { ...service.limits, ...limits };

    await this.logAction({
      adminId,
      actionType: "limit_change",
      targetServiceId: serviceId,
      targetUserId: service.userId,
      details: `Updated limits: ${JSON.stringify(limits)}`,
    });

    return true;
  },

  // Customer Dashboard Methods
  async getUserProjects(userId: string): Promise<SpaceProject[]> {
    // Mock mapping services to projects
    const services = await this.getUserServices(userId);
    const projects: SpaceProject[] = [];

    services.forEach(svc => {
      // Mocking 1 project per service for now
      projects.push({
        id: `PRJ-${svc.id.split('-')[1]}`,
        serviceId: svc.id,
        userId: svc.userId,
        domain: svc.type === "Shared" ? "my-startup.nodebase.cloud" : "kaisa.ai",
        name: svc.type === "Shared" ? "My Startup Landing" : "Kaisa Main App",
        type: svc.type === "Shared" ? "static" : "nodejs",
        status: svc.status === "active" ? "active" : "maintenance",
        sslEnabled: true,
        lastBackup: new Date(Date.now() - 86400000).toISOString(),
        createdAt: svc.createdAt,
      });
    });

    return projects;
  },

  async getProjectById(projectId: string): Promise<SpaceProject | null> {
    // Mock lookup - in real DB this would be a query
    // We'll generate it from services to keep consistency
    const services = await this.getAllServices();
    const serviceId = `SVC-${projectId.split('-')[1]}`;
    const service = services.find(s => s.id === serviceId);
    
    if (!service) return null;

    return {
        id: projectId,
        serviceId: service.id,
        userId: service.userId,
        domain: service.type === "Shared" ? "my-startup.nodebase.cloud" : "kaisa.ai",
        name: service.type === "Shared" ? "My Startup Landing" : "Kaisa Main App",
        type: service.type === "Shared" ? "static" : "nodejs",
        status: service.status === "active" ? "active" : "maintenance",
        sslEnabled: true,
        lastBackup: new Date(Date.now() - 86400000).toISOString(),
        createdAt: service.createdAt,
    };
  },

  async getProjectDns(projectId: string): Promise<SpaceDnsRecord[]> {
    return [
      { id: "DNS-1", type: "A", name: "@", value: "103.21.44.12", ttl: 3600 },
      { id: "DNS-2", type: "CNAME", name: "www", value: "@", ttl: 3600 },
      { id: "DNS-3", type: "MX", name: "@", value: "mail.nodebase.cloud", ttl: 3600 },
    ];
  },

  async getResourceUsage(userId: string) {
    // Mock usage data
    return {
        cpu: 45,
        memory: 60,
        storage: 35,
        bandwidth: 20
    };
  },

  // Audit Logs
  async getAuditLogs(): Promise<SpaceAuditLog[]> {
    return [...AUDIT_LOGS].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  async logAction(log: Omit<SpaceAuditLog, "id" | "timestamp">) {
    const newLog: SpaceAuditLog = {
      ...log,
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    AUDIT_LOGS.push(newLog);
  }
};
