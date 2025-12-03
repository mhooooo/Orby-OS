'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

/**
 * Toast colors using semantic tokens:
 * - success: gold (positive actions, confirmations)
 * - error: red (errors, destructive actions)
 * - warning: coral (warnings, attention needed)
 * - info: cyan (informational states)
 */
const TOAST_COLORS: Record<ToastType, { bg: string; icon: string; border: string; progress: string }> = {
  success: {
    bg: 'bg-accent-goldMuted',
    icon: 'text-accent-gold',
    border: 'border-accent-gold/20',
    progress: 'bg-accent-gold',
  },
  error: {
    bg: 'bg-accent-redMuted',
    icon: 'text-accent-red',
    border: 'border-accent-red/20',
    progress: 'bg-accent-red',
  },
  warning: {
    bg: 'bg-accent-coralMuted',
    icon: 'text-accent-coral',
    border: 'border-accent-coral/20',
    progress: 'bg-accent-coral',
  },
  info: {
    bg: 'bg-accent-cyanMuted',
    icon: 'text-accent-cyan',
    border: 'border-accent-cyan/20',
    progress: 'bg-accent-cyan',
  },
};

const TOAST_ICONS: Record<ToastType, React.ReactElement> = {
  success: (
    <svg
      className="w-5 h-5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg
      className="w-5 h-5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  warning: (
    <svg
      className="w-5 h-5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  info: (
    <svg
      className="w-5 h-5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function Toast({ toast, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const colors = TOAST_COLORS[toast.type];
  const icon = TOAST_ICONS[toast.type];
  const duration = toast.duration || 5000;

  useEffect(() => {
    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      setIsExiting(true);
      // Wait for exit animation to complete before removing
      setTimeout(() => onDismiss(toast.id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [toast.id, duration, onDismiss]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={cn(
        // Glass surface with token-based styling
        'pointer-events-auto w-full max-w-sm rounded-cardSmall border p-4 shadow-glass transition-all duration-300',
        'bg-surface-glass backdrop-blur-xl',
        colors.border,
        isExiting
          ? 'opacity-0 translate-x-8'
          : 'opacity-100 translate-x-0'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn('flex-shrink-0', colors.icon)}>
          {icon}
        </div>

        {/* Message */}
        <div className="flex-1 pt-0.5">
          <p className="text-sm text-text-primary leading-relaxed">
            {toast.message}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Dismiss"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="mt-3 h-1 w-full bg-background-base rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all ease-linear', colors.progress)}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes toast-progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      className={cn(
        'fixed z-50 flex flex-col gap-3 pointer-events-none',
        // Desktop: bottom-right
        'bottom-6 right-6',
        // Mobile: bottom-center
        'sm:bottom-6 sm:right-6 max-sm:bottom-4 max-sm:left-4 max-sm:right-4 max-sm:items-center'
      )}
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
