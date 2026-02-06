
import { DataCenter, DCAuditLog, DCStatus } from "@/types/datacenter";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dcService = {
  async getAll(): Promise<DataCenter[]> {
    const { data, error } = await getSupabaseAdmin()
      .from("datacenters")
      .select("*")
      .order("active_nodes", { ascending: false });

    if (error) {
      console.error("Error fetching datacenters:", error);
      return [];
    }

    return data.map(mapDbDcToAppDc);
  },

  async getById(id: string): Promise<DataCenter | null> {
    const { data, error } = await getSupabaseAdmin()
      .from("datacenters")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return mapDbDcToAppDc(data);
  },

  async updateCapacity(
    adminId: string,
    dcId: string,
    newTotal: number
  ): Promise<{ success: boolean; error?: string }> {
    const dc = await this.getById(dcId);
    if (!dc) return { success: false, error: "Data center not found" };

    if (newTotal < dc.capacity.active) {
      return { 
        success: false, 
        error: `Cannot reduce total capacity below active nodes (${dc.capacity.active}).` 
      };
    }

    const { error } = await getSupabaseAdmin()
      .from("datacenters")
      .update({ total_capacity: newTotal })
      .eq("id", dcId);

    if (error) return { success: false, error: error.message };

    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "update_capacity",
      details: `Updated capacity from ${dc.capacity.total} to ${newTotal}`,
      previousValue: dc.capacity.total,
      newValue: newTotal
    });

    return { success: true };
  },

  async allocateNode(adminId: string, dcId: string): Promise<{ success: boolean; error?: string }> {
    // This should ideally be a transaction or stored procedure to avoid race conditions
    // For now, we fetch, check, and update
    const dc = await this.getById(dcId);
    if (!dc) return { success: false, error: "Data center not found" };

    if (dc.capacity.active >= dc.capacity.total) {
      return { success: false, error: "Data center capacity exhausted" };
    }

    const { error } = await getSupabaseAdmin()
      .from("datacenters")
      .update({ active_nodes: dc.capacity.active + 1 })
      .eq("id", dcId);

    if (error) return { success: false, error: error.message };

    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "update_capacity",
      details: `Allocated node slot. Active: ${dc.capacity.active} -> ${dc.capacity.active + 1}`,
      previousValue: dc.capacity.active,
      newValue: dc.capacity.active + 1
    });

    return { success: true };
  },

  async releaseNode(adminId: string, dcId: string): Promise<{ success: boolean; error?: string }> {
    const dc = await this.getById(dcId);
    if (!dc) return { success: false, error: "Data center not found" };

    if (dc.capacity.active <= 0) {
      return { success: false, error: "No active nodes to release" };
    }

    const { error } = await getSupabaseAdmin()
      .from("datacenters")
      .update({ active_nodes: dc.capacity.active - 1 })
      .eq("id", dcId);

    if (error) return { success: false, error: error.message };

    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "update_capacity",
      details: `Released node slot. Active: ${dc.capacity.active} -> ${dc.capacity.active - 1}`,
      previousValue: dc.capacity.active,
      newValue: dc.capacity.active - 1
    });

    return { success: true };
  },

  async updateStatus(
    adminId: string,
    dcId: string,
    status: DCStatus
  ): Promise<boolean> {
    const dc = await this.getById(dcId);
    if (!dc) return false;

    const { error } = await supabaseAdmin
      .from("datacenters")
      .update({ status })
      .eq("id", dcId);

    if (error) return false;

    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "update_status",
      details: `Changed status from ${dc.status} to ${status}`,
      previousValue: dc.status,
      newValue: status
    });

    return true;
  },

  async addNote(adminId: string, dcId: string, note: string): Promise<boolean> {
    const dc = await this.getById(dcId);
    if (!dc) return false;

    // We need to fetch the current notes first to append, but getById returns AppDC not DbDC.
    // So we fetch raw from DB or assume AppDC has it (if we map it).
    // Let's check mapDbDcToAppDc first.
    // For now, let's just append via array_append if supabase supports it or fetch-update.
    
    // Easier to just update via SQL append if possible, but standard is read-update.
    const { data: currentDc } = await getSupabaseAdmin().from("datacenters").select("admin_notes").eq("id", dcId).single();
    const currentNotes = currentDc?.admin_notes || [];
    
    const { error } = await getSupabaseAdmin()
      .from("datacenters")
      .update({ admin_notes: [...currentNotes, note] })
      .eq("id", dcId);

    if (error) return false;

    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "add_note",
      details: note,
      newValue: note
    });

    return true;
  },

  async updateHardwareConfig(
    adminId: string,
    dcId: string,
    config: any
  ): Promise<{ success: boolean; error?: string }> {
    // Hardware config is not in the DB spec.
    // We will just log this action for now.
    await this.logAction({
      adminId,
      targetDcId: dcId,
      actionType: "update_status",
      details: `Updated hardware configuration (simulated): ${JSON.stringify(config)}`,
    });

    return { success: true };
  },

  async getAuditLogs(dcId: string): Promise<DCAuditLog[]> {
    const { data, error } = await getSupabaseAdmin()
      .from("admin_audit_logs")
      .select("*")
      .eq("target_id", dcId)
      .eq("target_resource", "datacenter")
      .order("timestamp", { ascending: false });

    if (error) return [];

    return data.map(log => ({
      id: log.id,
      adminId: log.admin_id,
      targetDcId: log.target_id,
      actionType: log.action_type as any,
      details: log.details,
      timestamp: log.timestamp,
      previousValue: log.previous_value,
      newValue: log.new_value
    }));
  },

  async logAction(log: Omit<DCAuditLog, "id" | "timestamp">) {
    await getSupabaseAdmin().from("admin_audit_logs").insert({
      admin_id: log.adminId,
      target_resource: "datacenter",
      target_id: log.targetDcId,
      action_type: log.actionType,
      details: log.details,
      previous_value: log.previousValue ? String(log.previousValue) : null,
      new_value: log.newValue ? String(log.newValue) : null
    });
  }
};

function mapDbDcToAppDc(dbDc: any): DataCenter {
  return {
    id: dbDc.id,
    name: dbDc.name,
    location: {
      city: dbDc.location.split(',')[0]?.trim() || dbDc.location,
      state: dbDc.location.split(',')[1]?.trim() || '',
      country: dbDc.location.split(',')[2]?.trim() || 'India'
    },
    status: dbDc.status as DCStatus,
    goLiveDate: dbDc.created_at,
    capacity: {
      total: dbDc.total_capacity,
      active: dbDc.active_nodes
    },
    infrastructure: {
      powerProfile: "Active-Active Grid", // Static default
      networkProfile: "Carrier Neutral",  // Static default
      coolingProfile: "N+1 Precision"     // Static default
    },
    notes: [], // Not stored in DB
    hardwareConfig: undefined // Not stored in DB
  };
}
