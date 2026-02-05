
"use server";

import { dcService } from "@/lib/services/datacenterService";
import { revalidatePath } from "next/cache";
import { DCStatus } from "@/types/datacenter";

const ADMIN_ID = "admin-123"; // TODO: Get from session

export async function updateDCCapacityAction(dcId: string, newTotal: number) {
  const result = await dcService.updateCapacity(ADMIN_ID, dcId, newTotal);
  if (result.success) {
    revalidatePath(`/admin/datacenters/${dcId}`);
    revalidatePath("/admin/datacenters");
  }
  return result;
}

export async function updateDCStatusAction(dcId: string, status: DCStatus) {
  const success = await dcService.updateStatus(ADMIN_ID, dcId, status);
  if (success) {
    revalidatePath(`/admin/datacenters/${dcId}`);
    revalidatePath("/admin/datacenters");
  }
  return { success };
}

export async function addDCNoteAction(dcId: string, note: string) {
  const success = await dcService.addNote(ADMIN_ID, dcId, note);
  if (success) {
    revalidatePath(`/admin/datacenters/${dcId}`);
  }
  return { success };
}

export async function updateHardwareConfigAction(dcId: string, config: any) {
  const result = await dcService.updateHardwareConfig(ADMIN_ID, dcId, config);
  if (result.success) {
    revalidatePath(`/admin/datacenters`);
    revalidatePath(`/admin/datacenters/${dcId}`);
  }
  return result;
}
