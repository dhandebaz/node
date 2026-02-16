import {
  User,
  UserFilterOptions,
  AuditLog,
  AccountStatus,
  KYCStatus,
  KYCDocument,
  UserMetadata
} from "@/types/user";
import { DBUser, UserMetadataJSON } from "@/types/database";
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

// Service Methods

export const userService = {
  async getUsers(filters?: UserFilterOptions): Promise<User[]> {
    const supabase = await getSupabaseServer();

    // Join with related tables to determine roles and profile
    let query = supabase.from("users")
      .select(`
        *,
        kaisa_accounts (*),
        profiles (*),
        nodes (*),
        listings (*)
      `);

    if (filters?.search) {
      // Simple search on phone or ID
      query = query.or(`phone.ilike.%${filters.search}%,id.eq.${filters.search}`);
    }

    // Apply filters
    if (filters?.accountStatus) {
      query = query.eq('status', filters.accountStatus);
    }

    if (filters?.kycStatus) {
      query = query.eq('kyc_status', filters.kycStatus);
    }

    const { data: dbUsers, error } = await query;

    if (error) {
      log.error("Error fetching users:", error);
      return [];
    }

    // Cast response to DBUser[] - robust against Supabase's varying return types
    return (dbUsers as unknown as DBUser[]).map(u => mapDbUserToAppUser(u));
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      const supabase = await getSupabaseServer();
      const { data: dbUser, error } = await supabase
        .from("users")
        .select(`
          *,
          kaisa_accounts (*),
          profiles (*),
          nodes (*),
          listings (*)
        `)
        .eq("id", id)
        .single();

      if (error || !dbUser) return null;

      return mapDbUserToAppUser(dbUser as unknown as DBUser);
    } catch (e) {
      log.error("Failed to fetch user:", e);
      return null;
    }
  },

  async updateUserStatus(
    adminId: string,
    userId: string,
    status: AccountStatus
  ): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from("users")
      .update({ status })
      .eq("id", userId);

    if (error) {
      log.error(`Error updating status for ${userId}:`, error);
      return false;
    }

    await this.logAction(adminId, userId, "status_change", `Changed status to ${status}`);
    return true;
  },

  async updateKYCStatus(
    adminId: string,
    userId: string,
    status: KYCStatus,
    reason?: string
  ): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    const { error } = await supabase
      .from("users")
      .update({ kyc_status: status })
      .eq("id", userId);

    if (error) {
      log.error(`Error updating KYC status for ${userId}:`, error);
      return false;
    }

    await this.logAction(adminId, userId, "kyc_decision", `Changed KYC to ${status}${reason ? `. Reason: ${reason}` : ''}`);
    return true;
  },

  async addKYCDocument(userId: string, document: KYCDocument): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    // 1. Fetch current metadata
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("metadata")
      .eq("id", userId)
      .single();

    if (fetchError || !user) {
      log.error(`Error fetching user ${userId} for KYC doc:`, fetchError);
      return false;
    }

    // Properly typed metadata handling
    const metadata = (user.metadata as UserMetadataJSON) || {};
    const currentDocs = Array.isArray(metadata.kycDocuments) ? metadata.kycDocuments : [];

    // 2. Append document
    const updatedMetadata = {
      ...metadata,
      kycDocuments: [...currentDocs, document]
    };

    // 3. Update user
    const { error: updateError } = await supabase
      .from("users")
      .update({ metadata: updatedMetadata })
      .eq("id", userId);

    if (updateError) {
      log.error(`Error adding KYC doc for ${userId}:`, updateError);
      return false;
    }

    return true;
  },

  async addNote(adminId: string, userId: string, note: string): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    // 1. Fetch current metadata
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("metadata")
      .eq("id", userId)
      .single();

    if (fetchError || !user) return false;

    const metadata = (user.metadata as UserMetadataJSON) || {};
    const notes = Array.isArray(metadata.notes) ? metadata.notes : [];

    // 2. Append note
    const updatedMetadata = {
      ...metadata,
      notes: [...notes, note]
    };

    // 3. Update
    const { error: updateError } = await supabase
      .from("users")
      .update({ metadata: updatedMetadata })
      .eq("id", userId);

    if (updateError) return false;

    await this.logAction(adminId, userId, "note_added", note);
    return true;
  },

  async updateTags(adminId: string, userId: string, tags: string[]): Promise<boolean> {
    const supabase = await getSupabaseAdmin();

    // 1. Fetch current metadata
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("metadata")
      .eq("id", userId)
      .single();

    if (fetchError || !user) return false;

    const metadata = (user.metadata as UserMetadataJSON) || {};

    // 2. Update tags
    const updatedMetadata = {
      ...metadata,
      tags: tags
    };

    // 3. Update
    const { error: updateError } = await supabase
      .from("users")
      .update({ metadata: updatedMetadata })
      .eq("id", userId);

    if (updateError) return false;

    await this.logAction(adminId, userId, "tag_update", `Tags updated: ${tags.join(", ")}`);
    return true;
  },

  async updateKaisaStatus(
    adminId: string,
    userId: string,
    status: "active" | "paused"
  ): Promise<boolean> {
    const supabase = await getSupabaseAdmin();
    const { error } = await supabase
      .from("kaisa_accounts")
      .update({ status })
      .eq("user_id", userId);

    if (error) {
      log.error("Error updating kaisa status:", error);
      return false;
    }

    await this.logAction(adminId, userId, "status_change", `Kaisa status: ${status}`);
    return true;
  },

  async logAction(adminId: string, targetUserId: string, action: string, details: string): Promise<void> {
    const supabase = await getSupabaseAdmin();
    const { error } = await supabase
      .from("audit_events")
      .insert({
        actor_type: 'admin',
        actor_id: adminId === "SYSTEM" ? null : adminId,
        event_type: action,
        entity_type: 'user',
        entity_id: targetUserId,
        metadata: { details }
      });

    if (error) {
      log.error("Failed to log audit action:", error);
    }
  },

  async getAuditLogs(userId?: string): Promise<AuditLog[]> {
    const supabase = await getSupabaseAdmin();

    let query = supabase
      .from("audit_events")
      .select("*")
      .eq("actor_type", "admin")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("entity_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      log.error("Error fetching audit logs:", error);
      return [];
    }

    return (data || []).map((logItem: any) => ({
      id: logItem.id,
      adminId: logItem.actor_id || "SYSTEM",
      targetUserId: logItem.entity_id,
      actionType: logItem.event_type as any,
      details: logItem.metadata?.details || "",
      timestamp: logItem.created_at
    }));
  }
};

