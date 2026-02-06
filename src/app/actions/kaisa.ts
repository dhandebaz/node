"use server";

import { supabaseAdmin } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

// --- Types ---
export type KaisaBusinessType = "Doctor" | "Homestay" | "Retail" | "Other";
export type KaisaRoleType = "manager" | "co-founder";

// --- Actions ---

export async function createKaisaAccount(businessType: KaisaBusinessType, role: KaisaRoleType) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  try {
    // 1. Create Account
    const { error } = await supabaseAdmin
      .from("kaisa_accounts")
      .insert({
        user_id: session.userId,
        business_type: businessType,
        role: role,
        status: "active"
      });

    if (error) {
      if (error.code === '23505') { // Unique violation
          return { success: false, message: "Account already exists" };
      }
      console.error("Create Kaisa Account Error:", error);
      return { success: false, message: "Failed to create account" };
    }

    // 2. Create Starter Tasks
    const starterTasks = [
      { user_id: session.userId, intent: "Understanding your business context", status: "queued" },
      { user_id: session.userId, intent: "Setting up frontdesk workflow", status: "queued" },
      { user_id: session.userId, intent: "Configuring initial modules", status: "queued" }
    ];

    const { error: taskError } = await supabaseAdmin
      .from("kaisa_tasks")
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

export async function getKaisaAccount() {
  const session = await getSession();
  if (!session?.userId) return null;

  const { data, error } = await supabaseAdmin
    .from("kaisa_accounts")
    .select("*")
    .eq("user_id", session.userId)
    .single();

  if (error) return null;
  return data;
}

export async function getKaisaTasks() {
  const session = await getSession();
  if (!session?.userId) return [];

  const { data, error } = await supabaseAdmin
    .from("kaisa_tasks")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function createKaisaTask(intent: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  const { error } = await supabaseAdmin
    .from("kaisa_tasks")
    .insert({
      user_id: session.userId,
      intent,
      status: "queued"
    });

  if (error) return { success: false, message: "Failed to create task" };
  revalidatePath("/dashboard/kaisa");
  return { success: true };
}

export async function updateKaisaTaskStatus(taskId: string, status: string) {
  const session = await getSession();
  if (!session?.userId) return { success: false, message: "Unauthorized" };

  const updateData: any = { status };
  if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
  }

  const { error } = await supabaseAdmin
    .from("kaisa_tasks")
    .update(updateData)
    .eq("id", taskId)
    .eq("user_id", session.userId); // Security check

  if (error) return { success: false, message: "Failed to update task" };
  revalidatePath("/dashboard/kaisa");
  return { success: true };
}
