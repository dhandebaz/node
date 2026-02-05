
export type DCStatus = "active" | "planned" | "retired";

export interface DCLocation {
  city: string;
  state: string;
  country: string;
}

export interface DCCapacity {
  total: number;
  active: number;
  // available is derived: total - active
}

export interface DCMetadata {
  powerProfile: string;
  networkProfile: string;
  coolingProfile: string;
}

export interface DCHardwareConfig {
  connectionStatus: "connected" | "disconnected" | "error";
  ipAddress?: string;
  sshPort?: number;
  agentVersion?: string;
  lastHeartbeat?: string;
  authType?: "ssh_key" | "password" | "agent_token";
}

export interface DataCenter {
  id: string; // Immutable
  name: string;
  location: DCLocation;
  status: DCStatus;
  goLiveDate: string; // ISO Date
  capacity: DCCapacity;
  infrastructure: DCMetadata;
  notes: string[]; // Admin-only notes
  hardwareConfig?: DCHardwareConfig; // For connecting physical servers
}

export interface DCAuditLog {
  id: string;
  adminId: string;
  targetDcId: string;
  actionType: "create" | "update_capacity" | "update_status" | "add_note";
  details: string;
  timestamp: string;
  previousValue?: string | number;
  newValue?: string | number;
}
