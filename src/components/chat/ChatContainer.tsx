'use client';

import React from 'react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  className?: string;
}

/**
 * Main chat container
 * Uses background-base as the canvas color
 */
export function ChatContainer({ className }: ChatContainerProps) {
  return (
    <div className={cn(
      'flex flex-col h-full',
      'bg-background-base', // Token-based background
      className
    )}>
      <MessageList className="flex-1 overflow-y-auto" />
      <ChatInput className="flex-shrink-0 border-t border-white/5" />
    </div>
  );
}
