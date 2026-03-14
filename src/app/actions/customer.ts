"use server";

import { userService } from "@/lib/services/userService";
import { kaisaService } from "@/lib/services/kaisaService";
import { supportService } from "@/lib/services/supportService";
import { OnboardingService } from "@/lib/services/onboardingService";
import { getSession } from "@/lib/auth/session";
import { getSupabaseServer } from "@/lib/supabase/server";
import { User } from "@/types/user";
import { DBTenant } from "@/types/database";
import { BusinessType } from "@/types";
import { revalidatePath } from "next/cache";

// Helper to get current user or throw
async function getCurrentUser(): Promise<User> {
  const session = await getSession();
  
  if (!session?.userId) throw new Error("Unauthorized: No session");
  
  const user = await userService.getUserById(session.userId);
  if (user) return user;

  const supabase = await getSupabaseServer();
  const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
  if (authError || !authUser) {
    throw new Error("Unauthorized: User not found");
  }

  // Define types for the joined query result
  type TenantUserResult = {
    tenant_id: string;
    role: string;
    tenants: DBTenant;
  };

  const [{ data: account }, { data: tenantUserResult }, { data: kaisaAccount }] = await Promise.all([
    supabase.from("accounts").select("*").eq("user_id", authUser.id).maybeSingle(),
    supabase
      .from("tenant_users")
      .select(`
        tenant_id, 
        role, 
        tenants (
          id, 
          name, 
          owner_user_id, 
          created_at, 
          business_type, 
          early_access, 
          kyc_status, 
          pan_number, 
          aadhaar_number, 
          kyc_verified_at
        )
      `)
      .eq("user_id", authUser.id)
      .maybeSingle(),
    supabase.from("kaisa_accounts").select("*").eq("user_id", authUser.id).maybeSingle(),
  ]);

  // Safely cast the result to our type (Supabase types can be tricky with joins)
  const tenantUser = tenantUserResult as unknown as TenantUserResult | null;
  const tenantData = tenantUser?.tenants;

  const tenant = tenantData
    ? {
        id: tenantData.id,
        name: tenantData.name,
        ownerUserId: tenantData.owner_user_id,
        createdAt: tenantData.created_at,
        businessType: tenantData.business_type as BusinessType | undefined,
        earlyAccess: tenantData.early_access,
        is_memory_enabled: tenantData.is_memory_enabled,
        is_branding_enabled: tenantData.is_branding_enabled,
        is_ai_enabled: tenantData.is_ai_enabled,
        kyc_status: tenantData.kyc_status,
        pan_number: tenantData.pan_number,
        aadhaar_number: tenantData.aadhaar_number,
        kyc_verified_at: tenantData.kyc_verified_at,
      }
    : undefined;

  const authRole = String(authUser.user_metadata?.role || "customer");
  const isAdmin = authRole === "admin" || authRole === "superadmin";
  const isKaisaUser = !!kaisaAccount || account?.product_type === "ai_employee";
  
  // Robust Onboarding Check (Consistent with API/Middleware)
  const onboardingStatus = await OnboardingService.getStatus(authUser.id);
  const onboarding = onboardingStatus.isComplete ? "completed" : "pending";

  return {
    identity: {
      id: authUser.id,
      phone: authUser.phone || "",
      email: authUser.email || undefined,
      createdAt: authUser.created_at,
    },
    profile: {
      fullName: (authUser.user_metadata?.full_name as string | undefined) || null,
    },
    status: {
      account: "active",
      kyc: "not_started",
      onboarding,
    },
    roles: {
      isKaisaUser,
      isAdmin,
    },
    metadata: {
      tags: [],
      notes: [],
      lastActivity: new Date().toISOString(),
    },
    products: isKaisaUser
      ? {
          kaisa: {
            businessType:
              (onboardingStatus.businessType as string | null) ||
              (tenant?.businessType as string | undefined) ||
              "",
            tenantId: tenant?.id,
            activeModules: [],
            role: "manager",
            status: "active",
          },
        }
      : {},
    tenant,
  };
}

export async function getCustomerProfile() {
  const user = await getCurrentUser();
  return {
    identity: user.identity,
    profile: user.profile, // Ensure profile is included
    status: user.status,
    roles: user.roles,
    products: user.products,
    metadata: user.metadata,
    tenant: user.tenant
  };
}

