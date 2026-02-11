'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Calendar, Sparkles, Tag as TagIcon, X } from 'lucide-react';
import { Modal, Tag, Button } from '@/components/ui';
import { formatDate, TYPE_ICONS, TYPE_LABELS } from '@/lib/utils';
import type { KnowledgeItem } from '@/lib/database.types';

// =============================================================================
// KNOWLEDGE DETAIL MODAL
// =============================================================================

interface KnowledgeDetailProps {
  item: KnowledgeItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
}

export function KnowledgeDetail({
  item,
  isOpen,
  onClose,
  onDelete,
}: KnowledgeDetailProps) {
  if (!item) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl" role="img" aria-label={item.type}>
              {TYPE_ICONS[item.type]}
            </span>
            <div>
              <h2 className="text-xl font-bold text-surface-900">
                {item.title}
              </h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                <Tag variant="type" type={item.type}>
                  {TYPE_LABELS[item.type]}
                </Tag>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(item.created_at)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-surface-500 hover:text-surface-700 hover:bg-surface-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Source URL */}
        {item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-surface-50 rounded-lg text-brand-600 hover:bg-surface-100 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="text-sm font-medium">{item.source_url}</span>
          </a>
        )}

        {/* AI Summary */}
        {item.summary && (
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <div className="flex items-center gap-2 mb-2 text-purple-700">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-semibold">AI Summary</span>
            </div>
            <p className="text-surface-700 leading-relaxed">{item.summary}</p>
          </div>
        )}

        {/* Content */}
        <div>
          <h3 className="text-sm font-semibold text-surface-700 mb-2">
            Content
          </h3>
          <div className="prose prose-sm max-w-none">
            <p className="text-surface-600 whitespace-pre-wrap leading-relaxed">
              {item.content}
            </p>
          </div>
        </div>

        {/* Tags */}
        {((item.user_tags?.length ?? 0) > 0 || (item.ai_tags?.length ?? 0) > 0) && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-surface-700">
              <TagIcon className="h-4 w-4" />
              Tags
            </div>
            <div className="flex flex-wrap gap-2">
              {(item.user_tags || []).map((tag) => (
                <Tag key={`user-${tag}`} variant="user" size="md">
                  {tag}
                </Tag>
              ))}
              {(item.ai_tags || []).map((tag) => (
                <Tag key={`ai-${tag}`} variant="ai" size="md">
                  <Sparkles className="h-3 w-3" />
                  {tag}
                </Tag>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-100">
          {onDelete && (
            <Button variant="danger" onClick={onDelete}>
              Delete
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </motion.div>
    </Modal>
  );
}
