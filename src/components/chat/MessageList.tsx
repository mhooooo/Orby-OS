'use client';

import React, { useRef, useEffect } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { Message } from './Message';
import { cn } from '@/lib/utils';

interface MessageListProps {
  className?: string;
}

export function MessageList({ className }: MessageListProps) {
  const { messages } = useChatContext();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return null; // Will be replaced with greeting state
  }

  return (
    <div className={cn('px-4 py-6 space-y-4', className)}>
      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