function mapDbUserToAppUser(dbUser: DBUser): User {
  const kaisaAccount = Array.isArray(dbUser.kaisa_accounts)
    ? dbUser.kaisa_accounts[0]
    : dbUser.kaisa_accounts;

  const nodes = Array.isArray(dbUser.nodes) ? dbUser.nodes : (dbUser.nodes ? [dbUser.nodes] : []);
  const listings = Array.isArray(dbUser.listings) ? dbUser.listings : (dbUser.listings ? [dbUser.listings] : []);

  // Determine roles based on existence of related records
  const isKaisaUser = !!kaisaAccount;
  const isSpaceUser = listings.length > 0;
  const isNodeParticipant = nodes.length > 0;

  // Map Profile
  const rawProfile = Array.isArray(dbUser.profiles) ? dbUser.profiles[0] : dbUser.profiles;
  const profile = rawProfile ? {
    fullName: rawProfile.full_name || null
  } : null;

  // Metadata
  const metadata = dbUser.metadata || { tags: [], notes: [], lastActivity: dbUser.created_at };

  // Map Supabase DB user to App User type
  return {
    identity: {
      id: dbUser.id,
      phone: dbUser.phone,
      email: "", // Not in schema currently
      createdAt: dbUser.created_at,
    },
    profile,
    status: {
      account: (dbUser.status as AccountStatus) || "active",
      kyc: (dbUser.kyc_status as KYCStatus) || "not_started",
      onboarding: dbUser.onboarding_status === 'completed' ? 'completed' : 'pending',
      kycDocuments: Array.isArray(metadata.kycDocuments) ? metadata.kycDocuments : []
    },
    roles: {
      isKaisaUser,
      isSpaceUser,
      isNodeParticipant,
    },
    metadata: {
      tags: metadata.tags || [],
      notes: metadata.notes || [],
      lastActivity: metadata.lastActivity || dbUser.updated_at || dbUser.created_at,
    },
    // Tenant: "Tenant" table doesn't exist in DB schema. 
    // We construct a basic tenant context from profile if business_name exists.
    tenant: rawProfile?.business_name ? {
      id: rawProfile.id, // Using profile ID as proxy for tenant ID
      name: rawProfile.business_name,
      ownerUserId: dbUser.id,
      createdAt: rawProfile.created_at || dbUser.created_at,
      businessType: "airbnb_host" // Default
    } : undefined,
    products: {
      kaisa: isKaisaUser && kaisaAccount ? {
        businessType: kaisaAccount.business_type || 'hospitality', // Default
        tenantId: rawProfile?.id,
        activeModules: ["Frontdesk", "CRM"],
        role: 'owner', // Default
        status: (kaisaAccount.status as any) || 'active',
      } : undefined,
      space: {
        hostingPlans: listings.map((l: any) => l.title),
        status: isSpaceUser ? "active" : "inactive",
      },
      node: isNodeParticipant ? {
        nodeUnits: nodes.reduce((acc: number, n: any) => acc + (n.unit_value || 0), 0),
        mouStatus: (nodes[0]?.mou_status as any) || 'draft',
      } : undefined
    },
  };
}
