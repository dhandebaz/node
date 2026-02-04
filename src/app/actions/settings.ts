
"use server";

import { settingsService } from "@/lib/services/settingsService";
import { revalidatePath } from "next/cache";
import { 
  AuthSettings, 
  IntegrationConfig, 
  PlatformSettings, 
  NotificationSettings, 
  SecuritySettings,
  ApiSettings
} from "@/types/settings";

const ADMIN_ID = "SUPERADMIN-01"; // Mock ID

// Getters
export async function getAppSettingsAction() {
  return await settingsService.getSettings();
}

export async function getSettingsAuditLogsAction() {
  return await settingsService.getAuditLogs();
}

// Auth
export async function updateAuthSettingsAction(updates: Partial<AuthSettings>) {
  await settingsService.updateAuthSettings(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
  return { success: true };
}

// Integrations
export async function toggleIntegrationAction(id: string, enabled: boolean) {
  await settingsService.toggleIntegration(ADMIN_ID, id, enabled);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateIntegrationAction(id: string, updates: Partial<IntegrationConfig>) {
  await settingsService.updateIntegration(ADMIN_ID, id, updates);
  revalidatePath("/admin/settings");
  return { success: true };
}

// API
export async function updateApiSettingsAction(updates: Partial<ApiSettings>) {
  await settingsService.updateApi(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function rotateApiKeysAction() {
  await settingsService.rotateApiKeys(ADMIN_ID);
  revalidatePath("/admin/settings");
  return { success: true };
}

// Features
export async function toggleFeatureAction(id: string, enabled: boolean) {
  await settingsService.toggleFeature(ADMIN_ID, id, enabled);
  revalidatePath("/admin/settings");
  return { success: true };
}

// Platform
export async function updatePlatformAction(updates: Partial<PlatformSettings>) {
  await settingsService.updatePlatform(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function updateSignupAction(product: keyof PlatformSettings["signupEnabled"], enabled: boolean) {
  await settingsService.updatePlatformSignups(ADMIN_ID, product, enabled);
  revalidatePath("/admin/settings");
  return { success: true };
}

// Notifications
export async function updateNotificationsAction(updates: Partial<NotificationSettings>) {
  await settingsService.updateNotifications(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
  return { success: true };
}

// Security
export async function updateSecurityAction(updates: Partial<SecuritySettings>) {
  await settingsService.updateSecurity(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function forceLogoutAllAction() {
  await settingsService.forceLogoutAll(ADMIN_ID);
  revalidatePath("/admin/settings");
  return { success: true };
}
