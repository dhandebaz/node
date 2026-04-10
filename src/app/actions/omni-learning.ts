
"use server";

import { omniMemoryService } from "@/lib/services/omniMemoryService";
import { userService } from "@/lib/services/userService";
import { getSession } from "@/lib/auth/session";
import { OmniMemory } from "@/types/omni-learning";
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
    omniMemoryService.getMemories(userId),
    omniMemoryService.getStats(userId)
  ]);
  return { memories, stats };
}

export async function addExplicitFeedbackAction(formData: FormData): Promise<void> {
  try {
    const userId = await getAuthenticatedUserId();
    const description = formData.get("description") as string;
    const type = formData.get("type") as OmniMemory["type"];
    const moduleId = formData.get("moduleId") as string;

    if (!description || !type) {
      throw new Error("Missing required fields");
    }

    await omniMemoryService.addMemory({
      userId,
      type,
      source: "explicit",
      description,
      confidence: 1.0,
      moduleId: moduleId || undefined
    });

    revalidatePath("/dashboard/ai/learning");
  } catch (error) {
    console.error("Add feedback error:", error);
    throw new Error("Failed to add instruction");
  }
}

export async function deleteMemoryAction(memoryId: string): Promise<void> {
  try {
    await getAuthenticatedUserId(); // Ensure auth
    await omniMemoryService.deleteMemory(memoryId);
    revalidatePath("/dashboard/ai/learning");
  } catch (error) {
    console.error("Delete memory error:", error);
    throw new Error("Failed to delete memory");
  }
}

export async function confirmInferenceAction(memoryId: string): Promise<void> {
  try {
    await getAuthenticatedUserId(); // Ensure auth
    await omniMemoryService.updateStatus(memoryId, "active");
    revalidatePath("/dashboard/ai/learning");
  } catch (error) {
    console.error("Confirm inference error:", error);
    throw new Error("Failed to confirm memory");
  }
}

export async function rejectInferenceAction(memoryId: string): Promise<void> {
  try {
    await getAuthenticatedUserId(); // Ensure auth
    await omniMemoryService.deleteMemory(memoryId); // Rejecting basically deletes the proposed memory
    revalidatePath("/dashboard/ai/learning");
  } catch (error) {
    console.error("Reject inference error:", error);
    throw new Error("Failed to reject memory");
  }
}

export async function resetLearningAction(): Promise<void> {
  try {
    const userId = await getAuthenticatedUserId();
    await omniMemoryService.resetLearning(userId);
    revalidatePath("/dashboard/ai/learning");
  } catch (error) {
    console.error("Reset learning error:", error);
    throw new Error("Failed to reset learning");
  }
}
