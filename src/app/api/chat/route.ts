import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { golfOkayTools, GOLF_OKAY_SYSTEM_PROMPT } from '@/lib/tools';
import { executeToolCall } from '@/lib/tool-handlers';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface ToolCallResult {
  id: string;
  name: string;
  input: Record<string, unknown>;
  result: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Transform messages to Anthropic format
    const anthropicMessages: Anthropic.MessageParam[] = messages.map(
      (msg: { role: string; content: string }) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })
    );

    // First API call - may return tool use
    let response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: GOLF_OKAY_SYSTEM_PROMPT,
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
          toolUse.input as Record<string, unknown>
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
        system: GOLF_OKAY_SYSTEM_PROMPT,
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
