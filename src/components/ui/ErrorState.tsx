import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  onGoHome,
  className,
  compact = false,
}: ErrorStateProps) {
  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-3 p-4 rounded-cardSmall',
        'bg-accent-redMuted border border-accent-red/20',
        className
      )}>
        <AlertCircle size={20} className="text-accent-red flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-text-primary font-medium truncate">{title}</p>
          {message && <p className="text-xs text-text-secondary truncate">{message}</p>}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex-shrink-0 p-2 hover:bg-accent-redMuted rounded-button transition-colors"
            aria-label="Retry"
          >
            <RefreshCw size={16} className="text-accent-red" />
          </button>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center',
        'bg-background-card rounded-card border border-white/10',
        className
      )}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="w-16 h-16 mb-6 rounded-full bg-accent-redMuted flex items-center justify-center"
      >
        <AlertCircle size={32} className="text-accent-red" />
      </motion.div>

      <h3 className="text-text-primary text-xl font-bold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-8 max-w-md">{message}</p>

      <div className="flex gap-3">
        {onRetry && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className={cn(
              'px-6 py-3 rounded-button font-bold text-sm transition-colors flex items-center gap-2',
              'bg-accent-coral hover:bg-accent-coral/90 text-text-primary'
            )}
          >
            <RefreshCw size={16} />
            Try Again
          </motion.button>
        )}
        {onGoHome && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoHome}
            className={cn(
              'px-6 py-3 rounded-button font-bold text-sm transition-colors flex items-center gap-2',
              'bg-white/10 hover:bg-white/20 text-text-primary border border-white/10'
            )}
          >
            <Home size={16} />
            Go Home
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Inline error for forms
 */
interface InlineErrorProps {
  message: string;
  className?: string;
}

export function InlineError({ message, className }: InlineErrorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn('flex items-center gap-2 text-accent-red text-sm mt-2', className)}
    >
      <AlertCircle size={14} />
      <span>{message}</span>
    </motion.div>
  );
}

/**
 * Network error state (offline)
 * Uses warning (gold) color for offline state
 */
export function OfflineState() {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-surface-glass backdrop-blur-xl border border-white/10 rounded-cardSmall p-4 shadow-glass"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-goldMuted flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-accent-gold" />
          </div>
          <div className="flex-1">
            <p className="text-text-primary font-bold text-sm">You&apos;re offline</p>
            <p className="text-text-muted text-xs">Check your internet connection</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
