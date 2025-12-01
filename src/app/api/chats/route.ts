import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase-server';

/**
 * GET /api/chats - List all chats for the current user/session
 */
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
          setAll() {},
        },
      }
    );

    const sessionUuid = request.headers.get('X-Session-UUID');
    const { data: { user } } = await supabase.auth.getUser();

    if (!sessionUuid && !user) {
      return NextResponse.json({ chats: [] });
    }

    // Use service role to bypass RLS for reliable queries
    const serverSupabase = getServerSupabase();

    let query = serverSupabase
      .from('chats')
      .select('id, title, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(50);

    if (user) {
      query = query.eq('user_id', user.id);
    } else if (sessionUuid) {
      query = query.eq('session_uuid', sessionUuid);
    }

    const { data: chats, error } = await query;

    if (error) {
      console.error('[Chats API] Query error:', error);
      return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
    }

    return NextResponse.json({ chats: chats || [] });
  } catch (error) {
    console.error('[Chats API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/chats - Create a new chat
 */
export async function POST(request: NextRequest) {
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
          setAll() {},
        },
      }
    );

    const sessionUuid = request.headers.get('X-Session-UUID');
    const { data: { user } } = await supabase.auth.getUser();

    if (!sessionUuid && !user) {
      return NextResponse.json({ error: 'Session required' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title = body.title || null;

    // Use service role to bypass RLS
    const serverSupabase = getServerSupabase();

    const { data: chat, error } = await serverSupabase
      .from('chats')
      .insert({
        session_uuid: sessionUuid,
        user_id: user?.id || null,
        title,
      })
      .select('id, title, created_at, updated_at')
      .single();

    if (error) {
      console.error('[Chats API] Insert error:', error);
      return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 });
    }

    return NextResponse.json({ chat });
  } catch (error) {
    console.error('[Chats API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
