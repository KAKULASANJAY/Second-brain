'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, SortAsc, SortDesc, X } from 'lucide-react';
import { Button, Tag } from '@/components/ui';
import { cn, KNOWLEDGE_TYPES, TYPE_LABELS, TYPE_COLORS } from '@/lib/utils';
import type { KnowledgeType } from '@/lib/database.types';

// =============================================================================
// FILTER BAR COMPONENT
// =============================================================================

export interface FilterState {
  type: KnowledgeType | null;
  tags: string[];
  sortBy: 'created_at' | 'title';
  sortOrder: 'asc' | 'desc';
}

interface FilterBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availableTags?: string[];
}

export function FilterBar({
  filters,
  onFiltersChange,
  availableTags = [],
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      onFiltersChange({ ...filters, [key]: value });
    },
    [filters, onFiltersChange]
  );

  const clearFilters = () => {
    onFiltersChange({
      type: null,
      tags: [],
      sortBy: 'created_at',
      sortOrder: 'desc',
    });
  };

  const toggleTag = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter((t) => t !== tag)
      : [...filters.tags, tag];
    updateFilter('tags', newTags);
  };

  const hasActiveFilters = filters.type || filters.tags.length > 0;

  return (
    <div className="space-y-3">
      {/* Main Filter Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant={isExpanded ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 text-xs bg-white/20 rounded">
                {(filters.type ? 1 : 0) + filters.tags.length}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-surface-500"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <select
            value={filters.sortBy}
            onChange={(e) =>
              updateFilter('sortBy', e.target.value as FilterState['sortBy'])
            }
            className="text-sm border border-surface-200 rounded-lg px-3 py-1.5 bg-white"
          >
            <option value="created_at">Date</option>
            <option value="title">Title</option>
          </select>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')
            }
          >
            {filters.sortOrder === 'asc' ? (
              <SortAsc className="h-4 w-4" />
            ) : (
              <SortDesc className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-surface-50 rounded-xl space-y-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium text-surface-700 mb-2 block">
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {KNOWLEDGE_TYPES.map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        updateFilter('type', filters.type === type ? null : type)
                      }
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                        filters.type === type
                          ? TYPE_COLORS[type]
                          : 'bg-white border border-surface-200 text-surface-600 hover:border-surface-300'
                      )}
                    >
                      {TYPE_LABELS[type]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-surface-700 mb-2 block">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 15).map((tag) => (
                      <button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          'px-2.5 py-1 rounded-full text-sm transition-all',
                          filters.tags.includes(tag)
                            ? 'bg-brand-100 text-brand-700 ring-1 ring-brand-300'
                            : 'bg-white border border-surface-200 text-surface-600 hover:border-surface-300'
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      <AnimatePresence>
        {hasActiveFilters && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-wrap gap-2"
          >
            {filters.type && (
              <Tag
                removable
                onRemove={() => updateFilter('type', null)}
                className={TYPE_COLORS[filters.type]}
              >
                {TYPE_LABELS[filters.type]}
              </Tag>
            )}
            {filters.tags.map((tag) => (
              <Tag
                key={tag}
                removable
                onRemove={() => toggleTag(tag)}
                variant="user"
              >
                {tag}
              </Tag>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
