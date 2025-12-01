import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { getServerSupabase } from '@/lib/supabase-server';

/**
 * GET /api/chats/[chatId] - Get a chat with its messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverSupabase = getServerSupabase();

    // Get the chat
    const { data: chat, error: chatError } = await serverSupabase
      .from('chats')
      .select('id, title, session_uuid, user_id, created_at, updated_at')
      .eq('id', chatId)
      .single();

    if (chatError || !chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    // Verify ownership
    const isOwner = (user && chat.user_id === user.id) ||
                    (sessionUuid && chat.session_uuid === sessionUuid);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get messages for this chat
    const { data: messages, error: messagesError } = await serverSupabase
      .from('chat_messages')
      .select('id, role, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('[Chat API] Messages query error:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    console.log('[Chat API] Loaded chat:', {
      chatId,
      chatTitle: chat.title,
      messageCount: messages?.length || 0
    });

    return NextResponse.json({
      chat: {
        id: chat.id,
        title: chat.title,
        created_at: chat.created_at,
        updated_at: chat.updated_at,
      },
      messages: (messages || []).map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.created_at,
      })),
    });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/chats/[chatId] - Update chat title
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title } = body;

    const serverSupabase = getServerSupabase();

    // Verify ownership first
    const { data: chat } = await serverSupabase
      .from('chats')
      .select('session_uuid, user_id')
      .eq('id', chatId)
      .single();

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const isOwner = (user && chat.user_id === user.id) ||
                    (sessionUuid && chat.session_uuid === sessionUuid);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the chat
    const { data: updated, error } = await serverSupabase
      .from('chats')
      .update({ title })
      .eq('id', chatId)
      .select('id, title, updated_at')
      .single();

    if (error) {
      console.error('[Chat API] Update error:', error);
      return NextResponse.json({ error: 'Failed to update chat' }, { status: 500 });
    }

    return NextResponse.json({ chat: updated });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/chats/[chatId] - Delete a chat and its messages
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params;
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const serverSupabase = getServerSupabase();

    // Verify ownership first
    const { data: chat } = await serverSupabase
      .from('chats')
      .select('session_uuid, user_id')
      .eq('id', chatId)
      .single();

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }

    const isOwner = (user && chat.user_id === user.id) ||
                    (sessionUuid && chat.session_uuid === sessionUuid);
    if (!isOwner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Delete the chat (messages will be cascade deleted)
    const { error } = await serverSupabase
      .from('chats')
      .delete()
      .eq('id', chatId);

    if (error) {
      console.error('[Chat API] Delete error:', error);
      return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Chat API] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
