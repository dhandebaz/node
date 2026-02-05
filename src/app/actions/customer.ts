
"use server";

import { userService } from "@/lib/services/userService";
import { kaisaService } from "@/lib/services/kaisaService";
import { spaceService } from "@/lib/services/spaceService";
import { supportService } from "@/lib/services/supportService";
import { getSession } from "@/lib/auth/session";
import { User } from "@/types/user";

// Helper to get current user or throw
async function getCurrentUser(): Promise<User> {
  const session = await getSession();
  
  // For Development: If no session, default to USR-001 (The complex user)
  const userId = session?.userId || "USR-001";
  
  const user = await userService.getUserById(userId);
  if (!user) throw new Error("User not found");
  return user;
}

export async function getCustomerProfile() {
  const user = await getCurrentUser();
  return {
    identity: user.identity,
    roles: user.roles,
    products: user.products,
    metadata: user.metadata
  };
}

// --- Kaisa Actions ---

export async function getKaisaDashboardData() {
  const user = await getCurrentUser();
  if (!user.roles.isKaisaUser) throw new Error("Access Denied: Not a Kaisa user");

  const [tasks, activity, credits, config] = await Promise.all([
    kaisaService.getUserTasks(user.identity.id),
    kaisaService.getUserActivityLog(user.identity.id),
    kaisaService.getCreditUsage(user.identity.id),
    kaisaService.getConfig()
  ]);

  return {
    identity: user.identity,
    profile: user.products.kaisa,
    tasks,
    activity,
    credits,
    integrations: config.integrations
  };
}

export async function toggleKaisaModuleAction(moduleName: string, enabled: boolean) {
    const user = await getCurrentUser();
    // In a real app, validate if module is allowed for business type
    // Mock update:
    if (enabled) {
        if (!user.products.kaisa?.activeModules.includes(moduleName)) {
            user.products.kaisa?.activeModules.push(moduleName);
        }
    } else {
        user.products.kaisa!.activeModules = user.products.kaisa!.activeModules.filter(m => m !== moduleName);
    }
    return { success: true };
}

// --- Space Actions ---

export async function getSpaceDashboardData() {
  const user = await getCurrentUser();
  if (!user.roles.isSpaceUser) throw new Error("Access Denied: Not a Space user");

  const [projects, services, usage] = await Promise.all([
    spaceService.getUserProjects(user.identity.id),
    spaceService.getUserServices(user.identity.id),
    spaceService.getResourceUsage(user.identity.id)
  ]);

  return {
    identity: user.identity,
    profile: user.products.space,
    projects,
    services,
    usage
  };
}

export async function getSpaceProjectDetails(projectId: string) {
    const project = await spaceService.getProjectById(projectId);
    if (!project) return null;
    
    // In a real app, verify ownership
    const dns = await spaceService.getProjectDns(projectId);
    return { project, dns };
}

// --- Support Actions ---

export async function getCustomerTickets() {
  const user = await getCurrentUser();
  return await supportService.getUserTickets(user.identity.id);
}

export async function createCustomerTicket(formData: FormData) {
    const user = await getCurrentUser();
    const subject = formData.get("subject") as string;
    const product = formData.get("product") as "kaisa" | "space" | "node";
    const message = formData.get("message") as string;
    const priority = formData.get("priority") as "low" | "medium" | "high";

    if (!subject || !product || !message) {
        throw new Error("Missing required fields");
    }

    const ticket = await supportService.createTicket({
        userId: user.identity.id,
        subject,
        product,
        priority: priority || "medium",
        status: "open"
    });

    // Add initial message
    // In a real app, this would be part of createTicket or a separate call
    // For now, we just return the ticket
    return ticket;
}

export async function createTicketAction(subject: string, product: "kaisa" | "space" | "general", message: string) {
  const user = await getCurrentUser();
  
  const ticket = await supportService.createTicket({
    userId: user.identity.id,
    subject,
    product,
    priority: "medium",
    status: "open"
  });

  // Add initial message
  ticket.messages.push({
    id: `MSG-${Date.now()}`,
    sender: "user",
    message,
    timestamp: new Date().toISOString()
  });

  return { success: true, ticketId: ticket.id };
}
