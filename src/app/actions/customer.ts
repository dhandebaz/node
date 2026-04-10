"use server";

import { omniService } from "@/lib/services/omniService";
import { supportService } from "@/lib/services/supportService";
import { OnboardingService } from "@/lib/services/onboardingService";
import { getSession } from "@/lib/auth/session";
import { getSupabaseAdmin, getSupabaseServer } from "@/lib/supabase/server";
import { User } from "@/types/user";
import { DBTenant } from "@/types/database";
import { BusinessType, Tenant } from "@/types";
import { revalidatePath, unstable_cache } from "next/cache";

// Raw function for fetching from DB, to be wrapped in cache
async function fetchCurrentUser(userId: string): Promise<User> {
  // Must use admin client because unstable_cache cannot depend on cookies() via getSupabaseServer()
  // The userId is already verified by the caller (getCurrentUser)
  const supabase = await getSupabaseAdmin();

  // Define types for the joined query result
  type TenantUserResult = {
    tenant_id: string;
    role: string;
    tenants: DBTenant;
  };

  const [
    {
      data: { user: authUser },
      error: authError,
    },
    { data: account },
    { data: tenantUserResult },
    { data: omniAccount },
  ] = await Promise.all([
    supabase.auth.admin.getUserById(userId),
    supabase
      .from("accounts")
      .select("user_id, product_type")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("tenant_users")
      .select(
        `
        tenant_id,
        role,
        tenants (
          id,
          name,
          owner_user_id,
          created_at,
          business_type,
          early_access,
          ai_settings,
          kyc_status,
          pan_number,
          aadhaar_number,
          kyc_verified_at,
          is_memory_enabled,
          is_branding_enabled,
          is_ai_enabled
        )
      `
      )
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("omni_accounts")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (authError || !authUser) {
    throw new Error("User not found in auth system");
  }

  // Safely cast the result to our type (Supabase types can be tricky with joins)
  const tenantUser = tenantUserResult as unknown as TenantUserResult | null;
  const tenantData = tenantUser?.tenants;

  const tenant: Tenant | undefined = tenantData
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
        ai_settings: tenantData.ai_settings
          ? {
              customInstructions:
                tenantData.ai_settings.customInstructions || null,
              tone: tenantData.ai_settings.tone || undefined,
            }
          : undefined,
        pan_number: tenantData.pan_number,
        aadhaar_number: tenantData.aadhaar_number,
        kyc_verified_at: tenantData.kyc_verified_at,
      }
    : undefined;

  const authRole = String(authUser.user_metadata?.role || "customer");
  const isAdmin = authRole === "admin" || authRole === "superadmin";
  const isOmniUser = !!omniAccount || account?.product_type === "ai_employee";

  // Robust Onboarding Check (Consistent with API/Middleware)
  // Passing supabase admin client since we are inside unstable_cache (cookies prohibited)
  const onboardingStatus = await OnboardingService.getStatus(userId, supabase);
  const onboarding = onboardingStatus.isComplete ? "completed" : "pending";

  return {
    identity: {
      id: authUser.id,
      phone: authUser.phone || "",
      email: authUser.email || undefined,
      createdAt: authUser.created_at,
    },
    profile: {
      fullName:
        (authUser.user_metadata?.full_name as string | undefined) || null,
    },
    status: {
      account: "active",
      kyc: "not_started",
      onboarding,
    },
    roles: {
      isOmniUser,
      isAdmin,
    },
    metadata: {
      tags: [],
      notes: [],
      lastActivity: new Date().toISOString(),
    },
    products: isOmniUser
      ? {
          omni: {
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

// Cached wrapper
const getCachedUser = unstable_cache(
  async (userId: string) => fetchCurrentUser(userId),
  ["user-profile"],
  {
    revalidate: 600, // 10 minutes cache
    tags: ["user-profile"],
  }
);

// Helper to get current user or throw
async function getCurrentUser(): Promise<User> {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized: No session");

  return getCachedUser(session.userId);
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
    tenant: user.tenant,
  };
}

// --- Omni Actions ---

export async function getOmniDashboardData() {
  const user = await getCurrentUser();
  if (!user.roles.isOmniUser)
    throw new Error("Access Denied: Not an Omni user");

  const [tasks, activity, credits, config] = await Promise.all([
    omniService.getUserTasks(user.identity.id),
    omniService.getUserActivityLog(user.identity.id),
    omniService.getCreditUsage(user.identity.id),
    omniService.getConfig(),
  ]);

  return {
    identity: user.identity,
    profile: user.products.omni,
    tasks,
    activity,
    credits,
    integrations: config.integrations,
  };
}

export async function toggleOmniModuleAction(
  moduleName: string,
  enabled: boolean,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user.products.omni?.tenantId)
    throw new Error("No active Omni workspace found");

  const supabase = await getSupabaseServer();

  // Fetch current active_modules from DB
  const { data: account, error: fetchError } = await supabase
    .from("omni_accounts")
    .select("active_modules")
    .eq("user_id", user.identity.id)
    .maybeSingle();

  if (fetchError)
    throw new Error("Failed to fetch Omni account: " + fetchError.message);

  const currentModules: string[] = (account?.active_modules as string[]) ?? [];

  let updatedModules: string[];
  if (enabled) {
    updatedModules = currentModules.includes(moduleName)
      ? currentModules
      : [...currentModules, moduleName];
  } else {
    updatedModules = currentModules.filter((m) => m !== moduleName);
  }

  const { error: updateError } = await supabase
    .from("omni_accounts")
    .update({
      active_modules: updatedModules,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.identity.id);

  if (updateError)
    throw new Error("Failed to update module: " + updateError.message);

  revalidatePath("/dashboard/ai/settings");
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
      status: "open",
    });

    // In a real app, this would be part of createTicket or a separate call
  } catch (err) {
    console.error("Create ticket error:", err);
    throw new Error("Failed to create ticket");
  }
}

export async function createTicketAction(
  subject: string,
  product: "ai_employee" | "general",
  message: string,
): Promise<void> {
  const user = await getCurrentUser();

  const ticket = await supportService.createTicket({
    userId: user.identity.id,
    subject,
    product,
    priority: "medium",
    status: "open",
  });

  // Add initial message
  ticket.messages.push({
    id: `MSG-${Date.now()}`,
    sender: "user",
    message,
    timestamp: new Date().toISOString(),
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

  const currentSettings = (tenant?.ai_settings || {}) as Record<string, unknown>;
  
  const normalizedTone = [
    "friendly",
    "professional",
    "concise",
    "humorous",
  ].includes(String(updates.tone || ""))
    ? updates.tone
    : null;

  // Create a clean base without provider keys to avoid any issues
  const newSettings = {
    ...currentSettings,
    customInstructions: updates.customInstructions?.trim() || null,
    tone: normalizedTone,
  };

  // Ensure internal keys are preserved if they existed (optional, but safer)
  // delete (newSettings as any).provider; // etc.


  // 2. Update settings
  const { error } = await supabase
    .from("tenants")
    .update({
      ai_settings: newSettings,
    })
    .eq("id", user.tenant.id);

  if (error) {
    console.error("Failed to update AI settings:", error);
    throw new Error("Failed to save AI configuration");
  }

  revalidatePath("/dashboard/ai/settings");
  return { success: true };
}
