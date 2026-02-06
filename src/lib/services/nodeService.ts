
import { Node, NodeAuditLog, NodeFilterOptions, NodeStatus, MoUStatus } from "@/types/node";
import { dcService } from "./datacenterService";
import { getSupabaseServer } from "@/lib/supabase/server";

export const nodeService = {
  async getAll(filters?: NodeFilterOptions): Promise<Node[]> {
    const supabase = await getSupabaseServer();
    let query = supabase.from("nodes").select("*");

    if (filters) {
      if (filters.dcId) {
        query = query.eq("datacenter_id", filters.dcId);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.mouStatus) {
        query = query.eq("mou_status", filters.mouStatus);
      }
      if (filters.userId) {
        query = query.eq("user_id", filters.userId);
      }
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching nodes:", error);
      return [];
    }

    return data.map(mapDbNodeToAppNode);
  },

  async getById(id: string): Promise<Node | null> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("nodes")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return mapDbNodeToAppNode(data);
  },

  async getByUserId(userId: string): Promise<Node[]> {
    const { data, error } = await supabaseAdmin
      .from("nodes")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) return [];

    return data.map(mapDbNodeToAppNode);
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

    // Insert new node
    const supabase = await getSupabaseServer();
    const { data: newNodeData, error } = await supabase
      .from("nodes")
      .insert({
        user_id: data.userId,
        datacenter_id: data.dcId,
        pool: data.pool,
        status: "pending",
        mou_status: "draft",
        unit_value: 1000000 // Default fixed value
      })
      .select()
      .single();

    if (error || !newNodeData) {
      return { success: false, error: error?.message || "Failed to create node" };
    }

    const newNode = mapDbNodeToAppNode(newNodeData);

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
    const node = await this.getById(nodeId);
    if (!node) return { success: false, error: "Node not found" };

    const oldStatus = node.state.status;
    if (oldStatus === newStatus) return { success: true };

    // Handle Capacity Logic
    // Activation: Increment Active Count
    if (newStatus === "active" && oldStatus !== "active" && oldStatus !== "paused") {
      const res = await dcService.allocateNode(adminId, node.infrastructure.dcId);
      if (!res.success) return { success: false, error: `Capacity Error: ${res.error}` };
    }

    // Retirement: Decrement Active Count
    if (newStatus === "retired" && (oldStatus === "active" || oldStatus === "paused")) {
      const res = await dcService.releaseNode(adminId, node.infrastructure.dcId);
      if (!res.success) return { success: false, error: `Capacity Error: ${res.error}` };
    }

    const updateData: any = { status: newStatus };

    if (newStatus === "active" && oldStatus !== "active") {
        updateData.activated_at = new Date().toISOString();
        // Set hold period end to 3 years from now by default
        const holdEnd = new Date();
        holdEnd.setFullYear(holdEnd.getFullYear() + 3);
        updateData.hold_period_end = holdEnd.toISOString();
    }

    const { error } = await supabaseAdmin
      .from("nodes")
      .update(updateData)
      .eq("id", nodeId);

    if (error) return { success: false, error: error.message };

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
    status: MoUStatus
  ): Promise<{ success: boolean; error?: string }> {
    const node = await this.getById(nodeId);
    if (!node) return { success: false, error: "Node not found" };

    const { error } = await supabaseAdmin
      .from("nodes")
      .update({ mou_status: status })
      .eq("id", nodeId);

    if (error) return { success: false, error: error.message };

    await this.logAction({
      adminId,
      targetNodeId: nodeId,
      actionType: "update_contract",
      details: `Updated MoU status from ${node.contract.mouStatus} to ${status}`,
      previousValue: node.contract.mouStatus,
      newValue: status
    });

    return { success: true };
  },

  async addNodeNote(
    adminId: string,
    nodeId: string,
    note: string
  ): Promise<{ success: boolean; error?: string }> {
    const node = await this.getById(nodeId);
    if (!node) return { success: false, error: "Node not found" };

    const newNotes = [...node.metadata.adminNotes, note];

    const { error } = await supabaseAdmin
      .from("nodes")
      .update({ admin_notes: newNotes })
      .eq("id", nodeId);

    if (error) return { success: false, error: error.message };

    await this.logAction({
      adminId,
      targetNodeId: nodeId,
      actionType: "add_note",
      details: `Added admin note: ${note.substring(0, 50)}${note.length > 50 ? '...' : ''}`,
      newValue: note
    });

    return { success: true };
  },

  async getAuditLogs(nodeId: string): Promise<NodeAuditLog[]> {
    const { data, error } = await supabaseAdmin
      .from("admin_audit_logs")
      .select("*")
      .eq("target_resource", "node")
      .eq("target_id", nodeId)
      .order("timestamp", { ascending: false });

    if (error) return [];

    return data.map((log: any) => ({
      id: log.id,
      targetNodeId: log.target_id,
      adminId: log.admin_id,
      actionType: log.action_type,
      details: log.details,
      previousValue: log.previous_value ? JSON.parse(log.previous_value) : undefined,
      newValue: log.new_value ? JSON.parse(log.new_value) : undefined,
      timestamp: log.timestamp
    }));
  },

  async logAction(log: Omit<NodeAuditLog, "id" | "timestamp">) {
    await supabaseAdmin.from("admin_audit_logs").insert({
      admin_id: log.adminId,
      target_resource: "node",
      target_id: log.targetNodeId,
      action_type: log.actionType,
      details: log.details,
      previous_value: log.previousValue ? JSON.stringify(log.previousValue) : null,
      new_value: log.newValue ? JSON.stringify(log.newValue) : null
    });
  }
};

function mapDbNodeToAppNode(dbNode: any): Node {
  return {
    identity: {
      id: dbNode.id,
      unitValue: dbNode.unit_value,
      createdAt: dbNode.created_at
    },
    participant: {
      userId: dbNode.user_id
    },
    infrastructure: {
      dcId: dbNode.datacenter_id,
      pool: dbNode.pool
    },
    contract: {
      mouStatus: dbNode.mou_status,
      mouRefId: undefined, // Not in DB
      signedDate: undefined // Not in DB
    },
    state: {
      status: dbNode.status,
      activationDate: dbNode.activated_at,
      holdPeriodEnd: dbNode.hold_period_end
    },
    metadata: {
      adminNotes: dbNode.admin_notes || [],
      tags: [] // Not in DB yet
    }
  };
}
