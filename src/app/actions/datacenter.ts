
"use server";

import { dcService } from "@/lib/services/datacenterService";
import { revalidatePath } from "next/cache";
import { DCStatus } from "@/types/datacenter";
import { getSession } from "@/lib/auth/session";

async function getAdminId() {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  // Ideally check role here too, but middleware protects admin routes
  return session.userId;
}

export async function updateDCCapacityAction(dcId: string, newTotal: number) {
  const adminId = await getAdminId();
  const result = await dcService.updateCapacity(adminId, dcId, newTotal);
  if (result.success) {
    revalidatePath(`/admin/datacenters/${dcId}`);
    revalidatePath("/admin/datacenters");
  }
  return result;
}

export async function updateDCStatusAction(dcId: string, status: DCStatus) {
  const adminId = await getAdminId();
  const success = await dcService.updateStatus(adminId, dcId, status);
  if (success) {
    revalidatePath(`/admin/datacenters/${dcId}`);
    revalidatePath("/admin/datacenters");
  }
  return { success };
}

export async function addDCNoteAction(dcId: string, note: string) {
  const adminId = await getAdminId();
  const success = await dcService.addNote(adminId, dcId, note);
  if (success) {
    revalidatePath(`/admin/datacenters/${dcId}`);
  }
  return { success };
}

export async function updateHardwareConfigAction(dcId: string, config: any) {
  const adminId = await getAdminId();
  const result = await dcService.updateHardwareConfig(adminId, dcId, config);
  if (result.success) {
    revalidatePath(`/admin/datacenters`);
    revalidatePath(`/admin/datacenters/${dcId}`);
  }
  return result;
}
