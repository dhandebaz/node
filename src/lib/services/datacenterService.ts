
import { DataCenter, DCAuditLog, DCStatus } from "@/types/datacenter";

// Mock Data Store
let MOCK_DCS: DataCenter[] = [
  {
    id: "DC-DEL-01",
    name: "Okhla – Delhi",
    location: {
      city: "New Delhi",
      state: "Delhi",
      country: "India",
    },
    status: "active",
    goLiveDate: "2023-11-15T00:00:00Z",
    capacity: {
      total: 166,
      active: 6,
    },
    infrastructure: {
      powerProfile: "Dual source grid + N+1 DG Backup",
      networkProfile: "Carrier Neutral, 10Gbps Uplink",
      coolingProfile: "Precision AC (N+1)",
    },
    notes: ["Initial deployment site."],
  },
  {
    id: "DC-BLR-01",
    name: "Whitefield – Bangalore",
    location: {
      city: "Bangalore",
      state: "Karnataka",
      country: "India",
    },
    status: "planned",
    goLiveDate: "2024-06-01T00:00:00Z",
    capacity: {
      total: 200,
      active: 0,
    },
    infrastructure: {
      powerProfile: "Tier 3 Specs",
      networkProfile: "Planned 40Gbps Ring",
      coolingProfile: "Liquid Immersion Ready",
    },
    notes: ["Site survey completed."],
  },
];

let MOCK_LOGS: DCAuditLog[] = [];

export const dcService = {
  async getAll(): Promise<DataCenter[]> {
    // Sort by status (active first) then available capacity
    return [...MOCK_DCS].sort((a, b) => {
      if (a.status === b.status) {
        return (b.capacity.total - b.capacity.active) - (a.capacity.total - a.capacity.active);
      }
      return a.status === "active" ? -1 : 1;
    });
  },

  async getById(id: string): Promise<DataCenter | null> {
    return MOCK_DCS.find(dc => dc.id === id) || null;
  },

  async updateCapacity(
    adminId: string,
    dcId: string,
    newTotal: number
  ): Promise<{ success: boolean; error?: string }> {
    const dc = MOCK_DCS.find(d => d.id === dcId);
    if (!dc) return { success: false, error: "Data center not found" };

    if (newTotal < dc.capacity.active) {
      return { 
        success: false, 
        error: `Cannot reduce total capacity below active nodes (${dc.capacity.active}).` 
      };
    }

    const oldTotal = dc.capacity.total;
    dc.capacity.total = newTotal;

    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "update_capacity",
      details: `Updated capacity from ${oldTotal} to ${newTotal}`,
      previousValue: oldTotal,
      newValue: newTotal
    });

    return { success: true };
  },

  async allocateNode(adminId: string, dcId: string): Promise<{ success: boolean; error?: string }> {
    const dc = MOCK_DCS.find(d => d.id === dcId);
    if (!dc) return { success: false, error: "Data center not found" };

    if (dc.capacity.active >= dc.capacity.total) {
      return { success: false, error: "Data center capacity exhausted" };
    }

    const oldActive = dc.capacity.active;
    dc.capacity.active += 1;

    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "update_capacity",
      details: `Allocated node slot. Active: ${oldActive} -> ${dc.capacity.active}`,
      previousValue: oldActive,
      newValue: dc.capacity.active
    });

    return { success: true };
  },

  async releaseNode(adminId: string, dcId: string): Promise<{ success: boolean; error?: string }> {
    const dc = MOCK_DCS.find(d => d.id === dcId);
    if (!dc) return { success: false, error: "Data center not found" };

    if (dc.capacity.active <= 0) {
      return { success: false, error: "No active nodes to release" };
    }

    const oldActive = dc.capacity.active;
    dc.capacity.active -= 1;

    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "update_capacity",
      details: `Released node slot. Active: ${oldActive} -> ${dc.capacity.active}`,
      previousValue: oldActive,
      newValue: dc.capacity.active
    });

    return { success: true };
  },

  async updateStatus(
    adminId: string,
    dcId: string,
    status: DCStatus
  ): Promise<boolean> {
    const dc = MOCK_DCS.find(d => d.id === dcId);
    if (!dc) return false;

    const oldStatus = dc.status;
    dc.status = status;

    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "update_status",
      details: `Changed status from ${oldStatus} to ${status}`,
      previousValue: oldStatus,
      newValue: status
    });

    return true;
  },

  async addNote(adminId: string, dcId: string, note: string): Promise<boolean> {
    const dc = MOCK_DCS.find(d => d.id === dcId);
    if (!dc) return false;

    dc.notes.push(note);
    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "add_note",
      details: "Added operational note",
      newValue: note
    });

    return true;
  },

  async getAuditLogs(dcId: string): Promise<DCAuditLog[]> {
    return MOCK_LOGS.filter(l => l.targetDcId === dcId).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  async logAction(log: Omit<DCAuditLog, "id" | "timestamp">) {
    const newLog: DCAuditLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    MOCK_LOGS.unshift(newLog);
    console.log("[DC AUDIT]", newLog);
  }
};
