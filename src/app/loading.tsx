import { Brain } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">
          <Brain className="h-12 w-12 text-brand-600 mx-auto" />
        </div>
        <p className="text-surface-500 mt-4">Loading...</p>
      </div>
    </div>
  );
}
