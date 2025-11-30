'use client';

import React, { createContext, useCallback, useState, ReactNode } from 'react';
import { ToastContainer, ToastData, ToastType } from '@/components/ui/Toast';

interface ToastContextValue {
  showToast: (options: {
    type: ToastType;
    message: string;
    duration?: number;
  }) => void;
  dismissToast: (id: string) => void;
  dismissAll: () => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = useCallback(
    ({ type, message, duration = 5000 }: {
      type: ToastType;
      message: string;
      duration?: number;
    }) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      const newToast: ToastData = {
        id,
        type,
        message,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, dismissAll }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}
