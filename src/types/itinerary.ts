import { Course } from './course';

// Region options for golf trips in Thailand
export type Region = 'bangkok' | 'phuket' | 'hua_hin' | 'chiang_mai' | 'pattaya';

// Vibe/style preferences for course recommendations
export type TripVibe = 'championship' | 'scenic' | 'value';

// Activity types within an itinerary day
export type ActivityType = 'golf' | 'arrival' | 'departure' | 'transfer' | 'hotel' | 'dinner';

// Individual activity within a day
export interface Activity {
  id: string;
  type: ActivityType;
  courseId?: string;
  course?: Course;
  teeTime?: string; // HH:MM format
  notes?: string;
  priceEstimate?: number;
}

// A single day in the itinerary
export interface ItineraryDay {
  dayNumber: number;
  date?: string; // ISO date string
  activities: Activity[];
}

// Transfer options
export interface TransferOption {
  enabled: boolean;
  vehicleType: 'sedan' | 'vip-van';
  includesAirportPickup: boolean;
}

// The main draft itinerary being built
export interface ItineraryDraft {
  id: string;
  region: Region | null;
  startDate: string | null; // ISO date string
  endDate: string | null; // ISO date string
  numberOfDays: number;
  groupSize: number;
  vibe: TripVibe | null;
  days: ItineraryDay[];
  transfers: TransferOption;
  includeCaddieTips: boolean;
  totalEstimate: number;
  status: 'draft' | 'complete' | 'submitted';
}

// Wizard step tracking
export type WizardStep = 'region' | 'vibe' | 'logistics' | 'dates' | 'summary';

// Context state for the wizard
export interface ItineraryWizardState {
  draft: ItineraryDraft;
  currentStep: WizardStep;
  availableCourses: Course[];
  isLoading: boolean;
  error: string | null;
}

// Context actions
export type ItineraryAction =
  | { type: 'SET_REGION'; payload: Region }
  | { type: 'SET_VIBE'; payload: TripVibe }
  | { type: 'SET_DATES'; payload: { startDate: string; endDate: string; numberOfDays: number } }
  | { type: 'SET_GROUP_SIZE'; payload: number }
  | { type: 'SET_TRANSFERS'; payload: Partial<TransferOption> }
  | { type: 'SET_CADDIE_TIPS'; payload: boolean }
  | { type: 'ADD_ACTIVITY'; payload: { dayNumber: number; activity: Activity } }
  | { type: 'REMOVE_ACTIVITY'; payload: { dayNumber: number; activityId: string } }
  | { type: 'SET_STEP'; payload: WizardStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'SET_COURSES'; payload: Course[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_TOTAL'; payload: number }
  | { type: 'RESET' }
  | { type: 'COMPLETE_WIZARD' };

// Helper to create a unique ID
// Helper to create a unique ID (SSR-safe)
export const createId = () => {
  if (typeof window === 'undefined') return 'server-generated-id';
  return Math.random().toString(36).substring(2, 9);
};

// Initial draft state
export const createInitialDraft = (region?: Region | null): ItineraryDraft => ({
  id: createId(),
  region: region || null,
  startDate: null,
  endDate: null,
  numberOfDays: 3,
  groupSize: 4,
  vibe: null,
  days: [],
  transfers: {
    enabled: true,
    vehicleType: 'vip-van',
    includesAirportPickup: true,
  },
  includeCaddieTips: true,
  totalEstimate: 0,
  status: 'draft',
});

// Step order for navigation
export const WIZARD_STEPS: WizardStep[] = ['region', 'vibe', 'logistics', 'dates', 'summary'];

// Region display names
export const REGION_NAMES: Record<Region, string> = {
  bangkok: 'Bangkok',
  phuket: 'Phuket',
  hua_hin: 'Hua Hin',
  chiang_mai: 'Chiang Mai',
  pattaya: 'Pattaya',
};

// Vibe descriptions
export const VIBE_INFO: Record<TripVibe, { label: string; description: string }> = {
  championship: {
    label: 'Championship',
    description: 'Tournament-quality courses, challenging layouts, premium facilities',
  },
  scenic: {
    label: 'Scenic',
    description: 'Beautiful landscapes, ocean views, memorable photography spots',
  },
  value: {
    label: 'Value',
    description: 'Great golf at accessible prices, local favorites',
  },
};
