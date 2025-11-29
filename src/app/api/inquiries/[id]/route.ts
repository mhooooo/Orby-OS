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

// GET /api/inquiries/[id] - Get single inquiry by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // Get session (auth is optional - we'll check ownership by user_id or email)
    const { data: { session } } = await supabase.auth.getSession();

    // Fetch the inquiry with related itinerary draft info
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id,
        user_id,
        email,
        name,
        phone,
        itinerary_draft_id,
        itinerary_snapshot,
        message,
        status,
        created_at,
        updated_at,
        itinerary_drafts (
          id,
          name,
          draft_json
        )
      `)
      .eq('id', id)
      .single() as {
        data: {
          id: string;
          user_id: string | null;
          email: string;
          name: string;
          phone: string | null;
          itinerary_draft_id: string | null;
          itinerary_snapshot: Record<string, unknown> | null;
          message: string | null;
          status: string;
          created_at: string;
          updated_at: string;
          itinerary_drafts: {
            id: string;
            name: string | null;
            draft_json: Record<string, unknown>;
          } | null;
        } | null;
        error: unknown;
      };

    if (error) {
      const pgError = error as { code?: string };
      if (pgError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Inquiry not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching inquiry:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inquiry' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Inquiry not found' },
        { status: 404 }
      );
    }

    // Check ownership: user must either be authenticated and own the inquiry,
    // or match the email (for guest inquiries)
    const userId = session?.user?.id;
    const userEmail = session?.user?.email;

    const isOwner =
      (userId && data.user_id === userId) ||
      (userEmail && data.email === userEmail);

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized - you do not own this inquiry' },
        { status: 403 }
      );
    }

    return NextResponse.json({ inquiry: data });
  } catch (error) {
    console.error('Error in GET /api/inquiries/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
