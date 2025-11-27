import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';
import { golfOkayTools, GOLF_OKAY_SYSTEM_PROMPT } from '@/lib/tools';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

    // Create streaming response
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: GOLF_OKAY_SYSTEM_PROMPT,
      tools: golfOkayTools,
      messages: anthropicMessages,
    });

    // Create a ReadableStream that handles both text and tool use
    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              const delta = event.delta;
              if ('text' in delta) {
                controller.enqueue(encoder.encode(delta.text));
              }
            }

            // Handle tool use - send as special marker
            if (event.type === 'content_block_start') {
              const block = event.content_block;
              if (block.type === 'tool_use') {
                // We'll handle tool results in a follow-up
                controller.enqueue(
                  encoder.encode(`\n[TOOL:${block.name}:${block.id}]`)
                );
              }
            }

            if (event.type === 'content_block_stop') {
              // Check if we just finished a tool use block
            }
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
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
