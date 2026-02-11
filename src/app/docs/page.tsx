'use client';

import { motion } from 'framer-motion';
import {
  FileText,
  Database,
  Brain,
  Code,
  Layers,
  Zap,
  Users,
  RefreshCw,
  ExternalLink,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// DOCUMENTATION PAGE
// =============================================================================

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-surface-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 text-surface-400 text-sm mb-4">
              <FileText className="h-4 w-4" />
              Documentation
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Second Brain Architecture
            </h1>
            <p className="text-xl text-surface-300 leading-relaxed">
              A comprehensive guide to the system architecture, design decisions,
              and principles behind this AI-powered knowledge management system.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="border-b border-surface-200 bg-surface-50 sticky top-16 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-6 py-4 overflow-x-auto scrollbar-hide">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-sm font-medium text-surface-600 hover:text-brand-600 whitespace-nowrap transition-colors"
              >
                {section.title}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="prose prose-lg max-w-none">
          {/* Section: Architecture Overview */}
          <Section id="architecture" icon={Layers} title="Portable Architecture">
            <p>
              Second Brain is built with a modular, swappable architecture that
              separates concerns across distinct layers. This design ensures
              flexibility, testability, and the ability to evolve each component
              independently.
            </p>

            <h3>System Layers</h3>
            <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
              <LayerCard
                title="Frontend Layer"
                tech="Next.js + React + Tailwind"
                description="Handles UI rendering, user interactions, and client-side state. Can be swapped for any React-based framework."
              />
              <LayerCard
                title="API Layer"
                tech="Next.js API Routes"
                description="RESTful endpoints for data operations. Easily migrated to Express, Fastify, or serverless functions."
              />
              <LayerCard
                title="AI Service Layer"
                tech="OpenAI (swappable)"
                description="Abstracted AI operations. The ai.ts module can be swapped for Claude, Gemini, or local models."
              />
              <LayerCard
                title="Data Layer"
                tech="Supabase PostgreSQL + pgvector"
                description="Persistent storage with vector capabilities. Can migrate to any PostgreSQL or vector database."
              />
            </div>

            <h3>Swappability Design</h3>
            <p>
              Each layer communicates through well-defined interfaces:
            </p>
            <ul>
              <li>
                <strong>AI Provider:</strong> Change <code>src/lib/ai.ts</code> to use
                different models. The interface remains: <code>generateSummary()</code>,
                <code>generateTags()</code>, <code>generateEmbedding()</code>
              </li>
              <li>
                <strong>Database:</strong> Swap Supabase client in <code>src/lib/supabase.ts</code>.
                All queries use typed interfaces for easy migration.
              </li>
              <li>
                <strong>UI Components:</strong> Component library in <code>src/components/ui/</code>
                can be replaced with shadcn, Chakra, or custom components.
              </li>
            </ul>

            <CodeBlock title="AI Service Interface (Swappable)">
{`// src/lib/ai.ts - Swap OpenAI for any provider
export async function generateSummary(title: string, content: string): Promise<string>
export async function generateTags(title: string, content: string): Promise<string[]>
export async function generateEmbedding(text: string): Promise<number[]>
export async function queryKnowledge(question: string, context: Context[]): Promise<Answer>`}
            </CodeBlock>
          </Section>

          {/* Section: Database Schema */}
          <Section id="database" icon={Database} title="Database Schema">
            <p>
              The database is designed for efficient storage and retrieval of knowledge
              items with support for full-text and semantic (vector) search.
            </p>

            <h3>Core Tables</h3>
            <CodeBlock title="Knowledge Items Table">
{`CREATE TABLE knowledge_items (
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
);`}
            </CodeBlock>

            <h3>Search Functions</h3>
            <p>
              Two specialized functions enable hybrid search:
            </p>
            <ul>
              <li>
                <code>search_knowledge_semantic()</code> — Vector similarity search using pgvector
              </li>
              <li>
                <code>search_knowledge_text()</code> — Full-text search with PostgreSQL tsvector
              </li>
            </ul>

            <h3>Indexing Strategy</h3>
            <div className="not-prose my-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-100">
                    <th className="p-3 text-left border">Index</th>
                    <th className="p-3 text-left border">Purpose</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border font-mono text-xs">idx_knowledge_items_type</td>
                    <td className="p-3 border">Filter by content type</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-mono text-xs">idx_knowledge_items_created_at</td>
                    <td className="p-3 border">Chronological sorting</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-mono text-xs">idx_knowledge_items_*_tags (GIN)</td>
                    <td className="p-3 border">Array containment for tags</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-mono text-xs">idx_knowledge_items_fts (GIN)</td>
                    <td className="p-3 border">Full-text search</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section: AI Prompts */}
          <Section id="ai-prompts" icon={Brain} title="AI Prompt Design">
            <p>
              The system uses carefully crafted prompts to ensure consistent,
              high-quality AI outputs. All prompts are centralized in <code>src/lib/ai.ts</code>.
            </p>

            <h3>Summarization Prompt</h3>
            <CodeBlock title="Summary Generation">
{`You are a knowledge summarization assistant. Your task is to create 
a concise, informative summary of the provided content.

Guidelines:
- Create a 1-3 sentence summary that captures the key insight
- Focus on what makes this knowledge valuable or actionable
- Use clear, professional language
- Do not include phrases like "This note discusses..."
- Start directly with the core information`}
            </CodeBlock>

            <h3>Auto-Tagging Prompt</h3>
            <CodeBlock title="Tag Generation">
{`You are a knowledge tagging assistant. Analyze the provided content 
and generate relevant tags.

Guidelines:
- Generate 3-7 tags that categorize the content
- Use lowercase, single words or hyphenated-phrases
- Focus on: topic, domain, concepts, and actionability
- Include both specific and general tags
- Avoid overly generic tags like "information" or "content"

Return ONLY a JSON array of strings, nothing else.
Example: ["machine-learning", "python", "tutorial", "beginner"]`}
            </CodeBlock>

            <h3>Query Response Prompt</h3>
            <CodeBlock title="Knowledge Query">
{`You are a knowledgeable assistant helping users explore their personal 
knowledge base. You have access to relevant notes, links, and insights 
from their "Second Brain."

Guidelines:
- Answer based ONLY on the provided context
- If the context doesn't contain enough information, say so honestly
- Reference specific pieces of knowledge when relevant
- Be concise but thorough
- If asked about something not in the knowledge base, suggest what 
  topics might be worth capturing`}
            </CodeBlock>

            <h3>Design Decisions</h3>
            <ul>
              <li>
                <strong>Low temperature (0.3):</strong> Used for summaries and tags to ensure
                consistent, predictable outputs
              </li>
              <li>
                <strong>Moderate temperature (0.5):</strong> Used for queries to allow more
                natural, conversational responses
              </li>
              <li>
                <strong>Token limits:</strong> Strictly enforced to control costs and response times
              </li>
            </ul>
          </Section>

          {/* Section: UX Principles */}
          <Section id="ux-principles" icon={Users} title="Principles-Based UX">
            <p>
              The user experience is guided by five core principles that shape
              how AI features are presented and how users interact with the system.
            </p>

            <div className="not-prose space-y-6 my-8">
              <PrincipleCard
                number={1}
                title="Transparency Over Magic"
                description="AI-generated content is always labeled. Users can see which tags are AI-suggested vs. user-created, and summaries are marked with a sparkle icon. This builds trust and helps users understand the system's capabilities."
              />
              <PrincipleCard
                number={2}
                title="Progressive Enhancement"
                description="The system works without AI. Users can capture and search knowledge using traditional methods. AI features enhance but don't gate the core experience."
              />
              <PrincipleCard
                number={3}
                title="Graceful Degradation"
                description="When AI services are unavailable, the system continues to function. Items are saved without AI processing and can be enhanced later through background jobs."
              />
              <PrincipleCard
                number={4}
                title="User Control"
                description="Users can add, modify, or remove AI-generated tags. The system suggests, but humans decide. This maintains user agency while leveraging AI capabilities."
              />
              <PrincipleCard
                number={5}
                title="Contextual Intelligence"
                description="AI responses reference the user's own knowledge. This creates a personalized experience where the system genuinely 'knows' what the user has learned."
              />
            </div>
          </Section>

          {/* Section: Agent Thinking */}
          <Section id="agent-thinking" icon={RefreshCw} title="Agent Thinking">
            <p>
              The system is designed to improve over time through intelligent
              caching, stored computations, and reduced redundant AI calls.
            </p>

            <h3>Stored Intelligence</h3>
            <ul>
              <li>
                <strong>Embeddings are persisted:</strong> Each knowledge item&apos;s vector
                embedding is stored in the database. This eliminates re-computation
                during search operations.
              </li>
              <li>
                <strong>Summaries are cached:</strong> AI-generated summaries are stored
                with items, reducing API calls for display operations.
              </li>
              <li>
                <strong>Tags are permanent:</strong> Once generated, AI tags persist and
                contribute to the system&apos;s classification without re-analysis.
              </li>
            </ul>

            <h3>Efficiency Optimizations</h3>
            <div className="not-prose my-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-100">
                    <th className="p-3 text-left border">Strategy</th>
                    <th className="p-3 text-left border">Implementation</th>
                    <th className="p-3 text-left border">Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border">Parallel Processing</td>
                    <td className="p-3 border font-mono text-xs">Promise.all([summary, tags, embedding])</td>
                    <td className="p-3 border">3x faster AI processing</td>
                  </tr>
                  <tr>
                    <td className="p-3 border">Query Logging</td>
                    <td className="p-3 border">Store responses in query_logs table</td>
                    <td className="p-3 border">Cache similar queries</td>
                  </tr>
                  <tr>
                    <td className="p-3 border">Hybrid Search</td>
                    <td className="p-3 border">Text fallback when semantic fails</td>
                    <td className="p-3 border">Resilient search experience</td>
                  </tr>
                  <tr>
                    <td className="p-3 border">Debounced Search</td>
                    <td className="p-3 border">300ms debounce on input</td>
                    <td className="p-3 border">Reduced API calls</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3>Learning Loop</h3>
            <p>
              The system creates a positive feedback loop:
            </p>
            <ol>
              <li>User captures knowledge → AI processes and stores embeddings</li>
              <li>More knowledge → Better semantic search accuracy</li>
              <li>Query responses improve with more contextual data</li>
              <li>Usage patterns inform future optimizations</li>
            </ol>
          </Section>

          {/* Section: Public API */}
          <Section id="public-api" icon={Code} title="Infrastructure & Public API">
            <p>
              The system exposes a public API for programmatic access to the
              knowledge base, enabling integrations and embeddable features.
            </p>

            <h3>API Endpoint</h3>
            <CodeBlock title="GET /api/public/brain/query">
{`// Request
GET /api/public/brain/query?q=What+are+mental+models&limit=5

// Response
{
  "success": true,
  "data": {
    "answer": "Based on your knowledge base, mental models are...",
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
}`}
            </CodeBlock>

            <h3>API Design Principles</h3>
            <ul>
              <li>
                <strong>Stateless:</strong> Each request is self-contained with no session
                dependencies
              </li>
              <li>
                <strong>CORS-enabled:</strong> Allows cross-origin requests for embeddable use
              </li>
              <li>
                <strong>Rate-limited:</strong> Configurable limits to prevent abuse
              </li>
              <li>
                <strong>Usage tracking:</strong> All requests are logged for analytics
              </li>
            </ul>

            <h3>Embeddable Potential</h3>
            <p>
              The public API enables several integration scenarios:
            </p>
            <ul>
              <li>Widget embedded in personal websites</li>
              <li>Slack/Discord bot integration</li>
              <li>Browser extension for quick queries</li>
              <li>Mobile app companion</li>
            </ul>

            <h3>Future API Endpoints</h3>
            <div className="not-prose my-6">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-surface-100">
                    <th className="p-3 text-left border">Endpoint</th>
                    <th className="p-3 text-left border">Purpose</th>
                    <th className="p-3 text-left border">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 border font-mono text-xs">GET /api/public/brain/query</td>
                    <td className="p-3 border">Query with AI response</td>
                    <td className="p-3 border text-green-600">Implemented</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-mono text-xs">GET /api/public/brain/search</td>
                    <td className="p-3 border">Semantic search without AI</td>
                    <td className="p-3 border text-yellow-600">Planned</td>
                  </tr>
                  <tr>
                    <td className="p-3 border font-mono text-xs">GET /api/public/brain/stats</td>
                    <td className="p-3 border">Knowledge base statistics</td>
                    <td className="p-3 border text-yellow-600">Planned</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Section>

          {/* Section: Tech Stack */}
          <Section id="tech-stack" icon={Zap} title="Technology Stack">
            <div className="not-prose grid md:grid-cols-2 gap-4 my-6">
              <TechCard category="Frontend" items={[
                'Next.js 14 (App Router)',
                'React 18',
                'Tailwind CSS',
                'Framer Motion',
              ]} />
              <TechCard category="Backend" items={[
                'Next.js API Routes',
                'Node.js',
                'Zod validation',
              ]} />
              <TechCard category="Database" items={[
                'Supabase (PostgreSQL)',
                'pgvector extension',
                'Full-text search (tsvector)',
              ]} />
              <TechCard category="AI" items={[
                'OpenAI GPT-4o-mini',
                'text-embedding-ada-002',
                'Server-side only',
              ]} />
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

