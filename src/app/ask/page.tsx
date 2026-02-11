'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Bot,
  User,
  Loader2,
  ExternalLink,
  Sparkles,
  Brain,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

// =============================================================================
// ASK AI PAGE
// =============================================================================

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{
    id: string;
    title: string;
    summary: string | null;
    relevance: number;
  }>;
  timestamp: Date;
}

export default function AskPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/public/brain/query?q=${encodeURIComponent(userMessage.content)}`
      );
      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.answer,
          sources: data.data.sources,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      // FIX START - Show actual error message
      const errorText = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Ask AI error:', errorText);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I encountered an error: ${errorText}. Please check your configuration and try again.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
      // FIX END
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <MessageSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-surface-900">
                Ask Your Second Brain
              </h1>
              <p className="text-sm text-surface-600">
                Query your knowledge with natural language
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {messages.length === 0 ? (
            <EmptyChat onSuggestionClick={(text) => setInput(text)} />
          ) : (
            <div className="space-y-6">
              <AnimatePresence>
                {messages.map((message) => (
                  <ChatMessage key={message.id} message={message} />
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3"
                >
                  <div className="p-2 bg-purple-100 rounded-xl">
                    <Bot className="h-5 w-5 text-purple-600" />
                  </div>
                  {/* FIX START - Enhanced loading skeleton */}
                  <div className="py-3 px-4 bg-white rounded-2xl shadow-soft space-y-2 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                      <span className="text-surface-600 font-medium">Searching your knowledge...</span>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-surface-100 rounded animate-pulse w-full"></div>
                      <div className="h-3 bg-surface-100 rounded animate-pulse w-3/4"></div>
                    </div>
                  </div>
                  {/* FIX END */}
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      {/* FIX START - Enhanced input area */}
      <div className="bg-white border-t border-surface-200 p-4 shadow-lg">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about your knowledge..."
                disabled={isLoading}
                className={cn(
                  'w-full px-5 py-3.5 rounded-xl',
                  'border-2 border-surface-200 bg-white',
                  'text-surface-900 placeholder-surface-400',
                  'focus:outline-none focus:ring-0 focus:border-purple-500',
                  'transition-colors duration-200',
                  'disabled:opacity-50 disabled:bg-surface-50'
                )}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-purple-600 hover:bg-purple-700 h-12 px-5 transition-all duration-200 disabled:opacity-40"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-surface-400 mt-2 text-center">
            Press Enter to send • Responses are based on your saved knowledge
          </p>
        </form>
      </div>
      {/* FIX END */}
    </div>
  );
}

// =============================================================================
// CHAT MESSAGE COMPONENT
// =============================================================================

function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'p-2 rounded-xl flex-shrink-0',
          isUser ? 'bg-brand-100' : 'bg-purple-100'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-brand-600" />
        ) : (
          <Bot className="h-5 w-5 text-purple-600" />
        )}
      </div>

      <div
        className={cn(
          'max-w-[80%] space-y-3',
          isUser && 'flex flex-col items-end'
        )}
      >
        <div
          className={cn(
            'py-3 px-4 rounded-2xl',
            isUser
              ? 'bg-brand-600 text-white'
              : 'bg-white shadow-soft text-surface-700'
          )}
        >
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <div className="space-y-2 w-full">
            <div className="flex items-center gap-1.5 text-xs text-surface-500">
              <Sparkles className="h-3 w-3" />
              <span>Based on {message.sources.length} source(s)</span>
            </div>
            <div className="grid gap-2">
              {message.sources.slice(0, 3).map((source) => (
                <Card key={source.id} className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-surface-900 truncate">
                        {source.title}
                      </p>
                      {source.summary && (
                        <p className="text-xs text-surface-500 mt-0.5 line-clamp-2">
                          {source.summary}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-purple-600 font-medium">
                      {Math.round(source.relevance * 100)}%
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// EMPTY CHAT COMPONENT
// =============================================================================

// FIX START - Make suggestions clickable
interface EmptyChatProps {
  onSuggestionClick: (text: string) => void;
}

function EmptyChat({ onSuggestionClick }: EmptyChatProps) {
  const suggestions = [
    'What are the key concepts I have learned about machine learning?',
    'Summarize my notes on productivity',
    'What links have I saved about design systems?',
    'What are my main insights this month?',
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center h-full py-16"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="p-5 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl mb-6 shadow-sm"
      >
        <Brain className="h-14 w-14 text-purple-600" />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-surface-900 mb-3"
      >
        Ask Your Second Brain
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-surface-600 text-center max-w-md mb-10 leading-relaxed"
      >
        I can help you explore and understand your captured knowledge.
        Ask me anything about your notes, links, and insights.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3 w-full max-w-lg"
      >
        <p className="text-sm font-medium text-surface-500 text-center mb-4">
          Try asking:
        </p>
        <div className="grid gap-2">
          {suggestions.map((suggestion, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              onClick={() => onSuggestionClick(suggestion)}
              className={cn(
                'text-left px-5 py-4 rounded-xl',
                'bg-white border-2 border-surface-200',
                'text-surface-700 text-sm',
                'hover:border-purple-400 hover:bg-purple-50 hover:shadow-sm',
                'focus:outline-none focus:border-purple-500',
                'transition-all duration-200 group'
              )}
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                &ldquo;{suggestion}&rdquo;
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
// FIX END