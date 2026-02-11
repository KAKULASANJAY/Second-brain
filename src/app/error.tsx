'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="p-4 bg-red-100 rounded-2xl inline-block mb-6">
          <AlertTriangle className="h-12 w-12 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-surface-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-surface-600 mb-8">
          An unexpected error occurred. Please try again or return to the home page.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={reset}
            variant="primary"
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Try Again
          </Button>
          <Link href="/">
            <Button variant="secondary" leftIcon={<Home className="h-4 w-4" />}>
              Go Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
