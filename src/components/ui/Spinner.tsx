import { cn } from '@/lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: 'inherit' | 'accent';
  className?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-12 h-12 border-3',
};

const colorMap = {
  inherit: 'border-current',
  accent: 'border-[#FF6B35]',
};

export function Spinner({ size = 'md', color = 'accent', className }: SpinnerProps) {
  const sizeClasses = sizeMap[size];
  const colorClasses = colorMap[color];

  return (
    <div
      className={cn(
        'inline-block rounded-full border-t-transparent animate-spin',
        sizeClasses,
        colorClasses,
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Full-screen loading overlay
 */
interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-[#131314]/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#1E1F20] rounded-3xl p-8 flex flex-col items-center gap-4">
        <Spinner size="lg" />
        {message && (
          <p className="text-white/70 text-sm">{message}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Inline loading state
 */
interface InlineLoadingProps {
  message?: string;
  size?: SpinnerSize;
}

export function InlineLoading({ message, size = 'sm' }: InlineLoadingProps) {
  return (
    <div className="flex items-center gap-2 text-white/70">
      <Spinner size={size} />
      {message && <span className="text-sm">{message}</span>}
    </div>
  );
}

/**
 * Button loading state
 */
interface ButtonLoadingProps {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function ButtonLoading({ children, isLoading }: ButtonLoadingProps) {
  return (
    <>
      {isLoading && <Spinner size="sm" className="mr-2" />}
      {children}
    </>
  );
}