// --- Kaisa Actions ---

export async function getKaisaDashboardData() {
  const user = await getCurrentUser();
  if (!user.roles.isKaisaUser) throw new Error("Access Denied: Not a Kaisa user");

  const [tasks, activity, credits, config] = await Promise.all([
    kaisaService.getUserTasks(user.identity.id),
    kaisaService.getUserActivityLog(user.identity.id),
    kaisaService.getCreditUsage(user.identity.id),
    kaisaService.getConfig()
  ]);

  return {
    identity: user.identity,
    profile: user.products.kaisa,
    tasks,
    activity,
    credits,
    integrations: config.integrations
  };
}

export async function toggleKaisaModuleAction(moduleName: string, enabled: boolean): Promise<void> {
    const user = await getCurrentUser();
    // In a real app, validate if module is allowed for business type
    // Mock update:
    if (enabled) {
        if (!user.products.kaisa?.activeModules.includes(moduleName)) {
            user.products.kaisa?.activeModules.push(moduleName);
        }
    } else {
        user.products.kaisa!.activeModules = user.products.kaisa!.activeModules.filter(m => m !== moduleName);
    }
}

// --- Support Actions ---

export async function getCustomerTickets() {
  const user = await getCurrentUser();
  return await supportService.getUserTickets(user.identity.id);
}

export async function createCustomerTicket(formData: FormData): Promise<void> {
    try {
        const user = await getCurrentUser();
        const subject = formData.get("subject") as string;
        const product = formData.get("product") as "ai_employee" | "general";
        const message = formData.get("message") as string;
        const priority = formData.get("priority") as "low" | "medium" | "high";

        if (!subject || !product || !message) {
            throw new Error("Missing required fields");
        }

        await supportService.createTicket({
            userId: user.identity.id,
            subject,
            product,
            priority: priority || "medium",
            status: "open"
        });

        // Add initial message
        // In a real app, this would be part of createTicket or a separate call
    } catch (error) {
        console.error("Create ticket error:", error);
        throw new Error("Failed to create ticket");
    }
}

export async function createTicketAction(subject: string, product: "ai_employee" | "general", message: string): Promise<void> {
  const user = await getCurrentUser();
  
  const ticket = await supportService.createTicket({
    userId: user.identity.id,
    subject,
    product,
    priority: "medium",
    status: "open"
  });

  // Add initial message
  ticket.messages.push({
    id: `MSG-${Date.now()}`,
    sender: "user",
    message,
    timestamp: new Date().toISOString()
  });
}

// --- Settings Actions ---

export async function updateTenantProfileAction(updates: {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
}) {
  const user = await getCurrentUser();
  if (!user.tenant?.id) throw new Error("No active workspace found");

  const supabase = await getSupabaseServer();
  
  const { error } = await supabase
    .from("tenants")
    .update({
      name: updates.name,
      address: updates.address,
      phone: updates.phone,
      // website: updates.website, // If column exists, add it. For now, following schema from migrations
    })
    .eq("id", user.tenant.id);

  if (error) {
    console.error("Failed to update tenant profile:", error);
    throw new Error("Failed to save changes");
  }

  revalidatePath("/dashboard/ai/settings");
  return { success: true };
}

export async function updateAiSettingsAction(updates: {
  provider?: string;
  model?: string;
  apiKey?: string;
  customInstructions?: string;
  tone?: string;
}) {
  const user = await getCurrentUser();
  if (!user.tenant?.id) throw new Error("No active workspace found");

  const supabase = await getSupabaseServer();
  
  // 1. Get current settings
  const { data: tenant } = await supabase
    .from("tenants")
    .select("ai_settings")
    .eq("id", user.tenant.id)
    .single();

  const currentSettings = tenant?.ai_settings || {};
  const newSettings = {
    ...currentSettings,
    ...updates
  };

  // 2. Update settings
  const { error } = await supabase
    .from("tenants")
    .update({
      ai_settings: newSettings
    })
    .eq("id", user.tenant.id);

  if (error) {
    console.error("Failed to update AI settings:", error);
    throw new Error("Failed to save AI configuration");
  }

  revalidatePath("/dashboard/ai/settings");
  return { success: true };
}
