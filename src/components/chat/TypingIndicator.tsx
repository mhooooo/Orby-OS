'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

/**
 * Typing indicator with NeuralDots-inspired accent colors
 * Uses coral, cyan, and purple from the design tokens
 */
export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn(
      'flex items-center gap-3 px-5 py-4 rounded-card',
      'bg-surface-glass backdrop-blur-xl border border-white/10',
      className
    )}>
      <div className="flex gap-1.5">
        {/* Coral dot */}
        <div className="w-2 h-2 bg-accent-coral rounded-full animate-bounce [animation-delay:-0.3s]" />
        {/* Cyan dot */}
        <div className="w-2 h-2 bg-accent-cyan rounded-full animate-bounce [animation-delay:-0.15s]" />
        {/* Purple dot */}
        <div className="w-2 h-2 bg-accent-purple rounded-full animate-bounce" />
      </div>
      <span className="text-text-muted text-sm">Thinking...</span>
    </div>
  );
}
