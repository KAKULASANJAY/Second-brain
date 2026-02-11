# Second Brain — Architecture & Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Portable Architecture](#portable-architecture)
3. [Database Schema](#database-schema)
4. [AI Prompt Design](#ai-prompt-design)
5. [Principles-Based UX](#principles-based-ux)
6. [Agent Thinking](#agent-thinking)
7. [Public API & Infrastructure](#public-api--infrastructure)
8. [Deployment Guide](#deployment-guide)

---

## System Overview

Second Brain is an AI-powered knowledge management system that allows users to:
- Capture notes, links, and insights
- Automatically generate summaries and tags using AI
- Search content semantically (by meaning) and textually
- Query their knowledge base conversationally
- Access intelligence via a public API

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Landing    │  │  Dashboard  │  │  Knowledge Capture      │  │
│  │  Page       │  │  + Search   │  │  Form                   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│                              │                                   │
│                    Framer Motion + Tailwind CSS                  │
└──────────────────────────────┼───────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │   API Layer         │
                    │   (Next.js Routes)  │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼────────┐  ┌─────────▼────────┐  ┌────────▼────────┐
│  AI Service     │  │  Knowledge       │  │  Public API     │
│  (OpenAI)       │  │  Service         │  │  /api/public/*  │
│  - Summarize    │  │  - CRUD          │  │  - Query        │
│  - Auto-tag     │  │  - Search        │  │  - Sources      │
│  - Query        │  │  - Embeddings    │  │                 │
└────────┬────────┘  └─────────┬────────┘  └─────────────────┘
         │                     │
         └──────────┬──────────┘
                    │
         ┌──────────▼──────────┐
         │   Supabase          │
         │   PostgreSQL        │
         │   + pgvector        │
         └─────────────────────┘
```

---

## Portable Architecture

### Design Philosophy

The system is built with **swappability** as a core principle. Each layer communicates through well-defined interfaces, making it possible to replace any component without affecting others.

### Layer Breakdown

| Layer | Technology | Swappable To |
|-------|------------|--------------|
| Frontend | Next.js + React | Remix, Vue, vanilla React |
| Styling | Tailwind CSS | CSS-in-JS, styled-components |
| API | Next.js API Routes | Express, Fastify, AWS Lambda |
| AI | OpenAI | Claude, Gemini, local LLMs |
| Database | Supabase PostgreSQL | Any PostgreSQL, Neon, PlanetScale |
| Vectors | pgvector | Pinecone, Weaviate, Qdrant |

### Interface Contracts

**AI Service Interface (`src/lib/ai.ts`):**
```typescript
// These functions can be implemented with any AI provider
export async function generateSummary(title: string, content: string): Promise<string>
export async function generateTags(title: string, content: string): Promise<string[]>
export async function generateEmbedding(text: string): Promise<number[]>
export async function queryKnowledge(question: string, context: Context[]): Promise<Answer>
```

**Database Interface (`src/lib/supabase.ts`):**
```typescript
// Standard CRUD + search operations
interface KnowledgeService {
  create(item: KnowledgeItemInsert): Promise<KnowledgeItem>
  read(id: string): Promise<KnowledgeItem>
  update(id: string, data: KnowledgeItemUpdate): Promise<KnowledgeItem>
  delete(id: string): Promise<void>
  searchSemantic(embedding: number[], threshold: number): Promise<KnowledgeItem[]>
  searchText(query: string): Promise<KnowledgeItem[]>
}
```

---

## Database Schema

### Core Table: `knowledge_items`

```sql
CREATE TABLE knowledge_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title           VARCHAR(500) NOT NULL,
    content         TEXT NOT NULL,
    type            VARCHAR(20) CHECK (type IN ('note', 'link', 'insight')),
    source_url      TEXT,
    summary         TEXT,                    -- AI-generated
    ai_tags         TEXT[] DEFAULT '{}',     -- AI-generated  
    user_tags       TEXT[] DEFAULT '{}',     -- User-provided
    embedding       vector(768),             -- For semantic search (Gemini)
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ              -- Soft delete
);
```

### Supporting Tables

**`query_logs`** — Stores query history for analytics and caching:
```sql
CREATE TABLE query_logs (
    id              UUID PRIMARY KEY,
    query_text      TEXT NOT NULL,
    query_embedding vector(768),
    response        TEXT,
    source_ids      UUID[],
    tokens_used     INTEGER,
    response_time_ms INTEGER,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**`api_usage`** — Tracks API usage for rate limiting:
```sql
CREATE TABLE api_usage (
    id              UUID PRIMARY KEY,
    api_key_hash    VARCHAR(64),
    endpoint        VARCHAR(100),
    ip_address      INET,
    created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### Indexes

| Index | Type | Purpose |
|-------|------|---------|
| `idx_knowledge_items_type` | B-tree | Filter by content type |
| `idx_knowledge_items_created_at` | B-tree | Chronological sorting |
| `idx_knowledge_items_user_tags` | GIN | Tag containment queries |
| `idx_knowledge_items_ai_tags` | GIN | Tag containment queries |
| `idx_knowledge_items_fts` | GIN (tsvector) | Full-text search |
| `idx_knowledge_items_embedding` | IVFFlat | Vector similarity (after 100+ rows) |

---

## AI Prompt Design

### Summarization Prompt

**Goal:** Create concise, informative summaries that capture the essence of knowledge items.

```
You are a knowledge summarization assistant. Your task is to create 
a concise, informative summary of the provided content.

Guidelines:
- Create a 1-3 sentence summary that captures the key insight
- Focus on what makes this knowledge valuable or actionable
- Use clear, professional language
- Do not include phrases like "This note discusses..."
- Start directly with the core information
```

**Parameters:**
- Model: `gpt-4o-mini`
- Temperature: `0.3` (low for consistency)
- Max tokens: `200`

### Auto-Tagging Prompt

**Goal:** Generate relevant, categorizing tags without user effort.

```
You are a knowledge tagging assistant. Analyze the provided content 
and generate relevant tags.

Guidelines:
- Generate 3-7 tags that categorize the content
- Use lowercase, single words or hyphenated-phrases
- Focus on: topic, domain, concepts, and actionability
- Include both specific and general tags
- Avoid overly generic tags like "information" or "content"

Return ONLY a JSON array of strings, nothing else.
Example: ["machine-learning", "python", "tutorial", "beginner"]
```

**Parameters:**
- Model: `gpt-4o-mini`
- Temperature: `0.3`
- Max tokens: `100`

### Query Response Prompt

**Goal:** Answer questions using the user's knowledge base as context.

```
You are a knowledgeable assistant helping users explore their personal 
knowledge base. You have access to relevant notes, links, and insights 
from their "Second Brain."

Guidelines:
- Answer based ONLY on the provided context
- If the context doesn't contain enough information, say so honestly
- Reference specific pieces of knowledge when relevant
- Be concise but thorough
- If asked about something not in the knowledge base, suggest what 
  topics might be worth capturing

Context from knowledge base:
{context}
```

**Parameters:**
- Model: `gpt-4o-mini`
- Temperature: `0.5` (moderate for natural responses)
- Max tokens: `500`

---

## Principles-Based UX

The user experience is guided by five core principles:

### 1. Transparency Over Magic

AI-generated content is always labeled. Users can distinguish between:
- 🏷️ Blue tags = User-created
- ✨ Purple tags = AI-generated
- ✨ Summaries marked with sparkle icon

**Why:** Builds trust and helps users understand system capabilities.

### 2. Progressive Enhancement

The core experience works without AI:
- Users can capture and search knowledge using text
- AI features enhance but don't gate functionality
- Semantic search falls back to text search

**Why:** Ensures reliability and reduces dependency on external services.

### 3. Graceful Degradation

When AI services are unavailable:
- Items are saved without AI processing
- Existing summaries/tags remain accessible
- Background jobs can process items later

**Why:** System availability is more important than AI features.

### 4. User Control

Users maintain agency:
- Can add, modify, or remove AI-generated tags
- Can edit AI summaries
- Decide what to capture and what to ignore

**Why:** AI should augment, not replace, human judgment.

### 5. Contextual Intelligence

Responses reference user's own knowledge:
- Query answers cite specific sources
- Relevance scores show match confidence
- Suggestions based on actual content

**Why:** Creates a personalized, meaningful experience.

---

## Agent Thinking

### How the System Gets Smarter

The system implements several strategies to improve over time without increasing costs:

#### 1. Stored Computations

| Computation | Storage | Reuse |
|-------------|---------|-------|
| Embeddings | `knowledge_items.embedding` | Every search operation |
| Summaries | `knowledge_items.summary` | Display without AI calls |
| Tags | `knowledge_items.ai_tags` | Filtering and organization |
| Query responses | `query_logs.response` | Cache similar queries |

#### 2. Efficiency Optimizations

**Parallel Processing:**
```typescript
// All AI operations run simultaneously
const [summary, tags, embedding] = await Promise.all([
  generateSummary(title, content),
  generateTags(title, content),
  generateEmbedding(`${title}\n\n${content}`),
]);
```

**Debounced Search:**
- 300ms debounce on search input
- Prevents unnecessary API calls during typing

**Hybrid Search:**
- Semantic search with text fallback
- Ensures results even when embeddings fail

#### 3. Learning Loop

```
User captures knowledge
        ↓
AI processes (summary, tags, embedding)
        ↓
Stored in database
        ↓
More knowledge = better search accuracy
        ↓
Query responses improve with context
        ↓
Usage patterns inform optimizations
```

#### 4. Query Caching Strategy

The `query_logs` table enables:
- Finding similar past queries via embedding similarity
- Returning cached responses for repeated questions
- Analyzing common query patterns

---

## Public API & Infrastructure

### Endpoint: Query Knowledge Base

```
GET /api/public/brain/query?q={question}&limit={number}
```

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | Yes | - | Natural language question |
| `limit` | number | No | 5 | Max sources to include |

**Response:**
```json
{
  "success": true,
  "data": {
    "answer": "Based on your knowledge base, mental models are frameworks for thinking that help us understand how things work...",
    "sources": [
      {
        "id": "uuid-1234",
        "title": "Why Mental Models Matter",
        "summary": "Mental models are frameworks for thinking...",
        "relevance": 0.92
      }
    ],
    "tokens_used": 450
  }
}
```

### Design Principles

1. **Stateless:** Each request is self-contained
2. **CORS-enabled:** Allows cross-origin requests
3. **Rate-limited:** Configurable via `PUBLIC_API_RATE_LIMIT`
4. **Logged:** All requests tracked in `api_usage` table

### Integration Scenarios

| Use Case | Implementation |
|----------|----------------|
| Personal website widget | Embed query interface |
| Slack bot | Webhook to API endpoint |
| Browser extension | Quick query popup |
| Mobile companion | REST API client |
| Documentation search | Embedded in docs site |

---

## Deployment Guide

### Prerequisites

1. Node.js 18+
2. Supabase account
3. OpenAI API key
4. Vercel account (or any Node.js hosting)

### Step 1: Database Setup

1. Create a new Supabase project
2. Navigate to SQL Editor
3. Run the schema from `supabase/schema.sql`
4. Enable the `vector` extension if not already enabled

### Step 2: Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Development

```bash
npm run dev
```

### Step 5: Deploy to Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Step 6: Post-Deployment

1. Update `NEXT_PUBLIC_APP_URL` to production URL
2. Test all API endpoints
3. Monitor Supabase and OpenAI usage

---

## Future Enhancements

### Planned Features

- [ ] User authentication (Supabase Auth)
- [ ] Multi-user support with isolated knowledge bases
- [ ] Bulk import from Notion, Roam, Obsidian
- [ ] Chrome extension for quick capture
- [ ] Scheduled AI processing queue
- [ ] Knowledge graph visualization
- [ ] Export functionality (Markdown, JSON)

### Performance Optimizations

- [ ] IVFFlat index for embeddings (after 100+ items)
- [ ] Redis caching for frequent queries
- [ ] Background job processing with pg_cron
- [ ] CDN for static assets

---

## License

This project was built as a technical assignment for the Altibbe/Hedamo Full Stack Engineering Internship.
