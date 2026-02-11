'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// MODAL COMPONENT
// =============================================================================

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />

          {/* FIX START - Improved modal centering and scrollable content */}
          {/* Modal Container - centers the modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'w-full pointer-events-auto',
                'max-h-[90vh] flex flex-col',
                sizes[size]
              )}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
                {/* Header - Fixed at top */}
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 flex-shrink-0">
                    <h2 className="text-lg font-semibold text-surface-900">
                      {title}
                    </h2>
                    <button
                      onClick={onClose}
                      className={cn(
                        'p-2 rounded-lg',
                        'text-surface-500 hover:text-surface-700',
                        'hover:bg-surface-100 transition-colors'
                      )}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}

                {/* Content - Scrollable */}
                <div className="p-6 overflow-y-auto flex-1">{children}</div>
              </div>
            </motion.div>
          </div>
          {/* FIX END */}
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// EMPTY STATE COMPONENT
// =============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      {icon && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-surface-100 to-surface-50 text-surface-400"
        >
          {icon}
        </motion.div>
      )}
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-surface-900 mb-3"
      >
        {title}
      </motion.h3>
      {description && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-surface-500 max-w-md mb-8 leading-relaxed"
        >
          {description}
        </motion.p>
      )}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
