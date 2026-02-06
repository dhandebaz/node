
"use server";

import { investorService } from "@/lib/services/investorService";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";

// Helper to get current user ID
async function getUserId() {
  const session = await getSession();
  if (!session?.userId) throw new Error("Unauthorized");
  return session.userId;
}

// Profile
export async function getInvestorProfile() {
  const userId = await getUserId();
  return await investorService.getProfile(userId);
}

// Dashboard
export async function getInvestorStats() {
  const userId = await getUserId();
  return await investorService.getStats(userId);
}

// Nodes
export async function getInvestorNodes() {
  const userId = await getUserId();
  return await investorService.getNodes(userId);
}

export async function getInvestorNodeDetail(nodeId: string) {
  const userId = await getUserId();
  return await investorService.getNodeDetail(userId, nodeId);
}

// Reports & Docs
export async function getInvestorReports() {
  const userId = await getUserId();
  return await investorService.getReports(userId);
}

export async function getInvestorDocuments() {
  const userId = await getUserId();
  return await investorService.getDocuments(userId);
}

export async function getInvestorDocument(docId: string) {
  const userId = await getUserId();
  return await investorService.getDocument(userId, docId);
}

// Support
export async function getSupportTickets() {
  const userId = await getUserId();
  return await investorService.getTickets(userId);
}

export async function createSupportTicketAction(formData: FormData) {
  try {
    const userId = await getUserId();
    const category = formData.get("category") as any;
    const subject = formData.get("subject") as string;
    
    await investorService.createTicket(userId, { category, subject });
    revalidatePath("/node/dashboard/support");
    return { success: true };
  } catch (error) {
    console.error("Create ticket error:", error);
    return { success: false, error: "Failed to create ticket" };
  }
}