const sections = [
  { id: 'architecture', title: 'Architecture' },
  { id: 'database', title: 'Database' },
  { id: 'ai-prompts', title: 'AI Prompts' },
  { id: 'ux-principles', title: 'UX Principles' },
  { id: 'agent-thinking', title: 'Agent Thinking' },
  { id: 'public-api', title: 'Public API' },
  { id: 'tech-stack', title: 'Tech Stack' },
];

function Section({
  id,
  icon: Icon,
  title,
  children,
}: {
  id: string;
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 mb-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-100 rounded-lg">
            <Icon className="h-5 w-5 text-brand-600" />
          </div>
          <h2 className="text-2xl font-bold text-surface-900 m-0">{title}</h2>
        </div>
        {children}
      </motion.div>
    </section>
  );
}

function CodeBlock({ title, children }: { title: string; children: string }) {
  return (
    <div className="not-prose my-6">
      <div className="bg-surface-900 rounded-xl overflow-hidden">
        <div className="px-4 py-2 bg-surface-800 text-xs text-surface-400 border-b border-surface-700">
          {title}
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-sm text-surface-200">{children}</code>
        </pre>
      </div>
    </div>
  );
}

function LayerCard({
  title,
  tech,
  description,
}: {
  title: string;
  tech: string;
  description: string;
}) {
  return (
    <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
      <h4 className="font-semibold text-surface-900">{title}</h4>
      <p className="text-xs text-brand-600 font-medium mt-0.5">{tech}</p>
      <p className="text-sm text-surface-600 mt-2">{description}</p>
    </div>
  );
}

function PrincipleCard({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 p-5 bg-surface-50 rounded-xl border border-surface-200">
      <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold flex-shrink-0">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-surface-900">{title}</h4>
        <p className="text-sm text-surface-600 mt-1">{description}</p>
      </div>
    </div>
  );
}

function TechCard({ category, items }: { category: string; items: string[] }) {
  return (
    <div className="p-4 bg-surface-50 rounded-xl border border-surface-200">
      <h4 className="font-semibold text-surface-900 mb-3">{category}</h4>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-surface-600">
            <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
