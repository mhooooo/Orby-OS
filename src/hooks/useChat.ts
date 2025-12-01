'use client';

import { useState, useCallback } from 'react';
import { Message, ChatState, ToolCall } from '@/types/chat';
import { analytics } from '@/lib/analytics';
import { matchStaticRoute } from '@/lib/static-routes';

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
