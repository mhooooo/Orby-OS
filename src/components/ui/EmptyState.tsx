import { motion } from 'framer-motion';
import { Search, BookmarkX, MapPin, MessageSquareX, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon = Search,
  title = 'No results found',
  description = 'Try adjusting your search or filters',
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  if (compact) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-8 px-4', className)}>
        <Icon size={32} className="text-text-disabled mb-3" />
        <p className="text-text-muted text-sm text-center">{title}</p>
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
        className="w-20 h-20 mb-6 rounded-full bg-white/5 flex items-center justify-center"
      >
        <Icon size={40} className="text-text-disabled" />
      </motion.div>

      <h3 className="text-text-primary text-xl font-bold mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-8 max-w-md">{description}</p>

      {action && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className={cn(
            'px-6 py-3 rounded-button font-bold text-sm transition-colors',
            'bg-accent-coral hover:bg-accent-coral/90 text-text-primary'
          )}
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}

/**
 * Pre-configured empty states
 */
export function NoCoursesFound({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={MapPin}
      title="No courses found"
      description="We couldn&apos;t find any courses matching your criteria. Try adjusting your filters."
      action={onReset ? { label: 'Reset Filters', onClick: onReset } : undefined}
    />
  );
}

export function NoSavedCourses({ onBrowse }: { onBrowse?: () => void }) {
  return (
    <EmptyState
      icon={BookmarkX}
      title="No saved courses yet"
      description="Start exploring courses and save your favorites to build your dream golf trip."
      action={onBrowse ? { label: 'Browse Courses', onClick: onBrowse } : undefined}
    />
  );
}

export function NoMessages() {
  return (
    <EmptyState
      icon={MessageSquareX}
      title="No messages"
      description="Start a conversation to plan your perfect golf trip to Thailand."
      compact
    />
  );
}

/**
 * Empty state for lists (inline variant)
 */
export function EmptyList({ message = 'No items to display' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12 text-text-muted text-sm">
      {message}
    </div>
  );
}
