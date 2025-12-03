import { cn } from '@/lib/utils';

export type SkeletonVariant = 'text' | 'card' | 'image' | 'circle';

interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  className?: string;
  animate?: boolean;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  animate = true,
}: SkeletonProps) {
  const baseClasses = 'bg-shimmer-base rounded-lg';

  const variantClasses = {
    text: 'h-4 rounded-md',
    card: 'h-64 rounded-card',
    image: 'aspect-video rounded-xl',
    circle: 'rounded-full aspect-square',
  };

  const animationClasses = animate
    ? 'bg-gradient-to-r from-shimmer-base via-shimmer-highlight to-shimmer-base bg-[length:200%_100%] animate-shimmer'
    : '';

  const styles: React.CSSProperties = {};
  if (width) styles.width = width;
  if (height) styles.height = height;

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        animationClasses,
        className
      )}
      style={styles}
      aria-live="polite"
      aria-busy="true"
    />
  );
}

/**
 * Skeleton group for repeated elements
 */
interface SkeletonGroupProps {
  count?: number;
  variant?: SkeletonVariant;
  className?: string;
  spacing?: string;
}

export function SkeletonGroup({
  count = 3,
  variant = 'text',
  className,
  spacing = 'space-y-3',
}: SkeletonGroupProps) {
  return (
    <div className={spacing}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant={variant} className={className} />
      ))}
    </div>
  );
}

/**
 * Skeleton for course card
 * Matches CourseCard glass treatment: same radius, surface, shadow
 */
export function CourseCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card',
        'bg-surface-glass backdrop-blur-xl border border-white/10',
        'shadow-glass',
        compact ? 'w-[280px] sm:w-[260px] h-[340px]' : 'w-[300px] sm:w-[320px] h-[400px]'
      )}
    >
      {/* Glow Effects (muted for skeleton) */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-purpleMuted rounded-full blur-[50px] pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-cyanMuted rounded-full blur-[50px] pointer-events-none" />

      {/* Image placeholder - full height */}
      <div className="absolute inset-0">
        <Skeleton variant="image" className="w-full h-full rounded-none" />
      </div>

      {/* Content overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 space-y-3">
        {/* Title */}
        <Skeleton variant="text" className="h-6 w-3/4" />
        {/* Location */}
        <Skeleton variant="text" className="h-4 w-1/2" />
        {/* Price and button row */}
        <div className="flex justify-between items-center pt-2">
          <div className="space-y-1">
            <Skeleton variant="text" className="h-3 w-12" />
            <Skeleton variant="text" className="h-5 w-16" />
          </div>
          <Skeleton variant="text" className="h-8 w-24 rounded-button" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for course detail (expanded CourseCard)
 * Matches CourseCard expanded glass treatment
 */
export function CourseDetailSkeleton() {
  return (
    <div className="bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass rounded-card overflow-hidden space-y-6">
      <Skeleton variant="image" className="w-full h-96 rounded-none" />
      <div className="p-6 space-y-4">
        <Skeleton variant="text" className="h-8 w-2/3" />
        <Skeleton variant="text" className="h-6 w-1/3" />
        <SkeletonGroup count={4} className="h-4 w-full" />
        <div className="flex gap-3 pt-4">
          <Skeleton variant="text" className="h-12 w-32 rounded-button" />
          <Skeleton variant="text" className="h-12 w-32 rounded-button" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for itinerary step
 */
export function ItineraryStepSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton variant="text" className="h-6 w-1/3" />
        <Skeleton variant="text" className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="h-24" />
        ))}
      </div>
    </div>
  );
}
