
export type SpacePlanType = "shared" | "dedicated" | "cdn";
export type SpaceServiceStatus = "active" | "suspended" | "provisioning" | "terminated" | "maintenance"; // Updated status
export type SpaceHostingType = "Shared" | "Dedicated" | "CDN";

export interface SpacePlanConfig {
  type: SpacePlanType;
  name: string;
  enabled: boolean;
  inviteOnly: boolean;
  priceMonthly: number; // Locked config
}

export interface SpaceResourceLimits {
  storageGB: number;
  bandwidthGB: number;
  vCPU?: number;
  ramGB?: number;
  dedicatedIP?: boolean;
  cdnTrafficTier?: "low" | "medium" | "high";
}

export interface SpaceServiceProfile {
  id: string; // Service ID
  userId: string;
  type: SpaceHostingType;
  status: SpaceServiceStatus;
  planName: string;
  limits: SpaceResourceLimits;
  dataCenterId: string;
  createdAt: string;
}

export interface SpaceGlobalConfig {
  plans: SpacePlanConfig[];
  maintenanceMode: boolean;
}

export interface SpaceStats {
  totalCustomers: number;
  activeServices: number;
  suspendedServices: number;
  byType: Record<SpaceHostingType, number>;
  cdnEnabledCount: number;
}

export interface SpaceAuditLog {
  id: string;
  adminId: string;
  actionType: "plan_toggle" | "limit_change" | "status_change" | "dc_assignment";
  targetServiceId?: string;
  targetUserId?: string;
  details: string;
  timestamp: string;
}

// Customer Dashboard Types

export type SpaceProjectStatus = "active" | "maintenance" | "error" | "deploying";

export interface SpaceProject {
  id: string;
  serviceId: string; // Links to the parent Service (Hosting Plan)
  userId: string;
  domain: string;
  name: string; // Friendly name
  type: "wordpress" | "nodejs" | "static" | "other";
  status: SpaceProjectStatus;
  sslEnabled: boolean;
  lastBackup?: string;
  createdAt: string;
}

export interface SpaceEnvironmentVar {
  key: string;
  value: string; // Masked in UI
  isSecret: boolean;
}

export interface SpaceDnsRecord {
  id: string;
  type: "A" | "CNAME" | "MX" | "TXT";
  name: string;
  value: string;
  ttl: number;
}
