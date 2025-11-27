import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { dbRowToCourse } from '@/types/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const region = searchParams.get('region');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    let query = supabase.from('courses').select('*');

    // Filter by region (skip if 'all' or not provided)
    if (region && region !== 'all') {
      query = query.eq('region', region);
    }

    // Filter by tags using array overlap
    if (tags && tags.length > 0) {
      query = query.overlaps('tags', tags);
    }

    // Apply limit
    query = query.limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch courses' },
        { status: 500 }
      );
    }

    // Transform database rows to frontend Course type
    const courses = data.map(dbRowToCourse);

    return NextResponse.json({ courses });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
