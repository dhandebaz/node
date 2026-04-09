
import { getSupabaseServer } from "@/lib/supabase/server";
import { Conversation, MessageChannel, MessageDirection } from "@/types/omnichannel";
import { log } from "@/lib/logger";

export class InboxService {
  /**
   * Get all conversations for a tenant, ordered by last message
   */
  static async getConversations(tenantId: string): Promise<Conversation[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("tenant_id", tenantId)
      .order("last_message_at", { ascending: false });

    if (error) {
      log.error("Failed to fetch conversations", error);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      tenantId: row.tenant_id,
      externalId: row.external_id,
      channel: row.channel,
      contactName: row.contact_name,
      contactAvatar: row.contact_avatar,
      lastMessageAt: row.last_message_at,
      status: row.status as any,
      metadata: row.metadata || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at
    })) as Conversation[];
  }

  /**
   * Get messages for a specific conversation
   */
  static async getMessages(conversationId: string) {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      log.error(`Failed to fetch messages for conversation ${conversationId}`, error);
      return [];
    }

    return data;
  }

  /**
   * Create or update a conversation from an incoming/outgoing message
   */
  static async syncConversation(params: {
    tenantId: string;
    externalId: string | null | undefined;
    channel: MessageChannel;
    contactName?: string;
    contactAvatar?: string;
    lastMessagePreview?: string;
  }) {
    const supabase = await getSupabaseServer();
    const externalId = params.externalId || `guest_${Date.now()}`;

    // 1. Try to find existing conversation
    const { data: existing } = await supabase
      .from("conversations")
      .select("id, metadata")
      .eq("tenant_id", params.tenantId)
      .eq("external_id", externalId)
      .eq("channel", params.channel)
      .maybeSingle();

    if (existing) {
      // Update
      const { data: updated, error } = await supabase
        .from("conversations")
        .update({
          last_message_at: new Date().toISOString(),
          contact_name: params.contactName || undefined,
          contact_avatar: params.contactAvatar || undefined,
          metadata: {
            ...(existing.metadata as any),
            last_message_preview: params.lastMessagePreview
          },
          updated_at: new Date().toISOString()
        })
        .eq("id", existing.id)
        .select()
        .single();
      
      return updated;
    } else {
      // Create
      const { data: created, error } = await supabase
        .from("conversations")
        .insert({
          tenant_id: params.tenantId,
          external_id: externalId,
          channel: params.channel,
          contact_name: params.contactName || externalId,
          contact_avatar: params.contactAvatar,
          last_message_at: new Date().toISOString(),
          metadata: {
            last_message_preview: params.lastMessagePreview
          }
        })
        .select()
        .single();
      
      return created;
    }
  }

  /**
   * Update conversation status explicitly (CRM Movement)
   */
  static async updateConversationStatus(
    tenantId: string,
    conversationId: string,
    status: Conversation["status"],
    metadata?: any
  ) {
    const supabase = await getSupabaseServer();
    
    const { data, error } = await supabase
      .from("conversations")
      .update({ 
        status, 
        metadata: metadata ? metadata : undefined,
        updated_at: new Date().toISOString() 
      })
      .eq("tenant_id", tenantId)
      .eq("id", conversationId)
      .select()
      .single();

    if (error) {
      log.error(`Failed to update status for conversation ${conversationId}`, error);
      throw error;
    }

    return data;
  }
}
