'use server';

import { MemoryService, MemoryType } from "@/lib/services/memoryService";
import { requireActiveTenant } from "@/lib/auth/tenant";
import { revalidatePath } from "next/cache";

export async function toggleMemoryAction(enabled: boolean) {
  const tenantId = await requireActiveTenant();
  await MemoryService.toggleMemory(tenantId, enabled);
  revalidatePath('/dashboard/ai/settings');
}

export async function getMemoriesAction(listingId?: string, type?: MemoryType) {
  const tenantId = await requireActiveTenant();
  return await MemoryService.getMemories(tenantId, { listingId, type, skipCost: true });
}

export async function addMemoryAction(type: MemoryType, summary: string, listingId?: string) {
  const tenantId = await requireActiveTenant();
  await MemoryService.addMemory(tenantId, {
    type,
    summary,
    listingId,
    confidence: 1.0, // Manual entries are high confidence
    metadata: { source: 'user_manual' }
  });
  revalidatePath('/dashboard/ai/settings');
}

export async function deleteMemoryAction(memoryId: string) {
  const tenantId = await requireActiveTenant();
  await MemoryService.deleteMemory(tenantId, memoryId);
  revalidatePath('/dashboard/ai/settings');
}
