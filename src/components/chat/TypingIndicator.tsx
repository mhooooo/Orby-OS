'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-2 px-4 py-3', className)}>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
      </div>
      <span className="text-white/40 text-sm">AI is thinking...</span>
    </div>
  );
}
