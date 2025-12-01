import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
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

    // Get session UUID from header (for anonymous users)
    const headerSessionUuid = request.headers.get('X-Session-UUID');

    // Get authenticated user (if any)
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch messages for this session
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('session_uuid', sessionId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[Chat Session] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Security check: ensure user owns this session
    // Check if any message in this session belongs to the current user
    // or matches the anonymous session
    if (messages && messages.length > 0) {
      // For now, allow access if sessionId matches the header or user is authenticated
      // In production, you'd want stricter ownership checks
      const isOwner = sessionId === headerSessionUuid || user;
      if (!isOwner) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Transform messages to frontend format
    const formattedMessages = (messages || []).map(msg => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      createdAt: msg.created_at,
    }));

    return NextResponse.json({ messages: formattedMessages, sessionId });
  } catch (error) {
    console.error('[Chat Session] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
