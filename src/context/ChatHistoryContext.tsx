'use client';

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useChatHistory, Chat, ChatMessage } from '@/hooks/useChatHistory';

interface ChatHistoryContextType {
  chats: Chat[];
  currentChatId: string | null;
  loading: boolean;
  error: string | null;
  createChat: (title?: string) => Promise<string | null>;
  selectChat: (chatId: string) => Promise<ChatMessage[]>;
  deleteChat: (chatId: string) => Promise<boolean>;
  updateChatTitle: (chatId: string, title: string) => Promise<boolean>;
  setCurrentChatId: (chatId: string | null) => void;
  refetch: () => Promise<void>;
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined);

export function ChatHistoryProvider({ children }: { children: ReactNode }) {
  const chatHistory = useChatHistory();

  return (
    <ChatHistoryContext.Provider value={chatHistory}>
      {children}
    </ChatHistoryContext.Provider>
  );
}

export function useChatHistoryContext() {
  const context = useContext(ChatHistoryContext);
  if (context === undefined) {
    throw new Error('useChatHistoryContext must be used within a ChatHistoryProvider');
  }
  return context;
}
