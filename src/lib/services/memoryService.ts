import { getSupabaseServer } from "@/lib/supabase/server";
import { WalletService } from "./walletService";
import { PricingService } from "./pricingService";
import { logEvent } from "@/lib/events";
import { EVENT_TYPES } from "@/types/events";

export type MemoryType = 'business' | 'listing' | 'interaction';

export interface AIMemory {
  id: string;
  tenant_id: string;
  listing_id?: string | null;
  memory_type: MemoryType;
  summary: string;
  confidence: number;
  last_used_at: string;
  created_at: string;
  metadata?: Record<string, any>;
}

export class MemoryService {
  /**
   * Retrieve relevant memories for a context.
   * Costs a small amount of credits (read operation).
   */
  static async getMemories(
    tenantId: string, 
    context: { listingId?: string; type?: MemoryType; skipCost?: boolean } = {}
  ): Promise<AIMemory[]> {
    const supabase = await getSupabaseServer();
    
    // 1. Build Query
    let query = supabase
      .from("ai_memory")
      .select("*")
      .eq("tenant_id", tenantId);

    // If listingId provided, get listing-specific AND business-level (null listing_id)
    // Actually, SQL 'OR' is tricky with Supabase builder unless using .or() string syntax
    // Simplification: Fetch all tenant memories and filter in code, OR careful query.
    // Let's try to be specific:
    // If context.listingId is present, we want memories where (listing_id is null OR listing_id = context.listingId)
    
    if (context.listingId) {
       // Use .or() syntax: "listing_id.is.null,listing_id.eq.{listingId}"
       query = query.or(`listing_id.is.null,listing_id.eq.${context.listingId}`);
    } else if (context.listingId === undefined) {
       // If undefined, it might mean "fetch all" (e.g. for admin UI) or "fetch global"
       // If explicitly null, we want global only.
       // Let's assume if undefined and not asking for type, we might want everything (for UI).
       // But wait, the previous logic was:
       // else { query = query.is("listing_id", null); }
       // This restricts to global only.
       // For UI (Settings), we want ALL memories.
       // Let's change this behavior:
       // If context.listingId is undefined, DO NOT FILTER by listing_id (return all).
       // If context.listingId is null, filter where listing_id is null.
    }

    if (context.type) {
        query = query.eq("memory_type", context.type);
    }

    // Limit to reasonable amount to prevent context window explosion
    // For UI, we might want pagination, but for now limit 50
    query = query.order("confidence", { ascending: false }).limit(50);

    const { data, error } = await query;
    
    if (error) {
        console.error("Failed to fetch memories:", error);
        return [];
    }

    const memories = data as AIMemory[];

    // 2. Charge for Memory Read (Micro-transaction)
    // Skip cost if requested (e.g. for Admin UI)
    if (!context.skipCost) {
        const cost = await PricingService.calculateCost('memory_read', 50, tenantId);
        await WalletService.deductCredits(tenantId, cost, 'memory_read', { count: memories.length });
    }

    return memories;
  }

  /**
   * Add a new memory.
   * Costs credits (write operation).
   */
  static async addMemory(
    tenantId: string,
    memory: {
      type: MemoryType;
      summary: string;
      listingId?: string | null;
      confidence?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<AIMemory | null> {
    const supabase = await getSupabaseServer();

    // 1. Charge for Write (Higher cost)
    // e.g. 200 tokens equivalent
    const cost = await PricingService.calculateCost('memory_write', 200, tenantId);
    const hasBalance = await WalletService.hasSufficientBalance(tenantId, cost);

    if (!hasBalance) {
        throw new Error("Insufficient balance for memory creation");
    }

    // 2. Insert
    const { data, error } = await supabase
      .from("ai_memory")
      .insert({
        tenant_id: tenantId,
        memory_type: memory.type,
        summary: memory.summary,
        listing_id: memory.listingId || null,
        confidence: memory.confidence || 1.0,
        metadata: memory.metadata || {}
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Deduct Cost
    await WalletService.deductCredits(tenantId, cost, 'memory_write', { memory_id: data.id });

    // 4. Audit Log
    await logEvent({
        tenant_id: tenantId,
        actor_type: 'ai', // or 'user' if manual? Caller should specify via metadata if user
        event_type: EVENT_TYPES.MEMORY_CREATED, // Need to add this type
        entity_type: 'memory',
        entity_id: data.id,
        metadata: {
            summary: memory.summary,
            type: memory.type
        }
    });

    return data as AIMemory;
  }

  /**
   * Delete a memory (Erasable).
   */
  static async deleteMemory(tenantId: string, memoryId: string): Promise<boolean> {
    const supabase = await getSupabaseServer();
    
    const { error } = await supabase
      .from("ai_memory")
      .delete()
      .eq("id", memoryId)
      .eq("tenant_id", tenantId); // Safety check

    if (error) throw error;

    await logEvent({
        tenant_id: tenantId,
        actor_type: 'user',
        event_type: EVENT_TYPES.MEMORY_DELETED, // Need to add
        entity_type: 'memory',
        entity_id: memoryId
    });

    return true;
  }

  /**
   * Update usage timestamp.
   */
  static async markUsed(tenantId: string, memoryIds: string[]) {
    if (memoryIds.length === 0) return;
    
    const supabase = await getSupabaseServer();
    await supabase
        .from("ai_memory")
        .update({ last_used_at: new Date().toISOString() })
        .in("id", memoryIds)
        .eq("tenant_id", tenantId);
  }

  /**
   * Toggle memory system for a tenant.
   */
  static async toggleMemory(tenantId: string, enabled: boolean): Promise<boolean> {
    const supabase = await getSupabaseServer();
    const { error } = await supabase
      .from("tenants")
      .update({ is_memory_enabled: enabled })
      .eq("id", tenantId);
      
    if (error) {
        console.error("Failed to toggle memory:", error);
        throw error;
    }
    
    // Log audit event
    await logEvent({
        tenant_id: tenantId,
        actor_type: 'user', // Assumed user action
        event_type: EVENT_TYPES.AI_SETTINGS_CHANGED,
        entity_type: 'system',
        metadata: {
            action: 'toggle_memory',
            enabled
        }
    });

    return true;
  }
}
