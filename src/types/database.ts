export type Region = 'bangkok' | 'phuket' | 'hua_hin' | 'chiang_mai' | 'pattaya';

export interface GreenFee {
  weekday: { guest: number; member: number };
  weekend: { guest: number; member: number };
}

export interface CourseRow {
  id: string;
  name: string;
  region: Region;
  location: string;
  par: number;
  yardage: number;
  holes: number;
  tags: string[];
  hero_image: string | null;
  description: string | null;
  green_fee: GreenFee;
  created_at: string;
}

export interface SavedCourse {
  id: string;
  user_id: string;
  course_id: string;
  created_at: string;
}

export interface ItineraryDraft {
  id: string;
  user_id: string;
  name: string | null;
  draft_json: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: CourseRow;
        Insert: Omit<CourseRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<CourseRow, 'id' | 'created_at'>>;
      };
      saved_courses: {
        Row: SavedCourse;
        Insert: Omit<SavedCourse, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<SavedCourse, 'id' | 'created_at'>>;
      };
      itinerary_drafts: {
        Row: ItineraryDraft;
        Insert: Omit<ItineraryDraft, 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<ItineraryDraft, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
}

// Helper type to convert database row to frontend Course type
export function dbRowToCourse(row: CourseRow) {
  return {
    id: row.id,
    name: row.name,
    region: row.region,
    location: row.location,
    par: row.par,
    yardage: row.yardage,
    holes: row.holes as 9 | 18,
    tags: row.tags,
    heroImage: row.hero_image || '',
    description: row.description || '',
    greenFee: row.green_fee,
  };
}
