
export type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical";
export type TicketProduct = "kaisa" | "space" | "node" | "general";

export interface TicketMessage {
  id: string;
  sender: "user" | "support";
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  product: TicketProduct;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}
