'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Brain,
  Sparkles,
  Search,
  Tags,
  MessageSquare,
  Zap,
  ArrowRight,
  Code,
  Database,
} from 'lucide-react';
import { Button, MotionButton } from '@/components/ui';
import { KnowledgeCaptureModal } from '@/components/knowledge';

// =============================================================================
// LANDING PAGE
// =============================================================================

export default function HomePage() {
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 rounded-full text-brand-700 text-sm font-medium mb-8"
            >
              <Sparkles className="h-4 w-4" />
              AI-Powered Knowledge Management
            </motion.div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl font-bold text-surface-900 leading-tight mb-6">
              Your{' '}
              <span className="gradient-text">Second Brain</span>
              <br />
              for Everything You Learn
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-surface-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Capture notes, links, and insights. Let AI summarize, tag, and help you
              query your knowledge effortlessly. Build a searchable repository of
              everything you know.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <MotionButton
                size="lg"
                onClick={() => setIsCaptureOpen(true)}
                className="w-full sm:w-auto"
              >
                <Sparkles className="h-5 w-5" />
                Start Capturing
              </MotionButton>
              <Link href="/dashboard">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  View Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.4, duration: 1 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-brand-400/10 to-purple-400/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              Everything Your Knowledge Needs
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              Powerful features designed to help you capture, organize, and retrieve
              your knowledge with the help of AI.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl border border-surface-200 hover:border-brand-200 hover:shadow-soft transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${feature.iconBg}`}
                >
                  <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-surface-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              Three simple steps to build your personal knowledge system
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-surface-200" />
                )}
                <div className="relative bg-white rounded-2xl p-6 shadow-soft">
                  <div className="w-16 h-16 rounded-2xl bg-brand-600 text-white flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                    {index + 1}
                  </div>
                  <h3 className="text-lg font-semibold text-surface-900 mb-2 text-center">
                    {step.title}
                  </h3>
                  <p className="text-surface-600 text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full text-green-700 text-sm font-medium mb-4">
                <Code className="h-4 w-4" />
                Public API
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
                Query Your Brain Programmatically
              </h2>
              <p className="text-lg text-surface-600 mb-6 leading-relaxed">
                Access your knowledge base through our public API. Build integrations,
                chatbots, or embed intelligent search into your own applications.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-surface-700">
                  <Zap className="h-5 w-5 text-brand-600" />
                  <span>Semantic search powered by embeddings</span>
                </div>
                <div className="flex items-center gap-3 text-surface-700">
                  <MessageSquare className="h-5 w-5 text-brand-600" />
                  <span>AI-generated answers with source references</span>
                </div>
                <div className="flex items-center gap-3 text-surface-700">
                  <Database className="h-5 w-5 text-brand-600" />
                  <span>RESTful endpoints with JSON responses</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-surface-900 rounded-2xl p-6 overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <pre className="text-sm text-surface-300 overflow-x-auto">
                <code>{`GET /api/public/brain/query?q=machine+learning

{
  "success": true,
  "data": {
    "answer": "Based on your knowledge base...",
    "sources": [
      {
        "id": "abc123",
        "title": "Introduction to ML",
        "relevance": 0.92
      }
    ],
    "tokens_used": 450
  }
}`}</code>
              </pre>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-brand-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Brain className="h-16 w-16 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Build Your Second Brain?
            </h2>
            <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
              Start capturing your knowledge today. Every note, link, and insight
              becomes part of your searchable, AI-enhanced knowledge system.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setIsCaptureOpen(true)}
                className="w-full sm:w-auto bg-white text-brand-700 hover:bg-brand-50"
              >
                <Sparkles className="h-5 w-5" />
                Get Started Free
              </Button>
              <Link href="/docs">
                <Button
                  size="lg"
                  variant="ghost"
                  className="w-full sm:w-auto text-white hover:bg-brand-500"
                >
                  Read Documentation
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Capture Modal */}
      <KnowledgeCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
      />
    </>
  );
}

// =============================================================================
// DATA
// =============================================================================

const features = [
  {
    icon: Brain,
    title: 'Smart Capture',
    description:
      'Capture notes, links, and insights with a simple form. Add your own tags or let AI generate them automatically.',
    iconBg: 'bg-brand-100',
    iconColor: 'text-brand-600',
  },
  {
    icon: Sparkles,
    title: 'AI Summarization',
    description:
      'Every piece of knowledge is automatically summarized by AI, making it easy to scan and find what you need.',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    icon: Tags,
    title: 'Auto-Tagging',
    description:
      'AI analyzes your content and suggests relevant tags, keeping your knowledge organized without manual effort.',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    icon: Search,
    title: 'Semantic Search',
    description:
      'Find knowledge by meaning, not just keywords. Our vector search understands what you\'re looking for.',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-600',
  },
  {
    icon: MessageSquare,
    title: 'Conversational Query',
    description:
      'Ask questions in natural language and get AI-powered answers based on your personal knowledge base.',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    icon: Code,
    title: 'Public API',
    description:
      'Access your knowledge programmatically. Build integrations, bots, or embed search into your own apps.',
    iconBg: 'bg-pink-100',
    iconColor: 'text-pink-600',
  },
];

const steps = [
  {
    title: 'Capture',
    description:
      'Add notes, links, and insights to your Second Brain. Include source URLs and your own tags.',
  },
  {
    title: 'Process',
    description:
      'AI automatically generates summaries, suggests tags, and creates embeddings for semantic search.',
  },
  {
    title: 'Query',
    description:
      'Search your knowledge naturally or ask questions. Get AI-powered answers with source references.',
  },
];
