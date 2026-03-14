
-- Migration 015: Kaisa Knowledge Base (RAG 2.0)
-- Infrastructure for PDF/Document ingestion and vector search.

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Knowledge Documents Table
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL, -- Storage bucket path
  file_type TEXT NOT NULL, -- 'pdf', 'txt', 'docx'
  status TEXT CHECK (status IN ('pending', 'processing', 'active', 'failed')) DEFAULT 'pending',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Knowledge Chunks Table (For RAG)
CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.knowledge_documents(id) ON DELETE CASCADE NOT NULL,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(768), -- Optimized for Gemini embedding-004 (768 dimensions)
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vector Similarity Function
CREATE OR REPLACE FUNCTION public.match_knowledge_chunks(
  query_embedding VECTOR(768),
  match_threshold FLOAT,
  match_count INT,
  p_tenant_id UUID
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  content TEXT,
  similarity FLOAT,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.document_id,
    kc.content,
    1 - (kc.embedding <=> query_embedding) AS similarity,
    kc.metadata
  FROM public.knowledge_chunks kc
  WHERE kc.tenant_id = p_tenant_id
    AND 1 - (kc.embedding <=> query_embedding) > match_threshold
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "tenant_isolation_knowledge_docs" ON public.knowledge_documents
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

CREATE POLICY "tenant_isolation_knowledge_chunks" ON public.knowledge_chunks
  FOR ALL USING (tenant_id IN (SELECT tenant_id FROM public.tenant_users WHERE user_id = auth.uid()));

-- Indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_docs_tenant ON public.knowledge_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_tenant ON public.knowledge_chunks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON public.knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
