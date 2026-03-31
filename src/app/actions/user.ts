
"use server";

import { userService } from "@/lib/services/userService";
import { AccountStatus, KYCStatus } from "@/types/user";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";

export async function updateUserStatusAction(userId: string, status: AccountStatus) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized: No active session");
  }
  const success = await userService.updateUserStatus(session.userId, userId, status);
  if (success) {
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
  }
  return { success };
}

export async function updateKYCStatusAction(userId: string, status: KYCStatus, reason?: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized: No active session");
  }
  const success = await userService.updateKYCStatus(session.userId, userId, status, reason);
  if (success) {
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
  }
  return { success };
}

export async function addNoteAction(userId: string, note: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized: No active session");
  }
  const success = await userService.addNote(session.userId, userId, note);
  if (success) {
    revalidatePath(`/admin/users/${userId}`);
  }
  return { success };
}

export async function updateTagsAction(userId: string, tags: string[]) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("Unauthorized: No active session");
  }
  const success = await userService.updateTags(session.userId, userId, tags);
  if (success) {
    revalidatePath(`/admin/users/${userId}`);
    revalidatePath("/admin/users");
  }
  return { success };
}
