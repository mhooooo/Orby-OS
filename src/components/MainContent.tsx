'use client';

import React from 'react';
import { useChatContext } from '@/context/ChatContext';
import { MessageList } from '@/components/chat';
import { ChatInput } from '@/components/chat';
import { GreetingStateContent } from './GreetingState';

interface MainContentProps {
  onIntroComplete?: () => void;
}

export function MainContent({ onIntroComplete }: MainContentProps) {
  const { messages } = useChatContext();
  const hasMessages = messages.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {hasMessages ? (
        <>
          <div className="flex-1 overflow-y-auto">
            <MessageList />
          </div>
          <ChatInput />
        </>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden">
          <GreetingStateContent onIntroComplete={onIntroComplete} />
        </div>
      )}
    </div>
  );
}
