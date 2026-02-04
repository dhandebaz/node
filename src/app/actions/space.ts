
"use server";

import { spaceService } from "@/lib/services/spaceService";
import { SpaceResourceLimits, SpaceServiceProfile } from "@/types/space";
import { revalidatePath } from "next/cache";

const ADMIN_ID = "ADMIN-001"; // Mock Admin ID

export async function togglePlanAction(planName: string, enabled: boolean) {
  const success = await spaceService.togglePlan(ADMIN_ID, planName, enabled);
  if (success) revalidatePath("/admin/space");
  return { success };
}

export async function togglePlanInviteOnlyAction(planName: string, inviteOnly: boolean) {
  const success = await spaceService.togglePlanInviteOnly(ADMIN_ID, planName, inviteOnly);
  if (success) revalidatePath("/admin/space");
  return { success };
}

export async function updateServiceStatusAction(serviceId: string, status: SpaceServiceProfile["status"], reason?: string) {
  const success = await spaceService.updateServiceStatus(ADMIN_ID, serviceId, status, reason);
  if (success) {
    revalidatePath("/admin/space");
    // We don't know the userId here easily without fetching, but revalidating the specific user page is hard
    // Typically we'd return the userId to revalidate, but for now we rely on the client or global revalidation
    // actually, let's just fetch the service to find the userId?
    // Optimization: The service layer could return the updated service or userId.
    // For now, simple revalidation of the admin space dashboard is key.
    // Also revalidate the user path if we knew it. 
    // Since we don't have it handy, we'll assume the user is viewing the list or their profile which will refetch on nav.
    // If we are ON the user profile, we can call revalidatePath(currentUrl).
  }
  return { success };
}

export async function updateResourceLimitsAction(serviceId: string, limits: Partial<SpaceResourceLimits>) {
  const success = await spaceService.updateResourceLimits(ADMIN_ID, serviceId, limits);
  if (success) revalidatePath("/admin/space");
  return { success };
}

export async function getSpaceStatsAction() {
  return await spaceService.getStats();
}

export async function getSpaceConfigAction() {
  return await spaceService.getConfig();
}

export async function getSpaceAuditLogsAction() {
  return await spaceService.getAuditLogs();
}

export async function getAllSpaceServicesAction() {
  return await spaceService.getAllServices();
}

export async function getUserSpaceServicesAction(userId: string) {
  return await spaceService.getUserServices(userId);
}
