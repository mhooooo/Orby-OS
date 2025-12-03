import { supabase } from './supabase';
import { dbRowToCourse } from '@/types/database';
import { Course } from '@/types/course';

// Type definitions for tool inputs
interface ShowCoursesInput {
  region: string;
  tags?: string[];
  limit?: number;
}

interface ShowCourseDetailInput {
  course_id: string;
}

// Fleet and About data (static for now)
const FLEET_DATA = {
  vehicles: [
    {
      id: 'sedan',
      type: 'Premium Sedan',
      model: 'Toyota Camry',
      capacity: 3,
      luggage: 3,
      amenities: ['Air conditioning', 'Leather seats', 'WiFi', 'Water bottles'],
      pricePerDay: 2500,
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
    },
    {
      id: 'vip-van',
      type: 'VIP Van',
      model: 'Toyota Commuter',
      capacity: 8,
      luggage: 8,
      amenities: ['Air conditioning', 'Captain seats', 'WiFi', 'Entertainment system', 'Cooler box', 'USB charging'],
      pricePerDay: 4500,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    },
  ],
  notes: 'All vehicles include professional English-speaking driver. Airport transfers and multi-day packages available.',
};

const ABOUT_DATA = {
  company: 'Golf Okay',
  tagline: 'Your Golf Concierge in Thailand',
  founded: 1996,
  yearsExperience: 28,
  founders: [
    { name: 'Tanyawit', role: 'Co-Founder', expertise: 'Golf Operations' },
    { name: 'Pharuehat', role: 'Co-Founder', expertise: 'Customer Experience' },
  ],
  certifications: ['IAGTO Member', 'TAT Licensed'],
  stats: {
    coursesPartner: 50,
    happyGolfers: 10000,
    averageRating: 4.9,
  },
  description: 'Golf Okay has been helping international golfers discover the best of Thailand golf since 1996. With partnerships across 50+ premier courses and a fleet of comfortable vehicles, we handle everything from tee time bookings to airport transfers - so you can focus on your game.',
};

// Tool handler functions
export async function handleShowCourses(input: ShowCoursesInput): Promise<{ courses: Course[] }> {
  const { region, tags, limit = 4 } = input;

  let query = supabase.from('courses').select('*');

  if (region && region !== 'all') {
    query = query.eq('region', region);
  }

  if (tags && tags.length > 0) {
    query = query.overlaps('tags', tags);
  }

  query = query.limit(limit);

  const { data, error } = await query;

  if (error) {
    console.error('Failed to fetch courses:', error);
    return { courses: [] };
  }

  return { courses: data.map(dbRowToCourse) };
}

export async function handleShowCourseDetail(input: ShowCourseDetailInput): Promise<{ course: Course | null }> {
  const { course_id } = input;

  // Try to find by ID first
  const { data: idData, error: idError } = await supabase
    .from('courses')
    .select('*')
    .eq('id', course_id)
    .single();

  // If found by ID, return it
  if (!idError && idData) {
    return { course: dbRowToCourse(idData) };
  }

  // If not found by ID, try to find by name (case-insensitive partial match)
  const { data: searchData, error: searchError } = await supabase
    .from('courses')
    .select('*')
    .ilike('name', `%${course_id}%`)
    .limit(1)
    .single();

  if (searchError || !searchData) {
    console.error('Course not found:', course_id);
    return { course: null };
  }

  return { course: dbRowToCourse(searchData) };
}

export function handleShowFleet(): typeof FLEET_DATA {
  return FLEET_DATA;
}

export function handleShowAboutUs(): typeof ABOUT_DATA {
  return ABOUT_DATA;
}

// Active Memory Tool Handlers
// These handlers update the itinerary_drafts table in real-time

interface ActiveMemoryResult {
  success: boolean;
  updated_fields: string[];
  current_state: Record<string, unknown>;
}

export async function handleSetTripDates(
  input: { start_date: string; end_date?: string; flexibility?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  const { start_date, end_date, flexibility } = input;

  // Calculate number of days
  const start = new Date(start_date);
  const end = end_date ? new Date(end_date) : start;
  const numberOfDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  // Update or create itinerary draft
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      start_date,
      end_date: end_date || start_date,
      number_of_days: numberOfDays,
      date_flexibility: flexibility || 'fixed',
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['start_date', 'end_date', 'number_of_days', 'date_flexibility'],
    current_state: data || {},
  };
}

export async function handleSetGroupSize(
  input: { count: number; composition?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      group_size: input.count,
      group_composition: input.composition,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['group_size', 'group_composition'],
    current_state: data || {},
  };
}

