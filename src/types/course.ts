// Facility types for icon mapping
export type FacilityType = 'range' | 'restaurant' | 'locker' | 'proShop' | 'nightGolf' | 'spa';

// Signature feature displayed as badge
export interface SignatureFeature {
  icon: string;  // emoji
  label: string; // "Night Golf"
}

// Availability status for date-aware displays
export interface CourseAvailability {
  status: 'available' | 'limited' | 'unavailable' | 'checking' | 'unknown';
  date?: string;
  slots?: string[];
  nextAvailable?: string;
}

// Photo for gallery
export interface CoursePhoto {
  url: string;
  label: string; // "Signature Hole #7", "Clubhouse", etc.
}

// Trip day for context-aware actions
export interface TripDay {
  id: string;
  number: number;
  date?: string;
}

// Insight for personalized recommendations
export interface CourseInsight {
  icon: string; // emoji or icon name
  text: string;
}

export interface Course {
  id: string;
  name: string;
  region: 'bangkok' | 'phuket' | 'hua_hin' | 'chiang_mai' | 'pattaya';
  location: string;
  par: number;
  yardage: number;
  holes: 18 | 9;
  tags: string[];
  heroImage: string;
  description: string;
  greenFee: {
    weekday: { guest: number; member: number };
    weekend: { guest: number; member: number };
  };
  // Enhanced fields for new CourseCard hierarchy
  tier?: 'championship' | 'premium' | 'value';
  travelTimeFromBangkok?: string; // e.g., "45 min"
  hookLine?: string; // e.g., "Jack Nicklaus design, ranked #3 in Thailand"
  caddieFee?: number; // per round
  cartFee?: number; // per round
  advanceBooking?: string; // e.g., "Book 3 days ahead"
  facilities?: string[]; // Legacy: e.g., ["Driving range", "Pro shop", "Restaurant"]
  // New structured fields
  signatureFeature?: SignatureFeature; // Badge: 🌙 Night Golf
  facilityTypes?: FacilityType[]; // For icon display: ['range', 'restaurant', 'locker']
  // Photo gallery for expanded view
  photos?: CoursePhoto[];
}
