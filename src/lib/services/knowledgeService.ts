
import { getSupabaseServer, getSupabaseAdmin } from "@/lib/supabase/server";
import { geminiService } from "./geminiService";
import { log } from "@/lib/logger";

export class KnowledgeService {
  /**
   * Search for relevant knowledge chunks based on a query.
   */
  static async queryKnowledge(tenantId: string, query: string, limit: number = 3) {
    try {
      // 1. Generate embedding for the query
      const queryEmbedding = await geminiService.generateEmbedding(query);
      
      const supabase = await getSupabaseServer();
      
      // 2. Call the RPC function to find similar chunks
      const { data, error } = await supabase.rpc('match_knowledge_chunks', {
        query_embedding: `[${queryEmbedding.join(",")}]`,
        match_threshold: 0.5,
        match_count: limit,
        p_tenant_id: tenantId
      });

      if (error) throw error;
      
      return data.map((chunk: any) => chunk.content).join("\n---\n");
    } catch (error) {
      log.error("Knowledge query failed", error);
      return "";
    }
  }

  /**
   * Process a new document: Parse, Chunk, and Embed.
   * (Mock implementation of parsing, in real world use 'pdf-parse')
   */
  static async ingestDocument(tenantId: string, docId: string, content: string) {
    const supabase = await getSupabaseAdmin();
    
    try {
      // 1. Update status
      await supabase.from("knowledge_documents").update({ status: 'processing' }).eq("id", docId);

      // 2. Split content into chunks (approx 1000 chars)
      const chunks = this.chunkText(content, 1000);
      
      // 3. Generate embeddings and save
      for (const text of chunks) {
        const embedding = await geminiService.generateEmbedding(text);
        // Format as Postgres vector string [x,y,z]
        const vectorString = `[${embedding.join(",")}]`;
        
        await supabase.from("knowledge_chunks").insert({
          document_id: docId,
          tenant_id: tenantId,
          content: text,
          embedding: vectorString
        } as any);
      }

      // 4. Mark active
      await supabase.from("knowledge_documents").update({ status: 'active' }).eq("id", docId);
      return { success: true };
    } catch (error) {
      log.error(`Failed to ingest document ${docId}`, error);
      await supabase.from("knowledge_documents").update({ status: 'failed' }).eq("id", docId);
      throw error;
    }
  }

  private static chunkText(text: string, size: number): string[] {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
      chunks.push(text.slice(i, i + size));
    }
    return chunks;
  }
}
