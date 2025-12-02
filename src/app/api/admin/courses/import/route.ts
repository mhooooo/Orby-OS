import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase-server';
import { parseCSV } from '@/lib/csv-parser';

interface RateRow {
  course_name: string;
  rate_type: string;
  net_rate: string;
  rack_rate?: string;
  day_type?: string;
  season?: string;
  valid_from?: string;
  valid_to?: string;
  includes_caddie?: string;
  includes_cart?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, imported: 0, errors: ['No file provided'] });
    }

    const content = await file.text();
    const rows = await parseCSV<RateRow>(content, { headers: true });

    const supabase = getServerSupabase();

    // Get all courses for name lookup
    const { data: courses } = await supabase
      .from('courses')
      .select('id, name');

    const courseMap = new Map(courses?.map(c => [c.name.toLowerCase(), c.id]) || []);

    const errors: string[] = [];
    const ratesToInsert: Record<string, unknown>[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2; // Account for header row

      // Find course by name
      const courseId = courseMap.get(row.course_name?.toLowerCase());
      if (!courseId) {
        errors.push(`Line ${lineNum}: Course "${row.course_name}" not found`);
        continue;
      }

      // Validate rate_type
      const validRateTypes = ['green_fee', 'caddie', 'cart', 'package'];
      if (!validRateTypes.includes(row.rate_type)) {
        errors.push(`Line ${lineNum}: Invalid rate_type "${row.rate_type}"`);
        continue;
      }

      // Parse numeric values
      const netRate = parseFloat(row.net_rate);
      if (isNaN(netRate)) {
        errors.push(`Line ${lineNum}: Invalid net_rate "${row.net_rate}"`);
        continue;
      }

      ratesToInsert.push({
        course_id: courseId,
        rate_type: row.rate_type,
        net_rate: netRate,
        rack_rate: row.rack_rate ? parseFloat(row.rack_rate) : null,
        day_type: row.day_type || 'all',
        season: row.season || 'all',
        valid_from: row.valid_from || null,
        valid_to: row.valid_to || null,
        includes_caddie: row.includes_caddie?.toLowerCase() === 'true',
        includes_cart: row.includes_cart?.toLowerCase() === 'true',
      });
    }

    // Insert rates
    if (ratesToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from('course_rates')
        .insert(ratesToInsert);

      if (insertError) {
        return NextResponse.json({
          success: false,
          imported: 0,
          errors: [`Database error: ${insertError.message}`],
        });
      }
    }

    return NextResponse.json({
      success: errors.length === 0 || ratesToInsert.length > 0,
      imported: ratesToInsert.length,
      errors,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({
      success: false,
      imported: 0,
      errors: ['Failed to parse CSV file'],
    });
  }
}
