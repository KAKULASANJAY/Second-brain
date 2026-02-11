import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import type { ApiResponse } from '@/lib/database.types';

// =============================================================================
// GET /api/tags - Get all unique tags in the system
// =============================================================================

interface TagInfo {
  tag: string;
  count: number;
  source: 'user' | 'ai' | 'both';
}

export async function GET() {
  try {
    const supabase = createServerClient();

    // Fetch all items with tags
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('user_tags, ai_tags')
      .is('deleted_at', null);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: 'Failed to fetch tags' },
        { status: 500 }
      );
    }

    // Aggregate tags
    const tagMap = new Map<string, { user: number; ai: number }>();

    const items = (data || []) as Array<{ user_tags: string[] | null; ai_tags: string[] | null }>;
    for (const item of items) {
      for (const tag of item.user_tags || []) {
        const normalized = tag.toLowerCase();
        const current = tagMap.get(normalized) || { user: 0, ai: 0 };
        current.user++;
        tagMap.set(normalized, current);
      }
      for (const tag of item.ai_tags || []) {
        const normalized = tag.toLowerCase();
        const current = tagMap.get(normalized) || { user: 0, ai: 0 };
        current.ai++;
        tagMap.set(normalized, current);
      }
    }

    // Convert to array
    const tags: TagInfo[] = Array.from(tagMap.entries())
      .map(([tag, counts]): TagInfo => ({
        tag,
        count: counts.user + counts.ai,
        source:
          counts.user > 0 && counts.ai > 0
            ? 'both'
            : counts.user > 0
            ? 'user'
            : 'ai',
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json<ApiResponse<TagInfo[]>>({
      success: true,
      data: tags,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
