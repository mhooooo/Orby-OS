'use client';

import { useState, useCallback } from 'react';
import { Message, ChatState } from '@/types/chat';

export function useChat(initialMessages: Message[] = []) {
  const [state, setState] = useState<ChatState>({
    messages: initialMessages,
    isLoading: false,
    error: null,
  });

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, idx) =>
        idx === prev.messages.length - 1 ? { ...msg, content } : msg
      ),
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearMessages = useCallback(() => {
    setState({ messages: [], isLoading: false, error: null });
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    // Create user message
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      createdAt: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);
    setError(null);

    // Create placeholder for assistant message
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '',
      createdAt: new Date(),
    };
    addMessage(assistantMessage);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...state.messages, userMessage],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedContent += chunk;
        updateLastMessage(accumulatedContent);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [state.messages, addMessage, updateLastMessage, setLoading, setError]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    addMessage,
    clearMessages,
  };
}
