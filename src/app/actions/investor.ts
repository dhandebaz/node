
"use server";

import { investorService } from "@/lib/services/investorService";
import { revalidatePath } from "next/cache";

// Mock User ID for Investor
const MOCK_USER_ID = "USR-001"; 

// Profile
export async function getInvestorProfile() {
  return await investorService.getProfile(MOCK_USER_ID);
}

// Dashboard
export async function getInvestorStats() {
  return await investorService.getStats(MOCK_USER_ID);
}

// Nodes
export async function getInvestorNodes() {
  return await investorService.getNodes(MOCK_USER_ID);
}

export async function getInvestorNodeDetail(nodeId: string) {
  return await investorService.getNodeDetail(MOCK_USER_ID, nodeId);
}

// Reports & Docs
export async function getInvestorReports() {
  return await investorService.getReports(MOCK_USER_ID);
}

export async function getInvestorDocuments() {
  return await investorService.getDocuments(MOCK_USER_ID);
}

// Support
export async function getSupportTickets() {
  return await investorService.getTickets(MOCK_USER_ID);
}

export async function createSupportTicketAction(formData: FormData) {
  const category = formData.get("category") as any;
  const subject = formData.get("subject") as string;
  
  await investorService.createTicket(MOCK_USER_ID, { category, subject });
  revalidatePath("/node/dashboard/support");
}
