import { z } from 'zod';

// =============================================================================
// KNOWLEDGE ITEM VALIDATION
// =============================================================================

export const knowledgeItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters'),
  content: z
    .string()
    .min(1, 'Content is required')
    .max(50000, 'Content must be less than 50,000 characters'),
  type: z.enum(['note', 'link', 'insight'], {
    errorMap: () => ({ message: 'Type must be note, link, or insight' }),
  }),
  source_url: z
    .string()
    .url('Please enter a valid URL')
    .nullable()
    .optional()
    .or(z.literal('')),
  user_tags: z
    .array(z.string().max(50, 'Tag must be less than 50 characters'))
    .max(20, 'Maximum 20 tags allowed')
    .optional()
    .default([]),
});

export type KnowledgeItemInput = z.infer<typeof knowledgeItemSchema>;

// =============================================================================
// SEARCH VALIDATION
// =============================================================================

export const searchQuerySchema = z.object({
  query: z.string().max(500, 'Query too long'),
  type: z.enum(['note', 'link', 'insight']).nullable().optional(),
  tags: z.array(z.string()).optional(),
  mode: z.enum(['text', 'semantic', 'hybrid']).optional().default('hybrid'),
  limit: z.number().min(1).max(100).optional().default(20),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

// =============================================================================
// PUBLIC API VALIDATION
// =============================================================================

export const publicQuerySchema = z.object({
  q: z
    .string()
    .min(1, 'Query is required')
    .max(1000, 'Query must be less than 1000 characters'),
  // FIX START - Handle null limit properly
  limit: z.preprocess(
    (val) => (val === null || val === '' || val === undefined ? undefined : val),
    z.coerce.number().min(1).max(20).optional().default(5)
  ),
  // FIX END
});

export type PublicQueryInput = z.infer<typeof publicQuerySchema>;

// =============================================================================
// VALIDATION HELPERS
// =============================================================================

export function validateKnowledgeItem(data: unknown): {
  success: boolean;
  data?: KnowledgeItemInput;
  errors?: z.ZodError;
} {
  const result = knowledgeItemSchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function validateSearchQuery(data: unknown): {
  success: boolean;
  data?: SearchQueryInput;
  errors?: z.ZodError;
} {
  const result = searchQuerySchema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

export function formatZodErrors(error: z.ZodError): string {
  return error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
}
