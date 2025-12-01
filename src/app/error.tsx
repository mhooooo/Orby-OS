'use client';

import { useEffect } from 'react';
import { ErrorState } from '@/components/ui/ErrorState';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#131314] flex items-center justify-center p-4">
      <ErrorState
        title="Oops! Something went wrong"
        message={error.message || 'An unexpected error occurred. Please try again.'}
        onRetry={reset}
        onGoHome={() => (window.location.href = '/')}
      />
    </div>
  );
}
