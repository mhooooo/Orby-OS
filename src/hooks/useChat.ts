'use client';

import { useState, useCallback } from 'react';
import { Message, ChatState, ToolCall } from '@/types/chat';
import { analytics } from '@/lib/analytics';
import { matchStaticRoute } from '@/lib/static-routes';
import { apiFetch } from '@/lib/api-client';

// Parse tool result markers from response content
function parseToolResults(content: string): { cleanContent: string; toolCalls: ToolCall[] } {
  const toolRegex = /<!--TOOL_RESULT:([A-Za-z0-9+/=]+)-->/g;
  const toolCalls: ToolCall[] = [];
  let match;

  while ((match = toolRegex.exec(content)) !== null) {
    try {
      const decoded = atob(match[1]);
      const toolData = JSON.parse(decoded);
      toolCalls.push({
        id: toolData.id,
        name: toolData.name,
        input: toolData.input,
        result: toolData.result,
      });
    } catch (e) {
      console.error('Failed to parse tool result:', e);
    }
  }

  // Remove tool markers from content
  const cleanContent = content.replace(toolRegex, '').trim();

  return { cleanContent, toolCalls };
}

export function useChat(initialMessages: Message[] = [], chatId?: string | null) {
  const [state, setState] = useState<ChatState>({
    messages: initialMessages,
    isLoading: false,
    error: null,
  });
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId || null);

  const addMessage = useCallback((message: Message) => {
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    const { cleanContent, toolCalls } = parseToolResults(content);

    setState(prev => ({
      ...prev,
      messages: prev.messages.map((msg, idx) =>
        idx === prev.messages.length - 1
          ? { ...msg, content: cleanContent, toolCalls: toolCalls.length > 0 ? toolCalls : msg.toolCalls }
          : msg
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

  const loadChat = useCallback(async (loadChatId: string) => {
    console.log('[useChat] Loading chat:', loadChatId);
    setLoading(true);
    setError(null);

    try {
      const response = await apiFetch(`/api/chats/${loadChatId}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load chat');
      }

      const data = await response.json();
      console.log('[useChat] Loaded chat data:', {
        chatId: loadChatId,
        messageCount: data.messages?.length || 0,
        chatTitle: data.chat?.title
      });

      const loadedMessages: Message[] = (data.messages || []).map((msg: { id: string; role: 'user' | 'assistant'; content: string; createdAt: string }) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      }));

      setState(prev => ({
        ...prev,
        messages: loadedMessages,
        isLoading: false,
      }));

      setCurrentChatId(loadChatId);
      console.log('[useChat] Chat loaded successfully, messages set:', loadedMessages.length);

      return true;
    } catch (err) {
      console.error('[useChat] Failed to load chat:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chat');
      setLoading(false);
      return false;
    }
  }, [setLoading, setError]);

  // Set messages directly (for loading from chat history)
  const setMessages = useCallback((messages: Message[]) => {
    setState(prev => ({
      ...prev,
      messages,
    }));
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

    // Check for static route match first (instant response, no API call)
    const staticRoute = matchStaticRoute(content);
    if (staticRoute) {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: staticRoute.responseText,
        toolCalls: staticRoute.toolCalls,
        createdAt: new Date(),
      };
      addMessage(assistantMessage);

      // Track analytics for static route
      const turnNumber = state.messages.filter(m => m.role === 'user').length + 1;
      analytics.chatTurn(turnNumber, true);
      staticRoute.toolCalls.forEach(tool => {
        analytics.toolUsed(tool.name);
      });

      return; // Skip API call
    }

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
      const response = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...state.messages, userMessage],
          chatId: currentChatId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      // Check if a new chat was created and update the chatId
      const newChatId = response.headers.get('X-Chat-Id');
      if (newChatId && !currentChatId) {
        setCurrentChatId(newChatId);
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

      // Track chat turn after completion
      const { toolCalls } = parseToolResults(accumulatedContent);
      const turnNumber = state.messages.filter(m => m.role === 'user').length + 1;
      analytics.chatTurn(turnNumber, toolCalls.length > 0);

      // Track individual tool usage
      toolCalls.forEach(tool => {
        analytics.toolUsed(tool.name);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [state.messages, currentChatId, addMessage, updateLastMessage, setLoading, setError]);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    currentChatId,
    sendMessage,
    addMessage,
    clearMessages,
    loadChat,
    setMessages,
    setCurrentChatId,
  };
}
