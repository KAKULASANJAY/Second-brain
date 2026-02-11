import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { processNewKnowledge } from '@/lib/ai';
import {
  validateKnowledgeItem,
  formatZodErrors,
} from '@/lib/validations';
import type { KnowledgeItem, ApiResponse } from '@/lib/database.types';

// =============================================================================
// GET /api/knowledge - Fetch all knowledge items
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const sortBy = searchParams.get('sort') || 'created_at';
    const sortOrder = searchParams.get('order') || 'desc';

    // Build query
    let query = supabase
      .from('knowledge_items')
      .select('*', { count: 'exact' })
      .is('deleted_at', null);

    // Apply filters
    if (type && ['note', 'link', 'insight'].includes(type)) {
      query = query.eq('type', type);
    }

    if (tag) {
      query = query.or(`user_tags.cs.{${tag}},ai_tags.cs.{${tag}}`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'updated_at', 'title'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Failed to fetch knowledge items' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<KnowledgeItem[]>>({
      success: true,
      data: data || [],
      meta: {
        total: count || 0,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/knowledge - Create a new knowledge item
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateKnowledgeItem(body);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: formatZodErrors(validation.errors!),
        },
        { status: 400 }
      );
    }

    const { title, content, type, source_url, user_tags } = validation.data!;

    // Process with AI (summarization, tagging, embedding)
    let aiData: { summary: string; tags: string[]; embedding: number[] | null } = { 
      summary: '', 
      tags: [], 
      embedding: null 
    };
    
    try {
      aiData = await processNewKnowledge(title, content);
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      // Continue without AI data - we can process later
    }

    // Insert into database
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('knowledge_items')
      .insert({
        title,
        content,
        type,
        source_url: source_url || null,
        user_tags: user_tags || [],
        summary: aiData.summary || null,
        ai_tags: aiData.tags || [],
        embedding: aiData.embedding,
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Failed to create knowledge item' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<KnowledgeItem>>(
      { success: true, data },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
