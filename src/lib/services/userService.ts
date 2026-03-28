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
import { type Json } from "@/types/supabase";
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

  async getUserById(userId: string): Promise<User | null> {
    const supabase = await getSupabaseAdmin();
    
    // 1. Fetch core user data
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) return null;

    // 2. Fetch Account & Tenant Info (New Schema)
    const [
      { data: account },
      { data: kaisaAccount },
      { data: tenantUser }
    ] = await Promise.all([
      supabase.from("accounts").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("kaisa_accounts").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("tenant_users").select("*, tenants(*)").eq("user_id", userId).maybeSingle()
    ]);

    const tenant = tenantUser?.tenants;

    // Construct User object matching the new schema
    return {
      identity: {
        id: user.id,
        phone: user.phone || "",
        email: user.email || undefined,
        createdAt: user.created_at || "",
      },
      profile: null,
      status: {
        account: (account?.status as AccountStatus) || "active",
        kyc: (tenant?.kyc_status as KYCStatus) || "not_started",
        onboarding: account?.onboarding_status === 'complete' ? 'completed' : 'pending',
      },
      roles: {
        isKaisaUser: !!kaisaAccount || account?.product_type === 'ai_employee',
        isAdmin: user.role === 'admin' || user.role === 'superadmin',
      },
      products: {
        kaisa: kaisaAccount ? {
          businessType: tenant?.business_type || "",
          status: (kaisaAccount.status as "active" | "paused") || "active",
          activeModules: [], // Load if needed
          role: "owner",
          tenantId: kaisaAccount.tenant_id || undefined
        } : undefined,
      },
      metadata: {
        tags: [],
        notes: [],
        lastActivity: user.updated_at || user.created_at || ""
      },
      tenant: tenant ? {
        id: tenant.id,
        name: tenant.name,
        ownerUserId: tenant.owner_user_id || "",
        businessType: (tenant.business_type as import("@/types/index").BusinessType) || null,
        earlyAccess: tenant.early_access || false,
        kyc_status: (tenant.kyc_status as import("@/types/index").Tenant["kyc_status"]) || "not_started",
        createdAt: tenant.created_at || user.created_at || ""
      } : undefined
    };
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
      .update({ metadata: updatedMetadata as unknown as Json })
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
      .update({ metadata: updatedMetadata as unknown as Json })
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
      .update({ metadata: updatedMetadata as unknown as Json })
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

    return (data || []).map((logItem: Record<string, unknown>) => ({
      id: logItem.id as string,
      adminId: (logItem.actor_id as string) || "SYSTEM",
      targetUserId: logItem.entity_id as string,
      actionType: logItem.event_type as "status_change" | "kyc_decision" | "tag_update" | "note_added",
      details: (logItem.metadata as { details?: string })?.details || "",
      timestamp: logItem.created_at as string
    }));
  }
};

function mapDbUserToAppUser(dbUser: DBUser): User {
  const kaisaAccount = Array.isArray(dbUser.kaisa_accounts)
    ? dbUser.kaisa_accounts[0]
    : dbUser.kaisa_accounts;

  // Determine roles based on existence of related records
  const isKaisaUser = !!kaisaAccount;

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
      onboarding: dbUser.onboarding_status === 'complete' ? 'completed' : 'pending',
      kycDocuments: Array.isArray(metadata.kycDocuments) 
        ? metadata.kycDocuments.map(doc => ({
            type: (doc.type === "AADHAAR" ? "AADHAAR" : "PAN"),
            fileUrl: doc.url || "",
            verified: doc.status === "verified",
            verifiedAt: doc.status === "verified" ? doc.uploadedAt : undefined
          }))
        : []
    },
    roles: {
      isKaisaUser,
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
      kaisa: isKaisaUser && kaisaAccount ? (() => {
        const ka = kaisaAccount as unknown as Record<string, unknown>;
        const du = dbUser as unknown as Record<string, unknown>;
        return {
          businessType: (ka.business_type as string) || 'hospitality', // Default
          tenantId: (du.tenant_id as string) || rawProfile?.id,
          activeModules: (ka.active_modules as string[]) || [],
          role: (ka.role as "owner" | "manager" | "co-founder") || 'owner', // Default
          status: (ka.status as "active" | "paused") || 'active',
        };
      })() : undefined,
    },
  };
}
