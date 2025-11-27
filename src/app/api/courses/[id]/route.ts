import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { dbRowToCourse } from '@/types/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Course not found' },
          { status: 404 }
        );
      }
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch course' },
        { status: 500 }
      );
    }

    const course = dbRowToCourse(data);

    return NextResponse.json({ course });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
