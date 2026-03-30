
import { KaisaMemory, MemoryType, LearningStats } from "@/types/kaisa-learning";
import { getSupabaseServer } from "@/lib/supabase/server";
import { log } from "@/lib/logger";

export const kaisaMemoryService = {
  async getMemories(userId: string): Promise<KaisaMemory[]> {
    const supabase = await getSupabaseServer();
    const { data, error } = await supabase
      .from("kaisa_memories")
      .select("*")
      .eq("user_id", userId)
      .neq("status", "archived")
      .order("created_at", { ascending: false });

    if (error) {
      log.error(`Error fetching memories for user ${userId}`, error);
      return [];
    }

    const MAX_TOKENS = 2000;
    const CHARS_PER_TOKEN = 4;
    let currentTokens = 0;
    const validMemories = [];

    for (const m of data) {
      const estimatedTokens = Math.ceil((m.description?.length || 0) / CHARS_PER_TOKEN);
      if (currentTokens + estimatedTokens > MAX_TOKENS) {
        const remainingTokens = MAX_TOKENS - currentTokens;
        if (remainingTokens > 20) {
          m.description = m.description.substring(0, remainingTokens * CHARS_PER_TOKEN) + "... [TRUNCATED]";
          validMemories.push(m);
        }
        break; // Stop including older memories
      }
      currentTokens += estimatedTokens;
      validMemories.push(m);
    }

    return validMemories.map((m: any) => ({
      id: m.id,
      userId: m.user_id,
      type: m.type as MemoryType,
      source: m.source,
      description: m.description,
      confidence: Number(m.confidence),
      createdAt: m.created_at,
      lastUsedAt: m.last_used_at,
      status: m.status,
      moduleId: m.module_id,
      metadata: m.metadata
    }));
  },

  async getStats(userId: string): Promise<LearningStats> {
    const userMemories = await this.getMemories(userId);
    const byType: Record<MemoryType, number> = {
      preference: 0,
      process: 0,
      correction: 0,
      outcome: 0
    };
    
    let lastLearnedAt: string | null = null;

    userMemories.forEach(m => {
      byType[m.type]++;
      if (!lastLearnedAt || new Date(m.createdAt) > new Date(lastLearnedAt)) {
        lastLearnedAt = m.createdAt;
      }
    });

    return {
      totalMemories: userMemories.length,
      byType,
      lastLearnedAt
    };
  },

  async addMemory(memory: Omit<KaisaMemory, "id" | "createdAt" | "status">): Promise<KaisaMemory> {
    const supabase = await getSupabaseServer();
    
    // Resolve tenant_id for the user
    const { data: membership } = await supabase
      .from("tenant_users")
      .select("tenant_id")
      .eq("user_id", memory.userId)
      .maybeSingle();

    if (!membership?.tenant_id) {
      throw new Error("User has no active workspace to store memory");
    }

    const { data, error } = await supabase
      .from("kaisa_memories")
      .insert({
        tenant_id: membership.tenant_id,
        user_id: memory.userId,
        type: memory.type,
        source: memory.source,
        description: memory.description,
        confidence: memory.confidence,
        status: "active",
        module_id: memory.moduleId,
        metadata: memory.metadata
      })
      .select("*")
      .single();

    if (error) {
      log.error("Failed to add Kaisa memory", error);
      throw new Error("Failed to store memory");
    }

    return {
      id: data.id,
      userId: data.user_id,
      type: data.type as MemoryType,
      source: (data.source as any) || "",
      description: data.description || "",
      confidence: Number(data.confidence || 0),
      createdAt: data.created_at || new Date().toISOString(),
      lastUsedAt: data.last_used_at || undefined,
      status: (data.status as any) || "active",
      moduleId: data.module_id || undefined,
      metadata: (data.metadata as any) || {}
    };
  },

  async updateStatus(id: string, status: KaisaMemory['status']): Promise<void> {
    const supabase = await getSupabaseServer();
    const { error } = await supabase
      .from("kaisa_memories")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      log.error(`Failed to update memory status for ${id}`, error);
      throw new Error("Failed to update status");
    }
  },

  async deleteMemory(id: string): Promise<void> {
    const supabase = await getSupabaseServer();
    // Prefer archiving over hard deletion for AI context
    const { error } = await supabase
      .from("kaisa_memories")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      log.error(`Failed to delete memory ${id}`, error);
      throw new Error("Failed to delete memory");
    }
  },

  async resetLearning(userId: string): Promise<void> {
    const supabase = await getSupabaseServer();
    const { error } = await supabase
      .from("kaisa_memories")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("user_id", userId);

    if (error) {
      log.error(`Failed to reset learning for user ${userId}`, error);
      throw new Error("Failed to reset learning");
    }
  }
};
