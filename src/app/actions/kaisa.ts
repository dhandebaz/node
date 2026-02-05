
"use server";

import { kaisaService } from "@/lib/services/kaisaService";
import { revalidatePath } from "next/cache";
import { KaisaModuleType, KaisaBusinessType, KaisaRoleType, IntegrationConfigDetails } from "@/types/kaisa";

const ADMIN_ID = "admin-123";

export async function toggleModuleAction(
  moduleType: KaisaModuleType, 
  enabledGlobal: boolean,
  enabledFor?: KaisaBusinessType[]
) {
  const success = await kaisaService.toggleModule(ADMIN_ID, moduleType, enabledGlobal, enabledFor);
  if (success) revalidatePath("/admin/kaisa");
  return { success };
}

export async function updateRoleConfigAction(
  roleType: KaisaRoleType,
  updates: { enabled?: boolean; inviteOnly?: boolean }
) {
  const success = await kaisaService.updateRoleConfig(ADMIN_ID, roleType, updates);
  if (success) revalidatePath("/admin/kaisa");
  return { success };
}

export async function setSystemStatusAction(status: "operational" | "paused") {
  const success = await kaisaService.setSystemStatus(ADMIN_ID, status);
  if (success) revalidatePath("/admin/kaisa");
  return { success };
}

export async function toggleIntegrationAction(name: string, enabled: boolean) {
  const success = await kaisaService.toggleIntegration(ADMIN_ID, name, enabled);
  if (success) revalidatePath("/admin/kaisa");
  return { success };
}

export async function updateIntegrationConfigAction(name: string, config: IntegrationConfigDetails) {
  const success = await kaisaService.updateIntegrationConfig(ADMIN_ID, name, config);
  if (success) revalidatePath("/admin/kaisa");
  return { success };
}

export async function getIntegrationStatsAction(name: string) {
  const stats = await kaisaService.getIntegrationStats(name);
  return { stats };
}

export async function toggleUserKaisaStatusAction(userId: string, status: "active" | "paused") {
  const success = await kaisaService.toggleUserKaisaStatus(ADMIN_ID, userId, status);
  if (success) {
    revalidatePath("/admin/kaisa");
    revalidatePath(`/admin/users/${userId}`);
  }
  return { success };
}
