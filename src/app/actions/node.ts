
"use server";

import { nodeService } from "@/lib/services/nodeService";
import { revalidatePath } from "next/cache";
import { NodeStatus, MoUStatus } from "@/types/node";

const ADMIN_ID = "admin-123"; // TODO: Get from session

export async function createNodeAction(data: {
  userId: string;
  dcId: string;
  pool: "Standard" | "High Performance" | "Storage Optimized";
}) {
  const result = await nodeService.createNode(ADMIN_ID, data);
  if (result.success) {
    revalidatePath("/admin/nodes");
    revalidatePath(`/admin/datacenters/${data.dcId}`); // Update DC view as well if capacity changed (though creation might not change active count, it uses slots logic)
  }
  return result;
}

export async function updateNodeStatusAction(nodeId: string, status: NodeStatus) {
  const result = await nodeService.updateStatus(ADMIN_ID, nodeId, status);
  if (result.success) {
    revalidatePath(`/admin/nodes/${nodeId}`);
    revalidatePath("/admin/nodes");
    // Also revalidate DC pages as capacity might change
    const node = await nodeService.getById(nodeId);
    if (node) {
        revalidatePath(`/admin/datacenters/${node.infrastructure.dcId}`);
        revalidatePath("/admin/datacenters");
    }
  }
  return result;
}

export async function updateMoUStatusAction(nodeId: string, status: MoUStatus, refId?: string) {
  const result = await nodeService.updateMoUStatus(ADMIN_ID, nodeId, status, refId);
  if (result.success) {
    revalidatePath(`/admin/nodes/${nodeId}`);
    revalidatePath("/admin/nodes");
  }
  return result;
}

export async function addNodeNoteAction(nodeId: string, note: string) {
  const success = await nodeService.addNote(ADMIN_ID, nodeId, note);
  if (success) {
    revalidatePath(`/admin/nodes/${nodeId}`);
  }
  return { success };
}
