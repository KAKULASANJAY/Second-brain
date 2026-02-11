'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Sparkles, Trash2 } from 'lucide-react';
import { Card, CardContent, Tag, Button } from '@/components/ui';
import { formatRelativeDate, truncate, TYPE_ICONS, extractDomain } from '@/lib/utils';
import type { KnowledgeItem } from '@/lib/database.types';

// =============================================================================
// KNOWLEDGE CARD COMPONENT
// =============================================================================

interface KnowledgeCardProps {
  item: KnowledgeItem;
  onClick?: () => void;
  onDelete?: () => void;
}

export function KnowledgeCard({ item, onClick, onDelete }: KnowledgeCardProps) {
  const allTags = [...(item.user_tags || []), ...(item.ai_tags || [])];
  const displayTags = allTags.slice(0, 5);
  const remainingTags = allTags.length - displayTags.length;

  return (
    <Card hover onClick={onClick} className="group">
      <CardContent className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <span className="text-xl flex-shrink-0" role="img" aria-label={item.type}>
              {TYPE_ICONS[item.type]}
            </span>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-surface-900 leading-tight">
                {item.title}
              </h3>
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-sm text-brand-600 hover:text-brand-700 mt-0.5"
                >
                  <ExternalLink className="h-3 w-3" />
                  {extractDomain(item.source_url)}
                </a>
              )}
            </div>
          </div>
          <Tag variant="type" type={item.type} size="sm">
            {item.type}
          </Tag>
        </div>

        {/* Summary or Content Preview */}
        <p className="text-sm text-surface-600 leading-relaxed">
          {item.summary ? (
            <>
              <Sparkles className="h-3 w-3 inline-block mr-1 text-purple-500" />
              {truncate(item.summary, 180)}
            </>
          ) : (
            truncate(item.content, 180)
          )}
        </p>

        {/* Tags */}
        {displayTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {displayTags.map((tag, i) => {
              const isAiTag = (item.ai_tags || []).includes(tag);
              return (
                <Tag
                  key={`${tag}-${i}`}
                  variant={isAiTag ? 'ai' : 'user'}
                  size="sm"
                >
                  {tag}
                </Tag>
              );
            })}
            {remainingTags > 0 && (
              <Tag size="sm">+{remainingTags} more</Tag>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-100">
          <div className="flex items-center gap-1.5 text-xs text-surface-500">
            <Calendar className="h-3 w-3" />
            {formatRelativeDate(item.created_at)}
          </div>
          
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// KNOWLEDGE LIST COMPONENT
// =============================================================================

interface KnowledgeListProps {
  items: KnowledgeItem[];
  onItemClick?: (item: KnowledgeItem) => void;
  onItemDelete?: (item: KnowledgeItem) => void;
}

export function KnowledgeList({
  items,
  onItemClick,
  onItemDelete,
}: KnowledgeListProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.3, delay: index * 0.02 }}
        >
          <KnowledgeCard
            item={item}
            onClick={() => onItemClick?.(item)}
            onDelete={onItemDelete ? () => onItemDelete(item) : undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
