'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useChat } from '@/hooks/useChat';
import { Message } from '@/types/chat';

interface ChatContextType {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentChatId: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  loadChat: (chatId: string) => Promise<boolean>;
  setMessages: (messages: Message[]) => void;
  setCurrentChatId: (chatId: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const chat = useChat();

  return (
    <ChatContext.Provider value={chat}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
