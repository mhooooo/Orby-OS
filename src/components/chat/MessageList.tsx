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
    <div className={cn('px-4 md:px-8 lg:px-12 py-6 space-y-6', className)}>
      {messages.map((message, idx) => (
        <Message
          key={message.id}
          message={message}
          isLatest={idx === messages.length - 1}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
