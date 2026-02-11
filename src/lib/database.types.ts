// =============================================================================
// DATABASE TYPES
// =============================================================================
// TypeScript types matching our Supabase schema

export type KnowledgeType = 'note' | 'link' | 'insight';

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  type: KnowledgeType;
  source_url: string | null;
  summary: string | null;
  ai_tags: string[];
  user_tags: string[];
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface KnowledgeItemInsert {
  title: string;
  content: string;
  type: KnowledgeType;
  source_url?: string | null;
  user_tags?: string[];
}

export interface KnowledgeItemUpdate {
  title?: string;
  content?: string;
  type?: KnowledgeType;
  source_url?: string | null;
  summary?: string | null;
  ai_tags?: string[];
  user_tags?: string[];
  embedding?: number[];
}

export interface QueryLog {
  id: string;
  query_text: string;
  query_embedding: number[] | null;
  response: string | null;
  source_ids: string[];
  tokens_used: number;
  response_time_ms: number | null;
  created_at: string;
}

export interface ApiUsage {
  id: string;
  api_key_hash: string | null;
  endpoint: string;
  ip_address: string | null;
  created_at: string;
}

// =============================================================================
// SEARCH RESULT TYPES
// =============================================================================

export interface SemanticSearchResult extends KnowledgeItem {
  similarity: number;
}

export interface TextSearchResult extends KnowledgeItem {
  rank: number;
}

export interface SearchFilters {
  type?: KnowledgeType | null;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
}

export interface SearchOptions {
  query: string;
  mode: 'text' | 'semantic' | 'hybrid';
  filters?: SearchFilters;
  limit?: number;
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
  };
}

export interface PublicQueryResponse {
  answer: string;
  sources: Array<{
    id: string;
    title: string;
    summary: string | null;
    relevance: number;
  }>;
  tokens_used: number;
}

// =============================================================================
// DATABASE SCHEMA (for Supabase client typing)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      knowledge_items: {
        Row: KnowledgeItem;
        Insert: KnowledgeItemInsert;
        Update: KnowledgeItemUpdate;
      };
      query_logs: {
        Row: QueryLog;
        Insert: Omit<QueryLog, 'id' | 'created_at'>;
        Update: Partial<QueryLog>;
      };
      api_usage: {
        Row: ApiUsage;
        Insert: Omit<ApiUsage, 'id' | 'created_at'>;
        Update: Partial<ApiUsage>;
      };
    };
    Functions: {
      search_knowledge_semantic: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
        };
        Returns: SemanticSearchResult[];
      };
      search_knowledge_text: {
        Args: {
          search_query: string;
          match_count?: number;
        };
        Returns: TextSearchResult[];
      };
    };
  };
}
