# Second Brain 🧠

> An AI-powered knowledge management system that helps you capture, organize, and query your personal knowledge base.

**Submission for Altibbe/Hedamo Full Stack Engineering Internship**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com/)
[![Gemini](https://img.shields.io/badge/Google-Gemini-blue?style=flat-square&logo=google)](https://ai.google.dev/)

---

## 🎯 Project Overview

Second Brain is a personal knowledge management system that allows users to:
- Capture notes, links, and insights
- Automatically summarize and tag content using AI
- Query their knowledge base using natural language
- Access their data via a public REST API

This project demonstrates full-stack development capabilities including:
- Modern React (Next.js 14 App Router)
- TypeScript with strict typing
- PostgreSQL with vector extensions
- AI/LLM integration with graceful fallbacks
- Production-ready error handling

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|--------|
| 📝 Knowledge Capture | Store notes, links, and insights | ✅ Working |
| 🤖 AI Summarization | Automatic summaries via Gemini | ✅ Working |
| 🏷️ Auto-Tagging | AI-generated tags | ✅ Working |
| 🔍 Text Search | Full-text PostgreSQL search | ✅ Working |
| 🔍 Semantic Search | Vector similarity search | ⚠️ Fallback to text |
| 💬 Ask AI | Natural language queries | ✅ Working (with fallback) |
| 🌐 Public API | REST API for integrations | ✅ Working |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account ([free tier](https://supabase.com/))
- Google Gemini API key ([free tier](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/second-brain.git
cd second-brain

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Fill in your credentials in .env.local
```

### Database Setup

1. Create a new Supabase project
2. Go to SQL Editor in Supabase dashboard
3. Run the schema from `supabase/schema.sql`

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
second-brain/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── knowledge/     # CRUD operations
│   │   │   ├── search/        # Search endpoint
│   │   │   ├── tags/          # Tags aggregation
│   │   │   └── public/        # Public API
│   │   ├── dashboard/         # Dashboard page
│   │   ├── ask/               # Conversational AI page
│   │   ├── docs/              # Documentation page
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── knowledge/         # Knowledge-specific components
│   │   └── layout/            # Layout components
│   └── lib/
│       ├── ai.ts              # OpenAI integration
│       ├── supabase.ts        # Database client
│       ├── database.types.ts  # TypeScript types
│       ├── validations.ts     # Zod schemas
│       └── utils.ts           # Helper functions
├── supabase/
│   └── schema.sql             # Database schema
├── docs.md                    # Architecture documentation
└── README.md
```

## 🎯 Core Concepts

### Knowledge Types

| Type | Description | Example |
|------|-------------|---------|
| **Note** | Personal thoughts, learnings | "Key takeaways from today's meeting" |
| **Link** | Saved URLs with context | "Great article on system design" |
| **Insight** | Aha moments, realizations | "Pattern I noticed in user behavior" |

### AI Features

1. **Summarization** — Every item gets a 1-3 sentence summary
2. **Auto-Tagging** — 3-7 relevant tags generated automatically
3. **Embeddings** — Vector representations for semantic search
4. **Query Response** — Natural language answers from your knowledge

### Search Modes

- **Semantic** — Uses vector similarity to find related content
- **Text** — Traditional full-text search with PostgreSQL
- **Hybrid** — Combines both for best results (default)

## 🔌 API Reference

### Create Knowledge Item

```http
POST /api/knowledge
Content-Type: application/json

{
  "title": "My First Note",
  "content": "This is the content of my note...",
  "type": "note",
  "source_url": "https://example.com",
  "user_tags": ["productivity", "learning"]
}
```

### Search Knowledge

```http
POST /api/search
Content-Type: application/json

{
  "query": "machine learning concepts",
  "mode": "hybrid",
  "type": "note",
  "limit": 20
}
```

### Public Query (AI Response)

```http
GET /api/public/brain/query?q=What+are+mental+models&limit=5
```

Response:
```json
{
  "success": true,
  "data": {
    "answer": "Based on your knowledge base...",
    "sources": [
      { "id": "...", "title": "...", "relevance": 0.92 }
    ],
    "tokens_used": 450
  }
}
```

## 🎨 UI Components

All UI components are in `src/components/ui/`:

- `Button` — Primary action button with variants
- `Input`, `Textarea`, `Select` — Form inputs
- `Card` — Content container with hover effects
- `Tag` — Labels for categories (user/AI variants)
- `SearchInput` — Search with loading state
- `Modal` — Dialog overlay
- `EmptyState` — Placeholder for no content

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), React 18 |
| Styling | Tailwind CSS, Framer Motion |
| Backend | Next.js API Routes |
| Database | Supabase PostgreSQL + pgvector |
| AI | Google Gemini 1.5 Flash |
| Validation | Zod |
| Deployment | Vercel + Supabase |

### Key Design Decisions

1. **Server-side AI** — All AI calls happen on the server for security
2. **Soft deletes** — Items are never permanently deleted
3. **Hybrid search** — Combines semantic + text for robustness
4. **Parallel processing** — AI operations run concurrently

See [docs.md](./docs.md) for complete architecture documentation.

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [Vercel](https://vercel.com/)
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GOOGLE_GEMINI_API_KEY`
4. Deploy

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `GOOGLE_GEMINI_API_KEY` | Google Gemini API key | ✅ |

---

## ⚠️ Known Limitations

This section documents current limitations honestly for evaluation purposes.

### 1. Semantic Search Fallback

**Issue:** The Gemini embedding API (`text-embedding-004`) may return errors in some configurations.

**Current Solution:** The system automatically falls back to PostgreSQL full-text search when embeddings fail. Users still receive relevant results, though with keyword matching instead of semantic understanding.

**Production Fix:** 
- Use OpenAI's `text-embedding-ada-002` (more stable, requires paid key)
- Or use a self-hosted embedding model

### 2. AI Response Fallback

**Issue:** If the AI chat model fails, the system provides a fallback response.

**Current Solution:** Returns matched knowledge items as a formatted list instead of a conversational response.

**Production Fix:**
- Add retry logic with exponential backoff
- Implement queue-based processing for reliability

### 3. Database Schema

**Requirement:** The Supabase database must have pgvector extension enabled and the schema created manually.

**Production Fix:**
- Use database migrations (Prisma or Supabase CLI)
- Automate schema setup in deployment pipeline

---

## 🎓 What I Learned

Building this project taught me:

1. **AI Integration Patterns** — Handling API failures gracefully with fallbacks
2. **Vector Databases** — Working with pgvector for semantic search
3. **TypeScript Strictness** — Proper typing for API responses and error handling
4. **Next.js App Router** — Server components and API routes
5. **Production Mindset** — Prioritizing stability over features

---

## 📊 Performance

### Optimizations

- **Debounced search** — 300ms delay to reduce API calls
- **Parallel AI processing** — Summary, tags, embedding generated simultaneously
- **Stored embeddings** — No re-computation for search
- **Efficient indexes** — B-tree, GIN, and vector indexes

### Estimated Costs

| Operation | API Calls | Est. Cost |
|-----------|-----------|-----------|
| Add item | 3 (summary + tags + embedding) | ~$0.003 |
| Search | 1 (embedding only) | ~$0.0001 |
| Query | 2 (embedding + completion) | ~$0.005 |

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit
```

## 🔮 Future Improvements

- [ ] User authentication with Supabase Auth
- [ ] Multi-user support with isolated data
- [ ] Bulk import from Notion/Roam/Obsidian
- [ ] Chrome extension for quick capture
- [ ] Knowledge graph visualization
- [ ] Export to Markdown/JSON

## 📝 License

This project was created as a technical assignment for the **Altibbe/Hedamo Full Stack Engineering Internship**.

---

Built with ❤️ using Next.js, Supabase, and OpenAI
