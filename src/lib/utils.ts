import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// =============================================================================
// CLASSNAME UTILITY
// =============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// DATE FORMATTING
// =============================================================================

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      if (diffMinutes === 0) return 'Just now';
      return `${diffMinutes}m ago`;
    }
    return `${diffHours}h ago`;
  }

  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  
  return formatDate(d);
}

// =============================================================================
// TEXT UTILITIES
// =============================================================================

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// =============================================================================
// TAG UTILITIES
// =============================================================================

export function normalizeTags(tags: string[]): string[] {
  const processed = tags
    .map((tag) => tag.toLowerCase().trim())
    .filter((tag) => tag.length > 0);
  return Array.from(new Set(processed));
}

export function combineTags(userTags: string[], aiTags: string[]): string[] {
  return normalizeTags([...userTags, ...aiTags]);
}

// =============================================================================
// URL UTILITIES
// =============================================================================

export function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

export function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname;
    return domain.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// =============================================================================
// DEBOUNCE
// =============================================================================

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}

// =============================================================================
// TYPE HELPERS
// =============================================================================

export const KNOWLEDGE_TYPES = ['note', 'link', 'insight'] as const;

export const TYPE_LABELS: Record<typeof KNOWLEDGE_TYPES[number], string> = {
  note: 'Note',
  link: 'Link',
  insight: 'Insight',
};

export const TYPE_COLORS: Record<typeof KNOWLEDGE_TYPES[number], string> = {
  note: 'bg-blue-100 text-blue-700',
  link: 'bg-green-100 text-green-700',
  insight: 'bg-purple-100 text-purple-700',
};

export const TYPE_ICONS: Record<typeof KNOWLEDGE_TYPES[number], string> = {
  note: '📝',
  link: '🔗',
  insight: '💡',
};