export async function handleAddCourseToTrip(
  input: { course_name: string; course_id?: string; preferred_date?: string; tee_time_preference?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  // Find course by name if ID not provided
  let courseId = input.course_id;
  if (!courseId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: course } = await (supabase as any)
      .from('courses')
      .select('id')
      .ilike('name', `%${input.course_name}%`)
      .limit(1)
      .single();
    courseId = course?.id;
  }

  // Get current draft
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: draft } = await (supabase as any)
    .from('itinerary_drafts')
    .select('selected_courses')
    .eq('session_uuid', sessionUuid)
    .single();

  const currentCourses = draft?.selected_courses || [];
  const newCourse = {
    course_id: courseId,
    course_name: input.course_name,
    preferred_date: input.preferred_date,
    tee_time_preference: input.tee_time_preference,
    added_at: new Date().toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      selected_courses: [...currentCourses, newCourse],
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['selected_courses'],
    current_state: data || {},
  };
}

export async function handleSetBudget(
  input: { total_budget?: number; per_round_budget?: number; tier?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      total_budget: input.total_budget,
      per_round_budget: input.per_round_budget,
      budget_tier: input.tier,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['total_budget', 'per_round_budget', 'budget_tier'],
    current_state: data || {},
  };
}

export async function handleSetTransportNeeds(
  input: { need_airport_transfer?: boolean; need_daily_transport?: boolean; vehicle_preference?: string; pickup_location?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      transport_config: input,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['transport_config'],
    current_state: data || {},
  };
}

export async function handleSetSpecialRequirements(
  input: { needs_golf_cart?: boolean; dietary_restrictions?: string[]; mobility_notes?: string; other?: string },
  sessionUuid: string
): Promise<ActiveMemoryResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('itinerary_drafts')
    .upsert({
      session_uuid: sessionUuid,
      special_requirements: input,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'session_uuid',
    })
    .select()
    .single();

  return {
    success: !error,
    updated_fields: ['special_requirements'],
    current_state: data || {},
  };
}

// Main dispatcher
export async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>,
  sessionUuid?: string
): Promise<unknown> {
  switch (toolName) {
    case 'show_courses':
      return handleShowCourses(toolInput as unknown as ShowCoursesInput);
    case 'show_course_detail':
      return handleShowCourseDetail(toolInput as unknown as ShowCourseDetailInput);
    case 'show_fleet':
      return handleShowFleet();
    case 'show_about_us':
      return handleShowAboutUs();

    // Trip planning cards - return input for pre-filling
    case 'show_dates_card': {
      const { start_date, duration, golfers } = toolInput as { start_date?: string; duration?: number; golfers?: number };
      return { start_date, duration, golfers };
    }

    case 'show_region_map': {
      const { selected_regions, filter } = toolInput as { selected_regions?: string[]; filter?: string };
      return { selected_regions: selected_regions || [], filter };
    }

    case 'show_logistics_card': {
      const { airport_transfers, vehicle_type } = toolInput as { airport_transfers?: boolean; vehicle_type?: string };
      return { airport_transfers, vehicle_type };
    }

    // Guided tour - showcases all services
    case 'start_tour':
      return { started: true };

    // Services bento grid
    case 'show_services':
      return { displayed: true };

    // Auth gate trigger
    case 'trigger_auth_gate': {
      const { reason } = toolInput as { reason: string };
      return {
        type: 'auth_gate',
        reason,
      };
    }

    // Inquiry form
    case 'start_inquiry': {
      const { context } = toolInput as { context?: string };
      return {
        type: 'inquiry_form',
        context: context || null,
      };
    }

    // Active Memory Tools
    case 'set_trip_dates':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetTripDates(toolInput as unknown as { start_date: string; end_date?: string; flexibility?: string }, sessionUuid);

    case 'set_group_size':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetGroupSize(toolInput as unknown as { count: number; composition?: string }, sessionUuid);

    case 'add_course_to_trip':
      if (!sessionUuid) return { error: 'Session required' };
      return handleAddCourseToTrip(toolInput as unknown as { course_name: string; course_id?: string; preferred_date?: string; tee_time_preference?: string }, sessionUuid);

    case 'set_budget':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetBudget(toolInput as unknown as { total_budget?: number; per_round_budget?: number; tier?: string }, sessionUuid);

    case 'set_transport_needs':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetTransportNeeds(toolInput as unknown as { need_airport_transfer?: boolean; need_daily_transport?: boolean; vehicle_preference?: string; pickup_location?: string }, sessionUuid);

    case 'set_special_requirements':
      if (!sessionUuid) return { error: 'Session required' };
      return handleSetSpecialRequirements(toolInput as unknown as { needs_golf_cart?: boolean; dietary_restrictions?: string[]; mobility_notes?: string; other?: string }, sessionUuid);

    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
