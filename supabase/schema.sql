-- =============================================================================
-- SECOND BRAIN DATABASE SCHEMA
-- =============================================================================
-- This schema is designed for Supabase PostgreSQL with pgvector extension
-- Run this in your Supabase SQL Editor to set up the database

-- Enable the pgvector extension for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- KNOWLEDGE ITEMS TABLE
-- =============================================================================
-- Core table for storing all knowledge entries (notes, links, insights)

CREATE TABLE IF NOT EXISTS knowledge_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Core content fields
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('note', 'link', 'insight')),
    source_url TEXT,
    
    -- AI-generated fields (populated after creation)
    summary TEXT,
    ai_tags TEXT[] DEFAULT '{}',
    
    -- User-provided tags
    user_tags TEXT[] DEFAULT '{}',
    
    -- Vector embedding for semantic search (768 dimensions for Gemini text-embedding-004)
    embedding vector(768),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete support
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_knowledge_items_type ON knowledge_items(type);

-- Index for chronological sorting
CREATE INDEX IF NOT EXISTS idx_knowledge_items_created_at ON knowledge_items(created_at DESC);

-- GIN index for tag searches (both user and AI tags)
CREATE INDEX IF NOT EXISTS idx_knowledge_items_user_tags ON knowledge_items USING GIN(user_tags);
CREATE INDEX IF NOT EXISTS idx_knowledge_items_ai_tags ON knowledge_items USING GIN(ai_tags);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_knowledge_items_fts ON knowledge_items 
    USING GIN(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '') || ' ' || coalesce(summary, '')));

-- Vector similarity search index (using IVFFlat for performance)
-- Note: Only create this after you have some data (at least 100 rows recommended)
-- CREATE INDEX IF NOT EXISTS idx_knowledge_items_embedding ON knowledge_items 
--     USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- =============================================================================
-- QUERY LOGS TABLE (for analytics and caching)
-- =============================================================================

CREATE TABLE IF NOT EXISTS query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    query_text TEXT NOT NULL,
    query_embedding vector(768),
    response TEXT,
    source_ids UUID[] DEFAULT '{}',
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for finding similar past queries
CREATE INDEX IF NOT EXISTS idx_query_logs_created_at ON query_logs(created_at DESC);

-- =============================================================================
-- API USAGE TABLE (for rate limiting and analytics)
-- =============================================================================

CREATE TABLE IF NOT EXISTS api_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    api_key_hash VARCHAR(64), -- Hashed API key for tracking (future feature)
    endpoint VARCHAR(100) NOT NULL,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_ip ON api_usage(ip_address, created_at DESC);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER update_knowledge_items_updated_at
    BEFORE UPDATE ON knowledge_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SEMANTIC SEARCH FUNCTION
-- =============================================================================
-- This function performs semantic similarity search using vector embeddings

CREATE OR REPLACE FUNCTION search_knowledge_semantic(
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.7,
    match_count INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(500),
    content TEXT,
    type VARCHAR(20),
    summary TEXT,
    ai_tags TEXT[],
    user_tags TEXT[],
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ki.id,
        ki.title,
        ki.content,
        ki.type,
        ki.summary,
        ki.ai_tags,
        ki.user_tags,
        ki.source_url,
        ki.created_at,
        1 - (ki.embedding <=> query_embedding) AS similarity
    FROM knowledge_items ki
    WHERE 
        ki.deleted_at IS NULL
        AND ki.embedding IS NOT NULL
        AND 1 - (ki.embedding <=> query_embedding) > match_threshold
    ORDER BY ki.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- =============================================================================
-- FULL-TEXT SEARCH FUNCTION
-- =============================================================================

CREATE OR REPLACE FUNCTION search_knowledge_text(
    search_query TEXT,
    match_count INT DEFAULT 20
)
RETURNS TABLE (
    id UUID,
    title VARCHAR(500),
    content TEXT,
    type VARCHAR(20),
    summary TEXT,
    ai_tags TEXT[],
    user_tags TEXT[],
    source_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    rank FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ki.id,
        ki.title,
        ki.content,
        ki.type,
        ki.summary,
        ki.ai_tags,
        ki.user_tags,
        ki.source_url,
        ki.created_at,
        ts_rank(
            to_tsvector('english', coalesce(ki.title, '') || ' ' || coalesce(ki.content, '') || ' ' || coalesce(ki.summary, '')),
            plainto_tsquery('english', search_query)
        ) AS rank
    FROM knowledge_items ki
    WHERE 
        ki.deleted_at IS NULL
        AND to_tsvector('english', coalesce(ki.title, '') || ' ' || coalesce(ki.content, '') || ' ' || coalesce(ki.summary, ''))
            @@ plainto_tsquery('english', search_query)
    ORDER BY rank DESC
    LIMIT match_count;
END;
$$;

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- For this demo, we allow public read access and authenticated write access
-- In production, you'd want more granular user-based access control

ALTER TABLE knowledge_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations for now (in production, restrict to authenticated users)
CREATE POLICY "Allow all access to knowledge_items" ON knowledge_items
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to query_logs" ON query_logs
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to api_usage" ON api_usage
    FOR ALL USING (true) WITH CHECK (true);

-- =============================================================================
-- SAMPLE DATA (optional - uncomment to insert)
-- =============================================================================
/*
INSERT INTO knowledge_items (title, content, type, user_tags) VALUES
('Introduction to Vector Databases', 'Vector databases are specialized systems designed to store and query high-dimensional vectors. They enable semantic search by finding similar items based on their vector representations rather than exact keyword matches.', 'note', ARRAY['database', 'ai', 'vectors']),
('Why Mental Models Matter', 'Mental models are frameworks for thinking that help us understand how things work. They simplify complexity and improve decision-making by providing reliable patterns we can apply across different situations.', 'insight', ARRAY['thinking', 'productivity']),
('https://supabase.com/docs/guides/ai', 'Supabase AI documentation covering pgvector integration, embeddings, and semantic search implementation.', 'link', ARRAY['supabase', 'documentation']);
*/
