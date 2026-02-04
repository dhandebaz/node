
export type NodeStatus = "pending" | "deploying" | "active" | "paused" | "retired";
export type MoUStatus = "draft" | "signed" | "active" | "terminated";

export interface NodeIdentity {
  id: string; // Immutable, e.g., ND-DEL-101
  unitValue: number; // Fixed at 10,00,000
  createdAt: string; // ISO Date
}

export interface NodeParticipant {
  userId: string; // Linked to User system
  // Derived fields are fetched at runtime via UserService
}

export interface NodeInfrastructure {
  dcId: string; // Linked to DataCenter system
  pool: "Standard" | "High Performance" | "Storage Optimized";
}

export interface NodeContract {
  mouStatus: MoUStatus;
  mouRefId?: string;
  signedDate?: string;
}

export interface NodeState {
  status: NodeStatus;
  activationDate?: string;
  holdPeriodEnd?: string; // Derived from activation date + policy
}

export interface NodeMetadata {
  adminNotes: string[];
  tags: string[];
}

export interface Node {
  identity: NodeIdentity;
  participant: NodeParticipant;
  infrastructure: NodeInfrastructure;
  contract: NodeContract;
  state: NodeState;
  metadata: NodeMetadata;
}

export interface NodeFilterOptions {
  dcId?: string;
  status?: NodeStatus;
  mouStatus?: MoUStatus;
  userId?: string;
}

export interface NodeAuditLog {
  id: string;
  targetNodeId: string;
  adminId: string;
  actionType: "create" | "status_change" | "update_contract" | "update_infrastructure" | "add_note";
  details: string;
  previousValue?: any;
  newValue?: any;
  timestamp: string;
}
