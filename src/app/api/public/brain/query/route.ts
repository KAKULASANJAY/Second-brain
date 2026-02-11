import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { queryKnowledge } from '@/lib/ai';
import { publicQuerySchema } from '@/lib/validations';
import type { PublicQueryResponse, ApiResponse } from '@/lib/database.types';

// =============================================================================
// GET /api/public/brain/query - Public API for querying the knowledge base
// =============================================================================
// This endpoint uses text search for stability (embeddings disabled)

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const { searchParams } = new URL(request.url);

    console.log('[API Query] Received params:', { 
      q: searchParams.get('q'), 
      limit: searchParams.get('limit') 
    });

    // Parse and validate query parameters
    const parseResult = publicQuerySchema.safeParse({
      q: searchParams.get('q'),
      limit: searchParams.get('limit'),
    });

    if (!parseResult.success) {
      console.error('[API Query] Validation failed:', parseResult.error.errors);
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: parseResult.error.errors.map((e) => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { q: query, limit } = parseResult.data;
    const supabase = createServerClient();

    // ==========================================================================
    // STEP 1: Find relevant knowledge items using text search
    // ==========================================================================
    console.log('[API Query] Using text search for query:', query);
    
    let relevantItems: any[] = [];
    
    const { data: textResults, error: textError } = await (supabase.rpc as any)(
      'search_knowledge_text',
      {
        search_query: query,
        match_count: limit,
      }
    ) as { data: any[] | null; error: any };

    if (textError) {
      console.warn('Text search RPC error, trying direct query:', textError);
      // Fallback: Simple LIKE search
      const { data: likeResults } = await supabase
        .from('knowledge_items')
        .select('*')
        .is('deleted_at', null)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('created_at', { ascending: false })
        .limit(limit);
      relevantItems = likeResults || [];
    } else {
      relevantItems = textResults || [];
    }

    // If still no results, get recent items
    if (relevantItems.length === 0) {
      const { data: recentItems } = await supabase
        .from('knowledge_items')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(limit);
      relevantItems = recentItems || [];
    }

    if (!relevantItems || relevantItems.length === 0) {
      return NextResponse.json<ApiResponse<PublicQueryResponse>>({
        success: true,
        data: {
          answer: "I couldn't find any relevant information in the knowledge base for your query. Try adding some knowledge first!",
          sources: [],
          tokens_used: 0,
        },
      });
    }

    // ==========================================================================
    // STEP 2: Generate AI response using the relevant context
    // ==========================================================================
    const context = relevantItems.map((item) => ({
      title: item.title,
      content: item.content,
      summary: item.summary,
    }));

    let aiResponse: { answer: string; tokensUsed: number };
    try {
      aiResponse = await queryKnowledge(query, context);
    } catch (error) {
      console.warn('AI query error, using fallback response:', error);
      // FALLBACK: Return a summary of matched items
      const fallbackAnswer = `Based on your knowledge base, here are the most relevant items:\n\n${relevantItems
        .slice(0, 3)
        .map((item, i) => `${i + 1}. **${item.title}**\n   ${item.summary || item.content?.slice(0, 200) || 'No summary available'}`)
        .join('\n\n')}\n\n_Note: AI-powered response is currently unavailable. Showing matched results instead._`;
      
      aiResponse = { answer: fallbackAnswer, tokensUsed: 0 };
    }

    // ==========================================================================
    // STEP 3: Log the query for analytics (non-blocking)
    // ==========================================================================
    const responseTime = Date.now() - startTime;

    void supabase.from('query_logs').insert({
      query_text: query,
      response: aiResponse.answer,
      source_ids: relevantItems.map((item) => item.id),
      tokens_used: aiResponse.tokensUsed,
      response_time_ms: responseTime,
    } as never);

    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown';

    void supabase.from('api_usage').insert({
      endpoint: '/api/public/brain/query',
      ip_address: ip,
    } as never);

    // ==========================================================================
    // STEP 4: Return the response
    // ==========================================================================
    const response: PublicQueryResponse = {
      answer: aiResponse.answer,
      sources: relevantItems.map((item) => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        relevance: item.rank || 0.5,
      })),
      tokens_used: aiResponse.tokensUsed,
    };

    return NextResponse.json<ApiResponse<PublicQueryResponse>>({
      success: true,
      data: response,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Unexpected error in public query:', errorMessage);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'An error occurred while processing your query. Please try again.' },
      { status: 500 }
    );
  }
}

// =============================================================================
// OPTIONS - Handle CORS preflight
// =============================================================================

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
