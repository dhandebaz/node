
"use server";

import { userService } from "@/lib/services/userService";
import { AccountStatus, KYCStatus } from "@/types/user";
import { revalidatePath } from "next/cache";

// In a real app, we would get the adminId from the session
const ADMIN_ID = "admin-session-id"; 

export async function updateUserStatusAction(userId: string, status: AccountStatus) {
  const success = await userService.updateUserStatus(ADMIN_ID, userId, status);
  if (success) {
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
  }
  return { success };
}

export async function updateKYCStatusAction(userId: string, status: KYCStatus, reason?: string) {
  const success = await userService.updateKYCStatus(ADMIN_ID, userId, status, reason);
  if (success) {
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
  }
  return { success };
}

export async function addNoteAction(userId: string, note: string) {
  const success = await userService.addNote(ADMIN_ID, userId, note);
  if (success) {
    revalidatePath(`/admin/users/${userId}`);
  }
  return { success };
}

export async function updateTagsAction(userId: string, tags: string[]) {
  const success = await userService.updateTags(ADMIN_ID, userId, tags);
  if (success) {
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
  }
  return { success };
}
