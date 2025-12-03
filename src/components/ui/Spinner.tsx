import { cn } from '@/lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: 'inherit' | 'accent' | 'muted';
  className?: string;
}

// Token-based sizing
const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',    // 16px
  md: 'w-6 h-6 border-2',    // 24px
  lg: 'w-10 h-10 border-3',  // 40px
};

// Token-based colors
const colorMap = {
  inherit: 'border-current',
  accent: 'border-accent-coral',  // Primary accent color
  muted: 'border-text-muted',     // Subtle spinner
};

export function Spinner({ size = 'md', color = 'accent', className }: SpinnerProps) {
  return (
    <div
      className={cn(
        'inline-block rounded-full border-t-transparent animate-spin',
        sizeMap[size],
        colorMap[color],
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
 * Uses glass surface and card styling from tokens
 */
interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-background-elevated/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background-card rounded-card p-8 flex flex-col items-center gap-4 border border-white/10 shadow-glass">
        <Spinner size="lg" />
        {message && (
          <p className="text-text-secondary text-sm">{message}</p>
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
    <div className="flex items-center gap-2 text-text-secondary">
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
      {isLoading && <Spinner size="sm" color="inherit" className="mr-2" />}
      {children}
    </>
  );
}
