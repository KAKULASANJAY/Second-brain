'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Brain, FileText, Link as LinkIcon, Lightbulb, RefreshCw } from 'lucide-react';
import {
  Button,
  SearchInput,
  EmptyState,
  CardSkeleton,
} from '@/components/ui';
import {
  KnowledgeList,
  KnowledgeCaptureModal,
  KnowledgeDetail,
  FilterBar,
  type FilterState,
} from '@/components/knowledge';
import type { KnowledgeItem } from '@/lib/database.types';
import { debounce } from '@/lib/utils';
import toast from 'react-hot-toast';

// =============================================================================
// DASHBOARD PAGE
// =============================================================================

export default function DashboardPage() {
  // State
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    type: null,
    tags: [],
    sortBy: 'created_at',
    sortOrder: 'desc',
  });
  const [stats, setStats] = useState({
    total: 0,
    notes: 0,
    links: 0,
    insights: 0,
  });

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.set('type', filters.type);
      if (filters.tags.length > 0) params.set('tag', filters.tags[0]);
      params.set('sort', filters.sortBy);
      params.set('order', filters.sortOrder);
      params.set('limit', '100');

      const response = await fetch(`/api/knowledge?${params}`);
      const data = await response.json();

      if (data.success) {
        setItems(data.data);
        calculateStats(data.data);
      }
    } catch (error) {
      toast.error('Failed to load knowledge items');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const searchItems = useCallback(
    (query: string) => {
      const debouncedSearch = debounce(async (q: string) => {
        if (!q.trim()) {
          fetchItems();
          return;
        }

        setIsSearching(true);
        try {
          const response = await fetch('/api/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: q,
              mode: 'hybrid',
              type: filters.type,
              tags: filters.tags,
              limit: 50,
            }),
          });

          const data = await response.json();
          if (data.success) {
            setItems(data.data);
          }
        } catch (error) {
          toast.error('Search failed');
        } finally {
          setIsSearching(false);
        }
      }, 300);
      debouncedSearch(query);
    },
    [filters, fetchItems]
  );

  const fetchTags = useCallback(async () => {
    try {
      const response = await fetch('/api/tags');
      const data = await response.json();
      if (data.success) {
        setAvailableTags(data.data.map((t: { tag: string }) => t.tag));
      }
    } catch (error) {
      console.error('Failed to fetch tags');
    }
  }, []);

  const calculateStats = (data: KnowledgeItem[]) => {
    setStats({
      total: data.length,
      notes: data.filter((i) => i.type === 'note').length,
      links: data.filter((i) => i.type === 'link').length,
      insights: data.filter((i) => i.type === 'insight').length,
    });
  };

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  const handleDelete = async (item: KnowledgeItem) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const response = await fetch(`/api/knowledge/${item.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Item deleted');
        setItems((prev) => prev.filter((i) => i.id !== item.id));
        if (selectedItem?.id === item.id) {
          setSelectedItem(null);
        }
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };

  const handleCaptureSuccess = () => {
    fetchItems();
    fetchTags();
  };

  // ==========================================================================
  // EFFECTS
  // ==========================================================================

  useEffect(() => {
    fetchItems();
    fetchTags();
  }, [fetchItems, fetchTags]);

  useEffect(() => {
    if (searchQuery) {
      searchItems(searchQuery);
    } else {
      fetchItems();
    }
  }, [searchQuery, searchItems, fetchItems]);

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <div className="bg-white border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-surface-900 flex items-center gap-3">
                <Brain className="h-8 w-8 text-brand-600" />
                Knowledge Dashboard
              </h1>
              <p className="text-surface-600 mt-1">
                Your personal knowledge repository
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={fetchItems}
                leftIcon={<RefreshCw className="h-4 w-4" />}
              >
                Refresh
              </Button>
              <Button
                onClick={() => setIsCaptureOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Capture
              </Button>
            </div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6"
          >
            <StatCard
              label="Total Items"
              value={stats.total}
              icon={<Brain className="h-5 w-5 text-brand-600" />}
              color="bg-brand-50"
            />
            <StatCard
              label="Notes"
              value={stats.notes}
              icon={<FileText className="h-5 w-5 text-blue-600" />}
              color="bg-blue-50"
            />
            <StatCard
              label="Links"
              value={stats.links}
              icon={<LinkIcon className="h-5 w-5 text-green-600" />}
              color="bg-green-50"
            />
            <StatCard
              label="Insights"
              value={stats.insights}
              icon={<Lightbulb className="h-5 w-5 text-purple-600" />}
              color="bg-purple-50"
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Search & Filters */}
        <div className="space-y-4 mb-8">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search your knowledge (semantic + text)..."
            isLoading={isSearching}
          />
          <FilterBar
            filters={filters}
            onFiltersChange={setFilters}
            availableTags={availableTags}
          />
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Brain className="h-16 w-16" />}
            title={searchQuery ? 'No results found' : 'No knowledge captured yet'}
            description={
              searchQuery
                ? 'Try adjusting your search or filters'
                : 'Start building your Second Brain by capturing your first piece of knowledge'
            }
            action={
              !searchQuery && (
                <Button onClick={() => setIsCaptureOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Capture Knowledge
                </Button>
              )
            }
          />
        ) : (
          <>
            <p className="text-sm text-surface-500 mb-4">
              {items.length} item{items.length !== 1 ? 's' : ''} found
              {searchQuery && ` for "${searchQuery}"`}
            </p>
            <KnowledgeList
              items={items}
              onItemClick={setSelectedItem}
              onItemDelete={handleDelete}
            />
          </>
        )}
      </div>

      {/* Modals */}
      <KnowledgeCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
        onSuccess={handleCaptureSuccess}
      />

      <KnowledgeDetail
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={() => selectedItem && handleDelete(selectedItem)}
      />
    </div>
  );
}

// =============================================================================
// STAT CARD COMPONENT
// =============================================================================

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <div className={`${color} rounded-xl p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-surface-600">{label}</p>
          <p className="text-2xl font-bold text-surface-900">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
}
