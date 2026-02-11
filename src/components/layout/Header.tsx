'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Home,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui';
import { KnowledgeCaptureModal } from '@/components/knowledge';

// =============================================================================
// NAVIGATION ITEMS
// =============================================================================

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/ask', label: 'Ask AI', icon: MessageSquare },
  { href: '/docs', label: 'Documentation', icon: FileText },
];

// =============================================================================
// HEADER COMPONENT
// =============================================================================

export function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCaptureOpen, setIsCaptureOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-surface-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="p-2 bg-brand-600 rounded-xl">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-surface-900">
                Second Brain
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
                      'transition-all duration-200',
                      isActive
                        ? 'bg-brand-50 text-brand-700'
                        : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsCaptureOpen(true)}
                leftIcon={<Plus className="h-4 w-4" />}
                className="hidden sm:flex"
              >
                Capture
              </Button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-surface-100"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-surface-200 overflow-hidden"
            >
              <nav className="p-4 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-3 rounded-lg font-medium',
                        'transition-all duration-200',
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-surface-600 hover:bg-surface-100'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.label}
                    </Link>
                  );
                })}
                <div className="pt-2">
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsCaptureOpen(true);
                    }}
                    leftIcon={<Plus className="h-4 w-4" />}
                    className="w-full"
                  >
                    Capture Knowledge
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Capture Modal */}
      <KnowledgeCaptureModal
        isOpen={isCaptureOpen}
        onClose={() => setIsCaptureOpen(false)}
      />
    </>
  );
}

// =============================================================================
// FOOTER COMPONENT
// =============================================================================

export function Footer() {
  return (
    // FIX START - Clean professional footer
    <footer className="border-t border-surface-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-brand-600" />
            <span className="font-semibold text-surface-900">Second Brain</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-surface-500">
            <span>&copy; {new Date().getFullYear()} Second Brain</span>
            <span className="hidden sm:inline text-surface-300">•</span>
            <Link href="/docs" className="hover:text-surface-700 transition-colors">
              Docs
            </Link>
            <span className="hidden sm:inline text-surface-300">•</span>
            <a
              href="#"
              className="hover:text-surface-700 transition-colors"
            >
              Privacy
            </a>
            <span className="hidden sm:inline text-surface-300">•</span>
            <a
              href="#"
              className="hover:text-surface-700 transition-colors"
            >
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
    // FIX END
  );
}
