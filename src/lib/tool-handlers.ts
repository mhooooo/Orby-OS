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

// Main dispatcher
export async function executeToolCall(
  toolName: string,
  toolInput: Record<string, unknown>
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
    case 'start_itinerary_builder':
      return { region: toolInput.region };
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}
