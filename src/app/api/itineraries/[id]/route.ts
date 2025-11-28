import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/database';

// Helper to create Supabase client for API routes
async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

// PUT /api/itineraries/[id] - Update existing itinerary draft
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { name, draft_json } = body;

    // Validate input
    if (!draft_json) {
      return NextResponse.json(
        { error: 'draft_json is required' },
        { status: 400 }
      );
    }

    // Build update payload with only the fields we want to update
    const updatePayload: {
      name?: string | null;
      draft_json?: Record<string, unknown>;
    } = {
      draft_json,
    };
    if (name !== undefined) {
      updatePayload.name = name;
    }

    // Verify ownership and update
    const { data, error } = await supabase
      .from('itinerary_drafts')
      .update(updatePayload as never)
      .eq('id', id)
      .eq('user_id', userId) // Ensure user owns this draft
      .select('id')
      .single() as { data: { id: string } | null; error: unknown };

    if (error) {
      const pgError = error as { code?: string };
      if (pgError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Itinerary not found or unauthorized' },
          { status: 404 }
        );
      }
      console.error('Error updating itinerary draft:', error);
      return NextResponse.json(
        { error: 'Failed to update itinerary' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data?.id, success: true });
  } catch (error) {
    console.error('Error in PUT /api/itineraries/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/itineraries/[id] - Delete itinerary draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Verify ownership and delete
    const { error } = await supabase
      .from('itinerary_drafts')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user owns this draft

    if (error) {
      console.error('Error deleting itinerary draft:', error);
      return NextResponse.json(
        { error: 'Failed to delete itinerary' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/itineraries/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
