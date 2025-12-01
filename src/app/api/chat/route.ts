import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { golfOkayTools, GOLF_OKAY_SYSTEM_PROMPT } from '@/lib/tools';
import { executeToolCall } from '@/lib/tool-handlers';
import { retrieveContext } from '@/lib/memory-retrieval';
import { buildEnhancedSystemPrompt } from '@/lib/context-builder';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/**
 * Save a chat message to the database
 */
async function saveChatMessage(
  sessionUuid: string,
  userId: string | null,
  role: 'user' | 'assistant',
  content: string
): Promise<string | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .insert({
        session_uuid: sessionUuid,
        user_id: userId,
        role,
        content,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Chat] Failed to save message:', error);
      return null;
    }

    return data?.id || null;
  } catch (err) {
    console.error('[Chat] Error saving message:', err);
    return null;
  }
}

/**
 * Trigger passive profiler edge function (fire-and-forget)
 * Extracts implicit preferences from user messages
 */
async function triggerPassiveProfiler(
  messageId: string,
  sessionUuid: string,
  userId: string | null,
  content: string,
  recentMessages: Array<{ role: string; content: string }>
): Promise<void> {
  // Skip short messages - not worth extracting
  if (content.length < 20) {
    return;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.warn('[Passive Profiler] Missing Supabase credentials, skipping extraction');
    return;
  }

  // Fire and forget - don't block the response
  fetch(`${supabaseUrl}/functions/v1/extract-memories`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      message_id: messageId,
      session_uuid: sessionUuid,
      user_id: userId,
      content,
      context: recentMessages
        .slice(-3)
        .map((m) => `${m.role}: ${m.content}`)
        .join('\n'),
    }),
  }).catch((error) => {
    console.error('[Passive Profiler] Failed to trigger extraction:', error);
  });
}

/**
 * Get user ID from session cookie if authenticated
 */
async function getUserIdFromSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Read-only in API routes
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch (error) {
    console.error('[Chat] Failed to get user from session:', error);
    return null;
  }
}

interface ToolCallResult {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Extract session UUID from headers for Active Memory tools
    const sessionUuid = request.headers.get('X-Session-UUID') || undefined;

    // Get user ID from session (if authenticated)
    const userId = await getUserIdFromSession();

    // Transform messages to Anthropic format
    // Filter out messages with empty content (can happen with tool-only responses)
    const anthropicMessages: Anthropic.MessageParam[] = messages
      .filter((msg: { role: string; content: string }) => msg.content && msg.content.trim() !== '')
      .map((msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Get the latest user message for context retrieval
    const latestMessage = messages[messages.length - 1];
    const latestContent = latestMessage?.content || '';

    // Save the user message to the database (non-blocking)
    let userMessageId: string | null = null;
    if (sessionUuid && latestContent && latestMessage?.role === 'user') {
      userMessageId = await saveChatMessage(sessionUuid, userId, 'user', latestContent);
    }

    // Step 1: Retrieve context (memories, history, itinerary state)
    let systemPrompt = GOLF_OKAY_SYSTEM_PROMPT;

    if (sessionUuid) {
      try {
        const retrieved = await retrieveContext(
          sessionUuid,
          userId,
          latestContent,
          { memoryCount: 5, historyCount: 10, similarityThreshold: 0.7 }
        );

        // Step 2: Build enhanced system prompt with context
        systemPrompt = buildEnhancedSystemPrompt(
          GOLF_OKAY_SYSTEM_PROMPT,
          retrieved,
          { maxMemoryTokens: 500, maxHistoryTokens: 1000 }
        );
      } catch (error) {
        console.error('[Chat] Context retrieval failed, using base prompt:', error);
        // Gracefully degrade to base prompt
      }
    }

    // First API call - may return tool use
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      tools: golfOkayTools,
      messages: anthropicMessages,
    });

    // Collect tool calls and their results
    const toolResults: ToolCallResult[] = [];

    // Tool execution loop - keep going until no more tool calls
    while (response.stop_reason === 'tool_use') {
      // Find all tool use blocks in the response
      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
      );

      // Execute each tool and collect results
      const toolResultsForClaude: Anthropic.ToolResultBlockParam[] = [];

      for (const toolUse of toolUseBlocks) {
        const result = await executeToolCall(
          toolUse.name,
          toolUse.input as Record<string, unknown>,
          sessionUuid
        );

        // Store for frontend
        toolResults.push({
          id: toolUse.id,
          name: toolUse.name,
          input: toolUse.input as Record<string, unknown>,
          result,
        });

        // Format for Claude
        toolResultsForClaude.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      }

      // Build the assistant message with the tool use blocks
      const assistantContent: Anthropic.ContentBlockParam[] = response.content.map((block) => {
        if (block.type === 'text') {
          return { type: 'text' as const, text: block.text };
        }
        if (block.type === 'tool_use') {
          return {
            type: 'tool_use' as const,
            id: block.id,
            name: block.name,
            input: block.input,
          };
        }
        return block as Anthropic.ContentBlockParam;
      });

      // Continue conversation with tool results
      response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        tools: golfOkayTools,
        messages: [
          ...anthropicMessages,
          { role: 'assistant', content: assistantContent },
          { role: 'user', content: toolResultsForClaude },
        ],
      });
    }

    // Extract final text from response
    const textContent = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map((block) => block.text)
      .join('');

    // Build response with embedded tool results
    // Format: text content + tool result markers that frontend can parse
    let finalResponse = textContent;

    // Append tool results as parseable JSON markers
    for (const tool of toolResults) {
      const toolData = JSON.stringify({
        id: tool.id,
        name: tool.name,
        input: tool.input,
        result: tool.result,
      });
      // Use a unique delimiter that won't appear in normal text
      finalResponse += `\n<!--TOOL_RESULT:${Buffer.from(toolData).toString('base64')}-->`;
    }

    // Save the assistant response to the database (non-blocking)
    if (sessionUuid && textContent) {
      saveChatMessage(sessionUuid, userId, 'assistant', textContent);
    }

    // Step 6: Trigger passive profiler (async, non-blocking)
    // Extracts implicit preferences from user messages
    if (sessionUuid && latestContent && userMessageId) {
      triggerPassiveProfiler(
        userMessageId,
        sessionUuid,
        userId,
        latestContent,
        anthropicMessages.map((m) => ({
          role: typeof m.content === 'string' ? (m.role as string) : 'user',
          content: typeof m.content === 'string' ? m.content : '',
        }))
      );
    }

    return new Response(finalResponse, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process chat request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
