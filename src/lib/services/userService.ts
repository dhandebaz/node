import { 
  User, 
  UserFilterOptions, 
  AuditLog, 
  AccountStatus, 
  KYCStatus,
  KYCDocument
} from "@/types/user";
import { getSupabaseServer } from "@/lib/supabase/server";

// Service Methods

export const userService = {
  async getUsers(filters?: UserFilterOptions): Promise<User[]> {
    const supabase = await getSupabaseServer();
    let query = supabase.from("users").select("*, kaisa_accounts(*), profiles(*)");

    if (filters?.search) {
       // Simple search on phone or ID
       query = query.or(`phone.ilike.%${filters.search}%,id.eq.${filters.search}`);
    }
    
    // Note: Role/Product filtering would need schema expansion. 
    // For now, we return all and filter in memory if needed, or ignore complex filters.

    const { data: dbUsers, error } = await query;

    if (error) {
      console.error("Error fetching users:", error);
      return [];
    }

    return dbUsers.map(u => mapDbUserToAppUser(u));
  },

  async getUserById(id: string): Promise<User | null> {
    const { data: dbUser, error } = await supabaseAdmin
      .from("users")
      .select("*, kaisa_accounts(*), profiles(*)")
      .eq("id", id)
      .single();

    if (error || !dbUser) return null;

    return mapDbUserToAppUser(dbUser);
  },

  async updateUserStatus(
    adminId: string, 
    userId: string, 
    status: AccountStatus
  ): Promise<boolean> {
    // Schema doesn't have status yet.
    // In a real app, we would update the 'status' column.
    // For now, we'll just log it.
    console.log(`[Mock Update] Status for ${userId} -> ${status}`);
    await this.logAction(adminId, userId, "status_change", `Changed status to ${status}`);
    return true;
  },

  async updateKYCStatus(
    adminId: string, 
    userId: string, 
    status: KYCStatus, 
    reason?: string
  ): Promise<boolean> {
     console.log(`[Mock Update] KYC for ${userId} -> ${status}`);
     await this.logAction(adminId, userId, "kyc_decision", `Changed KYC to ${status}`);
     return true;
  },

  async addKYCDocument(userId: string, document: KYCDocument): Promise<boolean> {
    console.log(`[Mock KYC Upload] User ${userId} added ${document.type} document`);
    // In a real app, save to DB
    return true;
  },

  async addNote(adminId: string, userId: string, note: string): Promise<boolean> {
    // Would require a 'notes' table or jsonb column
    console.log(`[Mock Note] ${userId}: ${note}`);
    await this.logAction(adminId, userId, "note_added", note);
    return true;
  },

  async updateTags(adminId: string, userId: string, tags: string[]): Promise<boolean> {
    // Would require 'tags' column
    console.log(`[Mock Tags] ${userId}: ${tags}`);
    await this.logAction(adminId, userId, "tag_update", `Tags updated: ${tags.join(", ")}`);
    return true;
  },

  async updateKaisaStatus(
    adminId: string,
    userId: string,
    status: "active" | "paused"
  ): Promise<boolean> {
    const supabase = await getSupabaseServer();
    const { error } = await supabase
      .from("kaisa_accounts")
      .update({ status })
      .eq("user_id", userId);

    if (error) {
      console.error("Error updating kaisa status:", error);
      return false;
    }
    
    await this.logAction(adminId, userId, "status_change", `Kaisa status: ${status}`);
    return true;
  },

  async logAction(adminId: string, targetUserId: string, action: string, details: string): Promise<void> {
    // Would insert into audit_logs table
    console.log(`[Audit] Admin ${adminId} performed ${action} on ${targetUserId}: ${details}`);
  },

  async getAuditLogs(userId?: string): Promise<AuditLog[]> {
      return [];
  }
};

function mapDbUserToAppUser(dbUser: any): User {
  const kaisaAccount = dbUser.kaisa_accounts?.[0] || dbUser.kaisa_accounts; // Handle array or object
  const isKaisaUser = !!kaisaAccount;
  
  // Map Profile
  // Supabase might return array or single object depending on relationship definition
  const rawProfile = Array.isArray(dbUser.profiles) ? dbUser.profiles[0] : dbUser.profiles;
  const profile = rawProfile ? {
    fullName: rawProfile.full_name || null
  } : null;

  // Map Supabase DB user to App User type
  return {
    identity: {
      id: dbUser.id,
      phone: dbUser.phone,
      email: "", // Not in schema
      createdAt: dbUser.created_at,
    },
    profile,
    status: {
      account: "active", // Default
      kyc: "pending",   // Default
    },
    roles: {
      isKaisaUser: isKaisaUser,
      isSpaceUser: true, // Default enabled (mock for now)
      isNodeParticipant: false,
    },
    metadata: {
      tags: [],
      notes: [],
      lastActivity: dbUser.updated_at || dbUser.created_at,
    },
    products: {
      kaisa: isKaisaUser ? {
        businessType: kaisaAccount.business_type,
        activeModules: ["Frontdesk", "CRM"], // Default modules for now
        role: kaisaAccount.role,
        status: kaisaAccount.status,
      } : undefined,
      space: {
        hostingPlans: [],
        status: "active",
      },
    },
  };
}
