import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/types/database';

// Helper to create Supabase client for API routes
async function createClient() {
  const cookieStore = await cookies();

  const client = createServerClient<Database>(
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

  return client;
}

// GET /api/saved-courses - Get user's saved courses
export async function GET() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch saved courses with course details
  const { data, error } = await supabase
    .from('saved_courses')
    .select(
      `
      id,
      course_id,
      created_at,
      courses (
        id,
        name,
        region,
        location,
        par,
        yardage,
        holes,
        tags,
        hero_image,
        description,
        green_fee
      )
    `
    )
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching saved courses:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ savedCourses: data });
}

// POST /api/saved-courses - Save a course
export async function POST(request: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body
  const body = await request.json();
  const { course_id } = body;

  if (!course_id) {
    return NextResponse.json({ error: 'course_id is required' }, { status: 400 });
  }

  // Check if already saved (prevent duplicates)
  const { data: existing } = await supabase
    .from('saved_courses')
    .select('id')
    .eq('user_id', session.user.id)
    .eq('course_id', course_id)
    .single();

  if (existing) {
    return NextResponse.json({ success: true, alreadySaved: true });
  }

  // Insert saved course
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('saved_courses')
    .insert({
      user_id: session.user.id,
      course_id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

// DELETE /api/saved-courses - Unsave a course by course_id
export async function DELETE(request: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse request body
  const body = await request.json();
  const { course_id } = body;

  if (!course_id) {
    return NextResponse.json({ error: 'course_id is required' }, { status: 400 });
  }

  // Delete saved course
  const { error } = await supabase
    .from('saved_courses')
    .delete()
    .eq('user_id', session.user.id)
    .eq('course_id', course_id);

  if (error) {
    console.error('Error deleting saved course:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
