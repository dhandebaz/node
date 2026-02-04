
import { Node, NodeAuditLog, NodeFilterOptions, NodeStatus, MoUStatus } from "@/types/node";
import { dcService } from "./datacenterService";

// Mock Data
let MOCK_NODES: Node[] = [
  {
    identity: {
      id: "ND-DEL-101",
      unitValue: 1000000,
      createdAt: "2023-11-20T10:00:00Z",
    },
    participant: {
      userId: "USR-001",
    },
    infrastructure: {
      dcId: "DC-DEL-01",
      pool: "Standard",
    },
    contract: {
      mouStatus: "active",
      mouRefId: "MOU-2023-001",
      signedDate: "2023-11-25T00:00:00Z",
    },
    state: {
      status: "active",
      activationDate: "2023-12-01T00:00:00Z",
      holdPeriodEnd: "2026-12-01T00:00:00Z", // 3 Year lock-in example
    },
    metadata: {
      adminNotes: ["Initial batch deployment"],
      tags: ["early-adopter", "delhi-batch-1"],
    },
  },
  {
    identity: {
      id: "ND-DEL-102",
      unitValue: 1000000,
      createdAt: "2024-01-15T10:00:00Z",
    },
    participant: {
      userId: "USR-002",
    },
    infrastructure: {
      dcId: "DC-DEL-01",
      pool: "High Performance",
    },
    contract: {
      mouStatus: "signed",
      mouRefId: "MOU-2024-045",
      signedDate: "2024-01-20T00:00:00Z",
    },
    state: {
      status: "deploying",
    },
    metadata: {
      adminNotes: [],
      tags: [],
    },
  }
];

let MOCK_LOGS: NodeAuditLog[] = [];

export const nodeService = {
  async getAll(filters?: NodeFilterOptions): Promise<Node[]> {
    let nodes = [...MOCK_NODES];

    if (filters) {
      if (filters.dcId) {
        nodes = nodes.filter(n => n.infrastructure.dcId === filters.dcId);
      }
      if (filters.status) {
        nodes = nodes.filter(n => n.state.status === filters.status);
      }
      if (filters.mouStatus) {
        nodes = nodes.filter(n => n.contract.mouStatus === filters.mouStatus);
      }
      if (filters.userId) {
        nodes = nodes.filter(n => n.participant.userId === filters.userId);
      }
    }

    // Sort by created date desc
    return nodes.sort((a, b) => 
      new Date(b.identity.createdAt).getTime() - new Date(a.identity.createdAt).getTime()
    );
  },

  async getById(id: string): Promise<Node | null> {
    return MOCK_NODES.find(n => n.identity.id === id) || null;
  },

  async getByUserId(userId: string): Promise<Node[]> {
    return MOCK_NODES.filter(n => n.participant.userId === userId);
  },

  async createNode(
    adminId: string,
    data: {
      userId: string;
      dcId: string;
      pool: "Standard" | "High Performance" | "Storage Optimized";
    }
  ): Promise<{ success: boolean; error?: string; node?: Node }> {
    // Check DC Capacity Availability
    const dc = await dcService.getById(data.dcId);
    if (!dc) return { success: false, error: "Data Center not found" };

    const available = dc.capacity.total - dc.capacity.active;
    if (available <= 0) {
      return { success: false, error: "Data Center has no available capacity" };
    }

    const newNode: Node = {
      identity: {
        id: `ND-${data.dcId.split('-')[1]}-${Math.floor(Math.random() * 10000)}`,
        unitValue: 1000000,
        createdAt: new Date().toISOString(),
      },
      participant: {
        userId: data.userId,
      },
      infrastructure: {
        dcId: data.dcId,
        pool: data.pool,
      },
      contract: {
        mouStatus: "draft",
      },
      state: {
        status: "pending",
      },
      metadata: {
        adminNotes: [],
        tags: [],
      },
    };

    MOCK_NODES.push(newNode);

    await this.logAction({
      adminId,
      targetNodeId: newNode.identity.id,
      actionType: "create",
      details: "Created new node participation",
      newValue: newNode
    });

    return { success: true, node: newNode };
  },

  async updateStatus(
    adminId: string,
    nodeId: string,
    newStatus: NodeStatus
  ): Promise<{ success: boolean; error?: string }> {
    const node = MOCK_NODES.find(n => n.identity.id === nodeId);
    if (!node) return { success: false, error: "Node not found" };

    const oldStatus = node.state.status;
    if (oldStatus === newStatus) return { success: true };

    // Handle Capacity Logic
    // Activation: Increment Active Count
    if (newStatus === "active" && oldStatus !== "active" && oldStatus !== "paused") {
      const res = await dcService.allocateNode(adminId, node.infrastructure.dcId);
      if (!res.success) return { success: false, error: `Capacity Error: ${res.error}` };
      
      node.state.activationDate = new Date().toISOString();
      // Set hold period end to 3 years from now by default
      const holdEnd = new Date();
      holdEnd.setFullYear(holdEnd.getFullYear() + 3);
      node.state.holdPeriodEnd = holdEnd.toISOString();
    }

    // Retirement: Decrement Active Count
    if (newStatus === "retired" && (oldStatus === "active" || oldStatus === "paused")) {
      const res = await dcService.releaseNode(adminId, node.infrastructure.dcId);
      if (!res.success) return { success: false, error: `Capacity Error: ${res.error}` };
    }

    // Pausing/Resuming: No capacity change
    
    node.state.status = newStatus;

    await this.logAction({
      adminId,
      targetNodeId: nodeId,
      actionType: "status_change",
      details: `Changed status from ${oldStatus} to ${newStatus}`,
      previousValue: oldStatus,
      newValue: newStatus
    });

    return { success: true };
  },

  async updateMoUStatus(
    adminId: string,
    nodeId: string,
    status: MoUStatus,
    refId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const node = MOCK_NODES.find(n => n.identity.id === nodeId);
    if (!node) return { success: false, error: "Node not found" };

    const oldStatus = node.contract.mouStatus;
    node.contract.mouStatus = status;
    if (refId) node.contract.mouRefId = refId;
    if (status === "signed" || status === "active") {
        if (!node.contract.signedDate) node.contract.signedDate = new Date().toISOString();
    }

    await this.logAction({
      adminId,
      targetNodeId: nodeId,
      actionType: "update_contract",
      details: `Updated MoU status to ${status}`,
      previousValue: oldStatus,
      newValue: status
    });

    return { success: true };
  },

  async addNote(adminId: string, nodeId: string, note: string): Promise<boolean> {
    const node = MOCK_NODES.find(n => n.identity.id === nodeId);
    if (!node) return false;

    node.metadata.adminNotes.push(note);
    
    await this.logAction({
      adminId,
      targetNodeId: nodeId,
      actionType: "add_note",
      details: `Added note: ${note.substring(0, 50)}...`,
    });

    return true;
  },

  async getAuditLogs(nodeId: string): Promise<NodeAuditLog[]> {
    return MOCK_LOGS
      .filter(l => l.targetNodeId === nodeId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  async logAction(log: Omit<NodeAuditLog, "id" | "timestamp">) {
    MOCK_LOGS.push({
      ...log,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
    });
  }
};
