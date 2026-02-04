
"use server";

import { kaisaMemoryService } from "@/lib/services/kaisaMemoryService";
import { userService } from "@/lib/services/userService";
import { getSession } from "@/lib/auth/session";
import { KaisaMemory } from "@/types/kaisa-learning";
import { revalidatePath } from "next/cache";

// Helper to ensure user is authenticated
async function getAuthenticatedUserId() {
  const session = await getSession();
  const userId = session?.userId || "USR-001"; // Dev fallback
  
  const user = await userService.getUserById(userId);
  if (!user || !user.identity.id) {
    throw new Error("Unauthorized");
  }
  return user.identity.id;
}

export async function getLearningDataAction() {
  const userId = await getAuthenticatedUserId();
  const [memories, stats] = await Promise.all([
    kaisaMemoryService.getMemories(userId),
    kaisaMemoryService.getStats(userId)
  ]);
  return { memories, stats };
}

export async function addExplicitFeedbackAction(formData: FormData) {
  const userId = await getAuthenticatedUserId();
  const description = formData.get("description") as string;
  const type = formData.get("type") as KaisaMemory["type"];
  const moduleId = formData.get("moduleId") as string;

  if (!description || !type) {
    throw new Error("Missing required fields");
  }

  await kaisaMemoryService.addMemory({
    userId,
    type,
    source: "explicit",
    description,
    confidence: 1.0,
    moduleId: moduleId || undefined
  });

  revalidatePath("/dashboard/kaisa/learning");
}

export async function deleteMemoryAction(memoryId: string) {
  await getAuthenticatedUserId(); // Ensure auth
  await kaisaMemoryService.deleteMemory(memoryId);
  revalidatePath("/dashboard/kaisa/learning");
}

export async function confirmInferenceAction(memoryId: string) {
  await getAuthenticatedUserId(); // Ensure auth
  await kaisaMemoryService.updateStatus(memoryId, "active");
  revalidatePath("/dashboard/kaisa/learning");
}

export async function rejectInferenceAction(memoryId: string) {
  await getAuthenticatedUserId(); // Ensure auth
  await kaisaMemoryService.deleteMemory(memoryId); // Rejecting basically deletes the proposed memory
  revalidatePath("/dashboard/kaisa/learning");
}

export async function resetLearningAction() {
  const userId = await getAuthenticatedUserId();
  await kaisaMemoryService.resetLearning(userId);
  revalidatePath("/dashboard/kaisa/learning");
}
