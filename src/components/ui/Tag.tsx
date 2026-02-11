'use client';

import { cn, TYPE_COLORS } from '@/lib/utils';
import type { KnowledgeType } from '@/lib/database.types';

// =============================================================================
// TAG / BADGE COMPONENT
// =============================================================================

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'ai' | 'user' | 'type';
  type?: KnowledgeType;
  size?: 'sm' | 'md';
  removable?: boolean;
  onRemove?: () => void;
  className?: string;
}

export function Tag({
  children,
  variant = 'default',
  type,
  size = 'sm',
  removable = false,
  onRemove,
  className,
}: TagProps) {
  const variantStyles = {
    default: 'bg-surface-100 text-surface-700',
    ai: 'bg-purple-100 text-purple-700',
    user: 'bg-blue-100 text-blue-700',
    type: type ? TYPE_COLORS[type] : 'bg-surface-100 text-surface-700',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium',
        'transition-all duration-150',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
      {removable && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove?.();
          }}
          className="ml-0.5 hover:text-red-600 transition-colors"
          aria-label="Remove tag"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

// =============================================================================
// TAG INPUT COMPONENT
// =============================================================================

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagInput({
  tags,
  onChange,
  placeholder = 'Add tags...',
  maxTags = 20,
  className,
}: TagInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const value = input.value.trim().toLowerCase();

    if ((e.key === 'Enter' || e.key === ',') && value) {
      e.preventDefault();
      if (tags.length < maxTags && !tags.includes(value)) {
        onChange([...tags, value]);
        input.value = '';
      }
    } else if (e.key === 'Backspace' && !input.value && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 p-2',
        'border border-surface-200 rounded-lg',
        'focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-transparent',
        'bg-white transition-all duration-200',
        className
      )}
    >
      {tags.map((tag) => (
        <Tag key={tag} variant="user" removable onRemove={() => removeTag(tag)}>
          {tag}
        </Tag>
      ))}
      <input
        type="text"
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ''}
        disabled={tags.length >= maxTags}
        className={cn(
          'flex-1 min-w-[120px] bg-transparent',
          'text-sm text-surface-900 placeholder-surface-400',
          'focus:outline-none'
        )}
      />
    </div>
  );
}
