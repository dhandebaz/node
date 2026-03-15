"use server";

import { settingsService } from "@/lib/services/settingsService";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import {
  AuthSettings,
  IntegrationConfig,
  PlatformSettings,
  NotificationSettings,
  SecuritySettings,
  ApiSettings,
} from "@/types/settings";

/**
 * Resolves the current admin's user ID from the session.
 * Throws if the user is not authenticated or not an admin/superadmin.
 */
async function getAdminId(): Promise<string> {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized: No active session");
  }
  const role = String(session.role || "");
  if (role !== "admin" && role !== "superadmin") {
    throw new Error("Forbidden: Admin role required");
  }
  return session.userId;
}

async function getSuperAdminId(): Promise<string> {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized: No active session");
  }
  if (String(session.role || "") !== "superadmin") {
    throw new Error("Forbidden: Superadmin role required");
  }
  return session.userId;
}

// ─── Getters ──────────────────────────────────────────────────────────────────

export async function getAppSettingsAction() {
  return await settingsService.getSettings();
}

export async function getSettingsAuditLogsAction() {
  return await settingsService.getAuditLogs();
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function updateAuthSettingsAction(
  updates: Partial<AuthSettings>,
): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.updateAuthSettings(adminId, updates);
  revalidatePath("/admin/settings");
}

// ─── Integrations ─────────────────────────────────────────────────────────────

export async function toggleIntegrationAction(
  id: string,
  enabled: boolean,
): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.toggleIntegration(adminId, id, enabled);
  revalidatePath("/admin/settings");
}

export async function updateIntegrationAction(
  id: string,
  updates: Partial<IntegrationConfig>,
): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.updateIntegration(adminId, id, updates);
  revalidatePath("/admin/settings");
}

// ─── API ──────────────────────────────────────────────────────────────────────

export async function updateApiSettingsAction(
  updates: Partial<ApiSettings>,
): Promise<void> {
  const adminId =
    "kaisaProvider" in updates || "kaisaModel" in updates
      ? await getSuperAdminId()
      : await getAdminId();
  await settingsService.updateApi(adminId, updates);
  revalidatePath("/admin/settings");
}

export async function rotateApiKeysAction(): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.rotateApiKeys(adminId);
  revalidatePath("/admin/settings");
}

// ─── Features ─────────────────────────────────────────────────────────────────

export async function toggleFeatureAction(
  id: string,
  enabled: boolean,
): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.toggleFeature(adminId, id, enabled);
  revalidatePath("/admin/settings");
}

// ─── Platform ─────────────────────────────────────────────────────────────────

export async function updatePlatformAction(
  updates: Partial<PlatformSettings>,
): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.updatePlatform(adminId, updates);
  revalidatePath("/admin/settings");
}

export async function updateSignupAction(
  product: keyof PlatformSettings["signupEnabled"],
  enabled: boolean,
): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.updatePlatformSignups(adminId, product, enabled);
  revalidatePath("/admin/settings");
}

// ─── Notifications ────────────────────────────────────────────────────────────

export async function updateNotificationsAction(
  updates: Partial<NotificationSettings>,
): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.updateNotifications(adminId, updates);
  revalidatePath("/admin/settings");
}

// ─── Security ─────────────────────────────────────────────────────────────────

export async function updateSecurityAction(
  updates: Partial<SecuritySettings>,
): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.updateSecurity(adminId, updates);
  revalidatePath("/admin/settings");
}

export async function forceLogoutAllAction(): Promise<void> {
  const adminId = await getAdminId();
  await settingsService.forceLogoutAll(adminId);
  revalidatePath("/admin/settings");
}
