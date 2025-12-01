'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { apiFetch } from '@/lib/api-client';

export interface Chat {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

interface UseChatHistoryReturn {
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

export function useChatHistory(): UseChatHistoryReturn {
  const { loading: authLoading } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all chats
  const fetchChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch('/api/chats');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data.chats || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('[useChatHistory] Error fetching chats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchChats();
    }
  }, [authLoading, fetchChats]);

  // Create a new chat
  const createChat = useCallback(async (title?: string): Promise<string | null> => {
    try {
      const response = await apiFetch('/api/chats', {
        method: 'POST',
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create chat');
      }

      const data = await response.json();
      const newChat = data.chat;

      // Add to local state
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);

      return newChat.id;
    } catch (err) {
      console.error('[useChatHistory] Error creating chat:', err);
      return null;
    }
  }, []);

  // Select and load a chat
  const selectChat = useCallback(async (chatId: string): Promise<ChatMessage[]> => {
    try {
      const response = await apiFetch(`/api/chats/${chatId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load chat');
      }

      const data = await response.json();
      setCurrentChatId(chatId);

      // Update chat in local state (in case title changed)
      if (data.chat) {
        setChats(prev => prev.map(c =>
          c.id === chatId ? { ...c, ...data.chat } : c
        ));
      }

      return data.messages || [];
    } catch (err) {
      console.error('[useChatHistory] Error selecting chat:', err);
      return [];
    }
  }, []);

  // Delete a chat
  const deleteChat = useCallback(async (chatId: string): Promise<boolean> => {
    try {
      const response = await apiFetch(`/api/chats/${chatId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete chat');
      }

      // Remove from local state
      setChats(prev => prev.filter(c => c.id !== chatId));

      // Clear current chat if it was deleted
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }

      return true;
    } catch (err) {
      console.error('[useChatHistory] Error deleting chat:', err);
      return false;
    }
  }, [currentChatId]);

  // Update chat title
  const updateChatTitle = useCallback(async (chatId: string, title: string): Promise<boolean> => {
    try {
      const response = await apiFetch(`/api/chats/${chatId}`, {
        method: 'PATCH',
        body: JSON.stringify({ title }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update chat');
      }

      // Update in local state
      setChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, title } : c
      ));

      return true;
    } catch (err) {
      console.error('[useChatHistory] Error updating chat:', err);
      return false;
    }
  }, []);

  return {
    chats,
    currentChatId,
    loading,
    error,
    createChat,
    selectChat,
    deleteChat,
    updateChatTitle,
    setCurrentChatId,
    refetch: fetchChats,
  };
}
