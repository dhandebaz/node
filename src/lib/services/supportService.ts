
import { SupportTicket, TicketStatus, TicketPriority } from "@/types/support";

// Mock Data
let MOCK_TICKETS: SupportTicket[] = [
  {
    id: "TCK-001",
    userId: "USR-001",
    subject: "Need help with Kaisa integration",
    product: "kaisa",
    status: "open",
    priority: "medium",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [
      {
        id: "MSG-1",
        sender: "user",
        message: "I can't seem to connect my calendar. Getting a 403 error.",
        timestamp: new Date().toISOString(),
      }
    ]
  },
  {
    id: "TCK-002",
    userId: "USR-001",
    subject: "Domain DNS propagation delay",
    product: "space",
    status: "resolved",
    priority: "low",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    messages: [
      {
        id: "MSG-1",
        sender: "user",
        message: "How long does DNS take? It's been 2 hours.",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: "MSG-2",
        sender: "support",
        message: "Hello, DNS usually takes 24-48 hours globally, but should be visible locally within 4 hours.",
        timestamp: new Date(Date.now() - 43200000).toISOString(),
      }
    ]
  }
];

export const supportService = {
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    return MOCK_TICKETS.filter(t => t.userId === userId).sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  },

  async createTicket(ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "messages">): Promise<SupportTicket> {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `TCK-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
      status: "open"
    };
    MOCK_TICKETS.unshift(newTicket);
    return newTicket;
  }
};
