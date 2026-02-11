import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { processNewKnowledge } from '@/lib/ai';
import {
  validateKnowledgeItem,
  formatZodErrors,
} from '@/lib/validations';
import type { KnowledgeItem, ApiResponse } from '@/lib/database.types';

// =============================================================================
// GET /api/knowledge/[id] - Get a single knowledge item
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

    const { data, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !data) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Knowledge item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json<ApiResponse<KnowledgeItem>>({
      success: true,
      data,
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
// PATCH /api/knowledge/[id] - Update a knowledge item
// =============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;
    const body = await request.json();

    // Check if item exists
    const { data: existingData, error: fetchError } = await supabase
      .from('knowledge_items')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();
    
    const existing = existingData as KnowledgeItem | null;

    if (fetchError || !existing) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Knowledge item not found' },
        { status: 404 }
      );
    }

    // Merge with existing data for validation
    const mergedData = {
      title: body.title ?? existing.title,
      content: body.content ?? existing.content,
      type: body.type ?? existing.type,
      source_url: body.source_url ?? existing.source_url,
      user_tags: body.user_tags ?? existing.user_tags,
    };

    // Validate merged data
    const validation = validateKnowledgeItem(mergedData);
    if (!validation.success) {
      return NextResponse.json<ApiResponse<null>>(
        {
          success: false,
          error: formatZodErrors(validation.errors!),
        },
        { status: 400 }
      );
    }

    // If content or title changed, regenerate AI data
    let updateData: Record<string, unknown> = { ...validation.data };
    
    if (body.title !== existing.title || body.content !== existing.content) {
      try {
        const aiData = await processNewKnowledge(
          validation.data!.title,
          validation.data!.content
        );
        updateData = {
          ...updateData,
          summary: aiData.summary,
          ai_tags: aiData.tags,
          embedding: aiData.embedding,
        };
      } catch (aiError) {
        console.error('AI processing error:', aiError);
      }
    }

    // Update in database
    const { data, error } = await supabase
      .from('knowledge_items')
      .update(updateData as never)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Failed to update knowledge item' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<KnowledgeItem>>({
      success: true,
      data,
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
// DELETE /api/knowledge/[id] - Soft delete a knowledge item
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient();
    const { id } = params;

    // Soft delete by setting deleted_at
    const { error } = await supabase
      .from('knowledge_items')
      .update({ deleted_at: new Date().toISOString() } as never)
      .eq('id', id)
      .is('deleted_at', null);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Failed to delete knowledge item' },
        { status: 500 }
      );
    }

    return NextResponse.json<ApiResponse<null>>({
      success: true,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
