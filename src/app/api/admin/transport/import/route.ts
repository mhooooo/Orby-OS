import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { parseCSV } from '@/lib/csv-parser';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface TransportRow {
  vehicle_type: string;
  route_type: string;
  origin_area: string;
  destination_area: string;
  net_rate: string;
  rack_rate?: string;
  max_passengers: string;
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, imported: 0, errors: ['No file provided'] });
    }

    const content = await file.text();
    const rows = await parseCSV<TransportRow>(content, { headers: true });

    const errors: string[] = [];
    const ratesToInsert: Record<string, unknown>[] = [];

    const validVehicleTypes = ['sedan', 'suv', 'van', 'minibus', 'coach'];
    const validRouteTypes = ['airport_transfer', 'golf_transfer', 'day_trip', 'hourly'];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const lineNum = i + 2;

      // Validate vehicle_type
      if (!validVehicleTypes.includes(row.vehicle_type)) {
        errors.push(`Line ${lineNum}: Invalid vehicle_type "${row.vehicle_type}"`);
        continue;
      }

      // Validate route_type
      if (!validRouteTypes.includes(row.route_type)) {
        errors.push(`Line ${lineNum}: Invalid route_type "${row.route_type}"`);
        continue;
      }

      // Parse numeric values
      const netRate = parseFloat(row.net_rate);
      const maxPassengers = parseInt(row.max_passengers);

      if (isNaN(netRate)) {
        errors.push(`Line ${lineNum}: Invalid net_rate "${row.net_rate}"`);
        continue;
      }

      if (isNaN(maxPassengers) || maxPassengers < 1) {
        errors.push(`Line ${lineNum}: Invalid max_passengers "${row.max_passengers}"`);
        continue;
      }

      ratesToInsert.push({
        vehicle_type: row.vehicle_type,
        route_type: row.route_type,
        origin_area: row.origin_area,
        destination_area: row.destination_area,
        net_rate: netRate,
        rack_rate: row.rack_rate ? parseFloat(row.rack_rate) : null,
        max_passengers: maxPassengers,
        notes: row.notes || null,
      });
    }

    // Insert rates
    if (ratesToInsert.length > 0) {
      const { error: insertError } = await supabaseAdmin
        .from('transport_rates')
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
