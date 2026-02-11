'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Brain } from 'lucide-react';
import { Button } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="p-4 bg-surface-200 rounded-2xl inline-block mb-6">
          <Brain className="h-12 w-12 text-surface-400" />
        </div>
        
        <h1 className="text-6xl font-bold text-surface-900 mb-4">404</h1>
        <h2 className="text-xl font-semibold text-surface-700 mb-2">
          Page Not Found
        </h2>
        <p className="text-surface-500 mb-8 max-w-md">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back to your knowledge base.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button variant="primary" leftIcon={<Home className="h-4 w-4" />}>
              Go Home
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="secondary" leftIcon={<ArrowLeft className="h-4 w-4" />}>
              Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
