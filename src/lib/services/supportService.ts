
import { SupportTicket, TicketStatus, TicketPriority, TicketMessage } from "@/types/support";
import { getSupabaseServer } from "@/lib/supabase/server";

export const supportService = {
  async getUserTickets(userId: string): Promise<SupportTicket[]> {
    const supabase = await getSupabaseServer();
    
    // Fetch tickets
    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching tickets:", error);
      return [];
    }

    if (!tickets || tickets.length === 0) return [];

    // Fetch messages for these tickets
    // This could be optimized, but for now we'll fetch all messages for these tickets
    const ticketIds = tickets.map(t => t.id);
    const { data: messages } = await supabase
        .from("support_ticket_messages")
        .select("*")
        .in("ticket_id", ticketIds)
        .order("created_at", { ascending: true });

    const messageMap = new Map<string, TicketMessage[]>();
    
    if (messages) {
        messages.forEach((msg: any) => {
            const ticketId = msg.ticket_id;
            if (!messageMap.has(ticketId)) {
                messageMap.set(ticketId, []);
            }
            messageMap.get(ticketId)?.push({
                id: msg.id,
                sender: msg.sender_role === 'user' ? 'user' : 'support',
                message: msg.message,
                timestamp: msg.created_at
            });
        });
    }

    return tickets.map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      subject: t.subject,
      product: t.product,
      status: t.status,
      priority: t.priority,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      messages: messageMap.get(t.id) || []
    }));
  },

  async createTicket(ticket: Omit<SupportTicket, "id" | "createdAt" | "updatedAt" | "messages"> & { initialMessage?: string }): Promise<SupportTicket> {
    const supabase = await getSupabaseServer();
    
    // 1. Create Ticket
    const { data: newTicket, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: ticket.userId,
        subject: ticket.subject,
        product: ticket.product,
        status: ticket.status || "open",
        priority: ticket.priority || "medium"
      })
      .select()
      .single();

    if (error || !newTicket) {
      throw new Error(error?.message || "Failed to create ticket");
    }

    // 2. Create Initial Message if provided
    let messages: TicketMessage[] = [];
    if (ticket.initialMessage) {
        const { data: msgData, error: msgError } = await supabase
            .from("support_ticket_messages")
            .insert({
                ticket_id: newTicket.id,
                sender_id: ticket.userId,
                sender_role: 'user',
                message: ticket.initialMessage
            })
            .select()
            .single();
        
        if (!msgError && msgData) {
            messages.push({
                id: msgData.id,
                sender: 'user',
                message: msgData.message,
                timestamp: msgData.created_at
            });
        }
    }

    return {
      id: newTicket.id,
      userId: newTicket.user_id,
      subject: newTicket.subject,
      product: newTicket.product,
      status: newTicket.status,
      priority: newTicket.priority,
      createdAt: newTicket.created_at,
      updatedAt: newTicket.updated_at,
      messages: messages
    };
  }
};
