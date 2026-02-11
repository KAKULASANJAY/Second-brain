import { GoogleGenerativeAI } from '@google/generative-ai';

// =============================================================================
// GOOGLE GEMINI CLIENT CONFIGURATION
// =============================================================================

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '');

// Model configuration - using stable models
const MODELS = {
  chat: 'gemini-pro', // Most stable model for chat
  query: 'gemini-pro',
} as const;

// FIX: Embeddings disabled for stability - using text search instead
const EMBEDDINGS_ENABLED = false;

// =============================================================================
// AI PROMPTS
// =============================================================================
// These prompts are carefully designed for consistent, high-quality outputs

const PROMPTS = {
  summarize: `You are a knowledge summarization assistant. Your task is to create a concise, informative summary of the provided content.

Guidelines:
- Create a 1-3 sentence summary that captures the key insight or main point
- Focus on what makes this knowledge valuable or actionable
- Use clear, professional language
- Do not include phrases like "This note discusses..." or "The content is about..."
- Start directly with the core information

Content to summarize:`,

  autoTag: `You are a knowledge tagging assistant. Analyze the provided content and generate relevant tags.

Guidelines:
- Generate 3-7 tags that categorize the content
- Use lowercase, single words or hyphenated-phrases
- Focus on: topic, domain, concepts, and actionability
- Include both specific and general tags
- Avoid overly generic tags like "information" or "content"

Return ONLY a JSON array of strings, nothing else. Example: ["machine-learning", "python", "tutorial", "beginner"]

Content to tag:`,

  query: `You are a knowledgeable assistant helping users explore their personal knowledge base. You have access to relevant notes, links, and insights from their "Second Brain."

Guidelines:
- Answer based ONLY on the provided context
- If the context doesn't contain enough information, say so honestly
- Reference specific pieces of knowledge when relevant
- Be concise but thorough
- If asked about something not in the knowledge base, suggest what topics might be worth capturing

Context from knowledge base:
{context}

User question:`,
} as const;

// =============================================================================
// EMBEDDING GENERATION - DISABLED FOR STABILITY
// =============================================================================
// Embeddings are disabled due to API compatibility issues.
// The app uses PostgreSQL full-text search as fallback.

export async function generateEmbedding(text: string): Promise<number[] | null> {
  // FIX: Return null to skip embedding - use text search instead
  if (!EMBEDDINGS_ENABLED) {
    console.log('[AI] Embeddings disabled - using text search fallback');
    return null;
  }
  
  try {
    const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not set');
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: { parts: [{ text: text.slice(0, 8000) }] },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.embedding.values;
  } catch (error: any) {
    console.error('Error generating embedding:', error);
    return null; // Return null on error instead of throwing
  }
}

// =============================================================================
// SUMMARIZATION
// =============================================================================

export async function generateSummary(
  title: string,
  content: string
): Promise<string> {
  try {
    const inputText = `Title: ${title}\n\nContent: ${content}`.slice(0, 4000);
    const model = genAI.getGenerativeModel({ model: MODELS.chat });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${PROMPTS.summarize}\n\n${inputText}` }] }],
      generationConfig: {
        maxOutputTokens: 200,
        temperature: 0.3,
      },
    });

    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error('Failed to generate summary');
  }
}

// =============================================================================
// AUTO-TAGGING
// =============================================================================

export async function generateTags(
  title: string,
  content: string
): Promise<string[]> {
  try {
    const inputText = `Title: ${title}\n\nContent: ${content}`.slice(0, 4000);
    const model = genAI.getGenerativeModel({ model: MODELS.chat });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${PROMPTS.autoTag}\n\n${inputText}` }] }],
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.3,
      },
    });

    const tagsString = result.response.text().trim();
    
    // Parse the JSON array
    try {
      const tags = JSON.parse(tagsString);
      if (Array.isArray(tags)) {
        return tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => tag.toLowerCase().trim())
          .slice(0, 7);
      }
    } catch {
      // If JSON parsing fails, try to extract tags from the text
      const matches = tagsString.match(/["']([^"']+)["']/g);
      if (matches) {
        return matches
          .map((m) => m.replace(/["']/g, '').toLowerCase().trim())
          .slice(0, 7);
      }
    }

    return [];
  } catch (error) {
    console.error('Error generating tags:', error);
    throw new Error('Failed to generate tags');
  }
}

// =============================================================================
// CONVERSATIONAL QUERY
// =============================================================================

interface QueryContext {
  title: string;
  content: string;
  summary: string | null;
}

export async function queryKnowledge(
  question: string,
  context: QueryContext[]
): Promise<{ answer: string; tokensUsed: number }> {
  try {
    // Format context for the prompt
    const formattedContext = context
      .map(
        (item, i) =>
          `[${i + 1}] ${item.title}\n${item.summary || item.content.slice(0, 500)}`
      )
      .join('\n\n---\n\n');

    const systemPrompt = PROMPTS.query.replace('{context}', formattedContext);
    const model = genAI.getGenerativeModel({ model: MODELS.query });

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\nUser question: ${question}` }] }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.5,
      },
    });

    const answer = result.response.text().trim();
    // Gemini doesn't provide token count in the same way, estimate it
    const tokensUsed = Math.ceil((systemPrompt.length + question.length + answer.length) / 4);

    return { answer, tokensUsed };
  } catch (error: any) {
    console.error('Error querying knowledge:', error);
    const message = error?.message || 'Failed to query knowledge base';
    if (message.includes('quota') || message.includes('rate')) {
      throw new Error('Gemini API quota exceeded. Please check your usage at aistudio.google.com');
    }
    throw new Error(message);
  }
}

// =============================================================================
// BATCH PROCESSING (for efficiency)
// =============================================================================

export async function processNewKnowledge(
  title: string,
  content: string
): Promise<{
  summary: string;
  tags: string[];
  embedding: number[] | null;
}> {
  // FIX: Run AI operations with fallbacks for stability
  let summary = '';
  let tags: string[] = [];
  let embedding: number[] | null = null;

  // Try to generate summary - fallback to first 200 chars
  try {
    summary = await generateSummary(title, content);
  } catch (error) {
    console.warn('[AI] Summary generation failed, using fallback');
    summary = content.slice(0, 200) + (content.length > 200 ? '...' : '');
  }

  // Try to generate tags - fallback to empty array
  try {
    tags = await generateTags(title, content);
  } catch (error) {
    console.warn('[AI] Tag generation failed, using empty tags');
    tags = [];
  }

  // Try to generate embedding - fallback to null (text search will be used)
  try {
    embedding = await generateEmbedding(`${title}\n\n${content}`);
  } catch (error) {
    console.warn('[AI] Embedding generation failed, will use text search');
    embedding = null;
  }

  return { summary, tags, embedding };
}

// =============================================================================
// EXPORTS
// =============================================================================

export { PROMPTS, MODELS };
