import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { generateEmbedding } from '@/lib/ai';
import type { ApiResponse, KnowledgeItem } from '@/lib/database.types';

// =============================================================================
// POST /api/search - Search knowledge items
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      mode = 'hybrid',
      type,
      tags,
      limit = 20,
    } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();
    let results: KnowledgeItem[] = [];

    // ==========================================================================
    // SEMANTIC SEARCH
    // ==========================================================================
    if (mode === 'semantic' || mode === 'hybrid') {
      try {
        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // Perform semantic search using the database function
        const { data: semanticResults, error: semanticError } = await (supabase.rpc as any)(
          'search_knowledge_semantic',
          {
            query_embedding: queryEmbedding,
            match_threshold: 0.5,
            match_count: limit,
          }
        );

        if (semanticError) {
          console.error('Semantic search error:', semanticError);
        } else if (semanticResults) {
          results = semanticResults as KnowledgeItem[];
        }
      } catch (embeddingError) {
        console.error('Embedding generation error:', embeddingError);
        // Fall back to text search if embedding fails
        if (mode === 'semantic') {
          return NextResponse.json<ApiResponse<null>>(
            { success: false, error: 'Semantic search unavailable' },
            { status: 503 }
          );
        }
      }
    }

    // ==========================================================================
    // TEXT SEARCH (fallback or hybrid mode)
    // ==========================================================================
    if (mode === 'text' || (mode === 'hybrid' && results.length < limit)) {
      const { data: textResults, error: textError } = await (supabase.rpc as any)(
        'search_knowledge_text',
        {
          search_query: query,
          match_count: limit,
        }
      );

      if (textError) {
        console.error('Text search error:', textError);
      } else if (textResults) {
        // Merge results, avoiding duplicates
        const existingIds = new Set(results.map((r) => r.id));
        const newResults = (textResults as KnowledgeItem[]).filter(
          (r) => !existingIds.has(r.id)
        );
        results = [...results, ...newResults].slice(0, limit);
      }
    }

    // ==========================================================================
    // APPLY ADDITIONAL FILTERS
    // ==========================================================================
    if (type) {
      results = results.filter((r) => r.type === type);
    }

    if (tags && tags.length > 0) {
      results = results.filter((r) => {
        const allTags = [...(r.user_tags || []), ...(r.ai_tags || [])];
        return tags.some((t: string) =>
          allTags.some((rt) => rt.toLowerCase().includes(t.toLowerCase()))
        );
      });
    }

    return NextResponse.json<ApiResponse<KnowledgeItem[]>>({
      success: true,
      data: results,
      meta: {
        total: results.length,
        limit,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Search failed' },
      { status: 500 }
    );
  }
}

// =============================================================================
// GET /api/search - Simple text search via query params
// =============================================================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // Delegate to POST handler with parsed params
  const mockRequest = {
    json: async () => ({ query, type, limit, mode: 'hybrid' }),
  } as NextRequest;

  return POST(mockRequest);
}
