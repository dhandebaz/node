
"use server";

import { nodeService } from "@/lib/services/nodeService";
import { revalidatePath } from "next/cache";
import { NodeStatus, MoUStatus } from "@/types/node";
import { getSession } from "@/lib/auth/session";

async function getAdminId() {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  return session.userId;
}

export async function createNodeAction(data: {
  userId: string;
  dcId: string;
  pool: "Standard" | "High Performance" | "Storage Optimized";
}) {
  const adminId = await getAdminId();
  const result = await nodeService.createNode(adminId, data);
  if (result.success) {
    revalidatePath("/admin/nodes");
    revalidatePath(`/admin/datacenters/${data.dcId}`);
  }
  return result;
}

export async function updateNodeStatusAction(nodeId: string, status: NodeStatus) {
  const adminId = await getAdminId();
  const result = await nodeService.updateStatus(adminId, nodeId, status);
  if (result.success) {
    revalidatePath(`/admin/nodes/${nodeId}`);
    revalidatePath("/admin/nodes");
    const node = await nodeService.getById(nodeId);
    if (node) {
        revalidatePath(`/admin/datacenters/${node.infrastructure.dcId}`);
        revalidatePath("/admin/datacenters");
    }
  }
  return result;
}

export async function updateMoUStatusAction(nodeId: string, status: MoUStatus, refId?: string) {
  const adminId = await getAdminId();
  const result = await nodeService.updateMoUStatus(adminId, nodeId, status);
  if (result.success) {
    revalidatePath(`/admin/nodes/${nodeId}`);
  }
  return result;
}

export async function addNodeNoteAction(nodeId: string, note: string) {
  const adminId = await getAdminId();
  const result = await nodeService.addNodeNote(adminId, nodeId, note);
  if (result.success) {
    revalidatePath(`/admin/nodes/${nodeId}`);
  }
  return result;
}
