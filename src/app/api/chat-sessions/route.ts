import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

    // Get session UUID from header (for anonymous users)
    const sessionUuid = request.headers.get('X-Session-UUID');

    // Get authenticated user (if any)
    const { data: { user } } = await supabase.auth.getUser();

    if (!sessionUuid && !user) {
      return NextResponse.json({ sessions: [] });
    }

    // Build query to get distinct sessions with their first user message as preview
    // and the most recent message timestamp
    let query = supabase
      .from('chat_messages')
      .select('session_uuid, content, role, created_at')
      .order('created_at', { ascending: true });

    if (user) {
      // For authenticated users, get all their sessions
      query = query.eq('user_id', user.id);
    } else if (sessionUuid) {
      // For anonymous users, only get current session
      query = query.eq('session_uuid', sessionUuid);
    }

    const { data: messages, error } = await query;

    if (error) {
      console.error('[Chat Sessions] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Group messages by session and extract preview
    const sessionMap = new Map<string, {
      session_uuid: string;
      preview: string;
      message_count: number;
      first_message_at: string;
      last_message_at: string;
    }>();

    for (const msg of messages || []) {
      const existing = sessionMap.get(msg.session_uuid);

      if (!existing) {
        // First message in this session - use user messages as preview
        sessionMap.set(msg.session_uuid, {
          session_uuid: msg.session_uuid,
          preview: msg.role === 'user' ? msg.content.slice(0, 100) : '',
          message_count: 1,
          first_message_at: msg.created_at,
          last_message_at: msg.created_at,
        });
      } else {
        // Update existing session
        existing.message_count++;
        existing.last_message_at = msg.created_at;
        // Update preview if this is a user message and we don't have one yet
        if (msg.role === 'user' && !existing.preview) {
          existing.preview = msg.content.slice(0, 100);
        }
      }
    }

    // Convert to array and sort by most recent
    const sessions = Array.from(sessionMap.values())
      .filter(s => s.preview) // Only show sessions with user messages
      .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
      .slice(0, 10); // Limit to 10 most recent

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('[Chat Sessions] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
