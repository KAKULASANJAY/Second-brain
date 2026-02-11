'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// =============================================================================
// CARD COMPONENT
// =============================================================================

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, onClick }: CardProps) {
  const Component = hover ? motion.div : 'div';

  const motionProps = hover
    ? {
        whileHover: { 
          y: -4, 
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.12), 0 8px 16px -8px rgba(0, 0, 0, 0.08)' 
        },
        whileTap: { scale: 0.99 },
        transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
      }
    : {};

  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-surface-200',
        'shadow-sm hover:shadow-md transition-all duration-300',
        hover && 'cursor-pointer',
        className
      )}
      {...motionProps}
    >
      {children}
    </Component>
  );
}

// =============================================================================
// CARD SECTIONS
// =============================================================================

interface CardSectionProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className }: CardSectionProps) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-b border-surface-100',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className }: CardSectionProps) {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

export function CardFooter({ children, className }: CardSectionProps) {
  return (
    <div
      className={cn(
        'px-5 py-4 border-t border-surface-100 bg-surface-50 rounded-b-xl',
        className
      )}
    >
      {children}
    </div>
  );
}

// =============================================================================
// SKELETON LOADER
// =============================================================================

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-surface-200 rounded',
        className
      )}
    />
  );
}

export function CardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
