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

// POST /api/itineraries - Create new itinerary draft
export async function POST(request: NextRequest) {
  try {
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

    // Insert into database
    const { data, error } = await supabase
      .from('itinerary_drafts')
      .insert({
        user_id: userId,
        name: name || null,
        draft_json,
      } as never)
      .select('id')
      .single() as { data: { id: string } | null; error: unknown };

    if (error) {
      console.error('Error creating itinerary draft:', error);
      return NextResponse.json(
        { error: 'Failed to save itinerary' },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: data?.id, success: true });
  } catch (error) {
    console.error('Error in POST /api/itineraries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/itineraries - Get user's itinerary drafts
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's drafts (newest first)
    const { data, error } = await supabase
      .from('itinerary_drafts')
      .select('id, name, draft_json, created_at, updated_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) as {
      data: Array<{
        id: string;
        name: string | null;
        draft_json: Record<string, unknown>;
        created_at: string;
        updated_at: string;
      }> | null;
      error: unknown;
    };

    if (error) {
      console.error('Error fetching itinerary drafts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch itineraries' },
        { status: 500 }
      );
    }

    // Format response with preview data
    const draftsWithPreview = (data || []).map((draft) => {
      const json = draft.draft_json as Record<string, unknown>;
      return {
        id: draft.id,
        name: draft.name,
        created_at: draft.created_at,
        updated_at: draft.updated_at,
        preview: {
          region: json.region || null,
          numberOfDays: json.numberOfDays || 0,
          groupSize: json.groupSize || 0,
          startDate: json.startDate || null,
        },
      };
    });

    return NextResponse.json({ drafts: draftsWithPreview });
  } catch (error) {
    console.error('Error in GET /api/itineraries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
