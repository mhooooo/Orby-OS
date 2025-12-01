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
  const baseClasses = 'bg-[#282A2C] rounded-lg';

  const variantClasses = {
    text: 'h-4 rounded-md',
    card: 'h-64 rounded-3xl',
    image: 'aspect-video rounded-2xl',
    circle: 'rounded-full aspect-square',
  };

  const animationClasses = animate
    ? 'bg-gradient-to-r from-[#282A2C] via-[#333537] to-[#282A2C] bg-[length:200%_100%] animate-shimmer'
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
 */
export function CourseCardSkeleton() {
  return (
    <div className="bg-[#1E1F20] rounded-3xl p-6 space-y-4">
      <Skeleton variant="image" className="w-full" />
      <div className="space-y-3">
        <Skeleton variant="text" className="h-6 w-3/4" />
        <Skeleton variant="text" className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton variant="text" className="h-8 w-24" />
          <Skeleton variant="text" className="h-8 w-24" />
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for course detail
 */
export function CourseDetailSkeleton() {
  return (
    <div className="bg-[#1E1F20] rounded-3xl overflow-hidden space-y-6">
      <Skeleton variant="image" className="w-full h-96" />
      <div className="p-6 space-y-4">
        <Skeleton variant="text" className="h-8 w-2/3" />
        <Skeleton variant="text" className="h-6 w-1/3" />
        <SkeletonGroup count={4} className="h-4 w-full" />
        <div className="flex gap-3 pt-4">
          <Skeleton variant="text" className="h-12 w-32" />
          <Skeleton variant="text" className="h-12 w-32" />
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
