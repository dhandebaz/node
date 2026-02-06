
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
export async function updateAuthSettingsAction(updates: Partial<AuthSettings>): Promise<void> {
  await settingsService.updateAuthSettings(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
}

// Integrations
export async function toggleIntegrationAction(id: string, enabled: boolean): Promise<void> {
  await settingsService.toggleIntegration(ADMIN_ID, id, enabled);
  revalidatePath("/admin/settings");
}

export async function updateIntegrationAction(id: string, updates: Partial<IntegrationConfig>): Promise<void> {
  await settingsService.updateIntegration(ADMIN_ID, id, updates);
  revalidatePath("/admin/settings");
}

// API
export async function updateApiSettingsAction(updates: Partial<ApiSettings>): Promise<void> {
  await settingsService.updateApi(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
}

export async function rotateApiKeysAction(): Promise<void> {
  await settingsService.rotateApiKeys(ADMIN_ID);
  revalidatePath("/admin/settings");
}

// Features
export async function toggleFeatureAction(id: string, enabled: boolean): Promise<void> {
  await settingsService.toggleFeature(ADMIN_ID, id, enabled);
  revalidatePath("/admin/settings");
}

// Platform
export async function updatePlatformAction(updates: Partial<PlatformSettings>): Promise<void> {
  await settingsService.updatePlatform(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
}

export async function updateSignupAction(product: keyof PlatformSettings["signupEnabled"], enabled: boolean): Promise<void> {
  await settingsService.updatePlatformSignups(ADMIN_ID, product, enabled);
  revalidatePath("/admin/settings");
}

// Notifications
export async function updateNotificationsAction(updates: Partial<NotificationSettings>): Promise<void> {
  await settingsService.updateNotifications(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
}

// Security
export async function updateSecurityAction(updates: Partial<SecuritySettings>): Promise<void> {
  await settingsService.updateSecurity(ADMIN_ID, updates);
  revalidatePath("/admin/settings");
}

export async function forceLogoutAllAction(): Promise<void> {
  await settingsService.forceLogoutAll(ADMIN_ID);
  revalidatePath("/admin/settings");
}
