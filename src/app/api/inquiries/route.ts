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

// Email validation helper
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// POST /api/inquiries - Submit new inquiry
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get session (but allow guests to submit inquiries)
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id || null;

    const body = await request.json();
    const { email, name, phone, itinerary_draft_id, itinerary_snapshot, message } = body;

    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate name is not empty
    if (name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name cannot be empty' },
        { status: 400 }
      );
    }

    // Optional: Validate itinerary_draft_id exists if provided
    if (itinerary_draft_id) {
      const { data: draft } = await supabase
        .from('itinerary_drafts')
        .select('id')
        .eq('id', itinerary_draft_id)
        .single();

      if (!draft) {
        return NextResponse.json(
          { error: 'Itinerary draft not found' },
          { status: 404 }
        );
      }
    }

    // Insert inquiry
    const { data, error } = await supabase
      .from('inquiries')
      .insert({
        user_id: userId,
        email: email.trim(),
        name: name.trim(),
        phone: phone?.trim() || null,
        itinerary_draft_id: itinerary_draft_id || null,
        itinerary_snapshot: itinerary_snapshot || null,
        message: message?.trim() || null,
        status: 'pending',
      } as never)
      .select('id')
      .single() as { data: { id: string } | null; error: unknown };

    if (error) {
      console.error('Error creating inquiry:', error);
      return NextResponse.json(
        { error: 'Failed to submit inquiry' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, inquiry_id: data?.id });
  } catch (error) {
    console.error('Error in POST /api/inquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/inquiries - Get user's inquiries (requires auth)
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user's inquiries with optional itinerary draft info
    const { data, error } = await supabase
      .from('inquiries')
      .select(`
        id,
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) as {
        data: Array<{
          id: string;
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
        }> | null;
        error: unknown;
      };

    if (error) {
      console.error('Error fetching inquiries:', error);
      return NextResponse.json(
        { error: 'Failed to fetch inquiries' },
        { status: 500 }
      );
    }

    return NextResponse.json({ inquiries: data || [] });
  } catch (error) {
    console.error('Error in GET /api/inquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
