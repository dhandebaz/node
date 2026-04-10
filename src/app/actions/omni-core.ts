"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { omniService } from "@/lib/services/omniService";
import { IntegrationConfigDetails, OmniModuleType, OmniBusinessType, OmniRoleType } from "@/types/omni";

// --- Types ---
// KaisaBusinessType and KaisaRoleType are imported from types/kaisa now to avoid duplication/conflicts if they match
// But since they were defined here before, let's keep the exports if other files rely on importing them from here.
// However, good practice is to import from types file.
// Let's check if we need to export them again.
// The file kaisa.ts exported them.
// Let's keep the re-export or definition.

// --- Actions ---

export async function createOmniAccount(businessType: OmniBusinessType, role: OmniRoleType) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  try {
    // 1. Create Account
    const supabase = await getSupabaseServer();
    const { error } = await supabase
      .from("omni_accounts")
      .insert({
        id: session.userId,
        business_type: businessType,
        role: role,
        status: "active"
      } as any);

    if (error) {
      if (error.code === '23505') { // Unique violation
          return { success: false, message: "Account already exists" };
      }
      console.error("Create Omni Account Error:", error);
      return { success: false, message: "Failed to create account" };
    }

    // 2. Create Starter Tasks
    const starterTasks = [
      { user_id: session.userId, intent: "Understanding your business context", status: "queued" },
      { user_id: session.userId, intent: "Setting up frontdesk workflow", status: "queued" },
      { user_id: session.userId, intent: "Configuring initial modules", status: "queued" }
    ];

    const { error: taskError } = await supabase
      .from("omni_tasks")
      .insert(starterTasks);

    if (taskError) {
       console.error("Create Starter Tasks Error:", taskError);
       // We don't fail the whole request if tasks fail, but it's not ideal.
    }

    revalidatePath("/dashboard");
    return { success: true };

  } catch (error) {
    console.error("System Error:", error);
    return { success: false, message: "Internal System Error" };
  }
}

export async function getOmniAccount() {
  const session = await getSession();
  if (!session?.userId) return null;

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("omni_accounts")
    .select("*")
    .eq("user_id", session.userId)
    .single();

  if (error) return null;
  return data;
}

export async function getOmniTasks() {
  const session = await getSession();
  if (!session?.userId) return [];

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase
    .from("omni_tasks")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function createOmniTask(intent: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("omni_tasks")
    .insert({
      user_id: session.userId,
      intent,
      status: "queued"
    });

  if (error) return { success: false, message: "Failed to create task" };
  revalidatePath("/dashboard/ai/tasks");
  return { success: true };
}

export async function updateOmniTaskStatus(taskId: string, status: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  const updateData: any = { status };
  if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase
    .from("omni_tasks")
    .update(updateData)
    .eq("id", taskId)
    .eq("user_id", session.userId); // Security check

  if (error) return { success: false, message: "Failed to update task" };
  revalidatePath("/dashboard/ai/tasks");
  return { success: true };
}

export async function getIntegrationStatsAction(name: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized", stats: null };

  const stats = await omniService.getIntegrationStats(name);
  return { success: true, stats: stats ?? null };
}

export async function setSystemStatusAction(status: "operational" | "paused") {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  await omniService.setSystemStatus(session.userId, status);
  revalidatePath("/admin/dashboard/kaisa");
  return { success: true };
}

export async function toggleIntegrationAction(name: string, enabled: boolean) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  await omniService.toggleIntegration(session.userId, name, enabled);
  revalidatePath("/admin/dashboard/kaisa");
  return { success: true };
}

export async function updateIntegrationConfigAction(name: string, config: IntegrationConfigDetails) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  await omniService.updateIntegrationConfig(session.userId, name, config);
  revalidatePath("/admin/dashboard/kaisa");
  return { success: true };
}

export async function toggleModuleAction(type: OmniModuleType, enabledGlobal: boolean, enabledFor?: OmniBusinessType[]) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  await omniService.toggleModule(session.userId, type, enabledGlobal, enabledFor);
  revalidatePath("/admin/dashboard/omni");
  return { success: true };
}

export async function updateRoleConfigAction(type: OmniRoleType, updates: { enabled?: boolean; inviteOnly?: boolean }) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  await omniService.updateRoleConfig(session.userId, type, updates);
  revalidatePath("/admin/dashboard/omni");
  return { success: true };
}

export async function toggleUserOmniStatusAction(userId: string, status: "active" | "paused") {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  await omniService.toggleUserOmniStatus(session.userId, userId, status);
  revalidatePath("/admin/dashboard/omni");
  return { success: true };
}
