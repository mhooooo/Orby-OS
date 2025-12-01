'use client';

import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';

/**
 * Hook for triggering toast notifications
 *
 * Usage:
 * const { showToast } = useToast();
 *
 * // Success toast
 * showToast({ type: 'success', message: 'Course saved!' });
 *
 * // Error toast
 * showToast({ type: 'error', message: 'Failed to save course' });
 *
 * // Warning toast
 * showToast({ type: 'warning', message: 'Please sign in to continue' });
 *
 * // Info toast with custom duration
 * showToast({ type: 'info', message: 'Checking availability...', duration: 3000 });
 */
export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}
