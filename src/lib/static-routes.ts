import { ToolCall } from '@/types/chat';

/**
 * Static Routes - Bypass AI for deterministic button prompts
 *
 * These prompts always render the same component, so we can skip
 * the API call entirely and return an instant response.
 */

// Static data that would normally come from tool handlers
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

interface StaticRoute {
  // Patterns to match (case-insensitive, trimmed)
  patterns: string[];
  // The response text from "AI"
  responseText: string;
  // Tool calls to render
  toolCalls: ToolCall[];
}

// Generate unique IDs for tool calls
const generateId = () => crypto.randomUUID();

export const STATIC_ROUTES: StaticRoute[] = [
  // Services / Bento Grid
  {
    patterns: [
      'what services do you offer?',
      'what services do you offer',
      'show me your services',
      'what can you help with?',
      'what can you help with',
    ],
    responseText: 'Here\'s everything we can help you with:',
    toolCalls: [
      {
        id: generateId(),
        name: 'show_services',
        input: {},
        result: { displayed: true },
      },
    ],
  },

  // Tour / Why Golf Okay
  {
    patterns: [
      'show me everything golf okay has to offer',
      'why golf okay?',
      'why golf okay',
      'show me everything',
      'what makes you different?',
      'what makes you different',
    ],
    responseText: 'Let me show you what makes Golf Okay special:',
    toolCalls: [
      {
        id: generateId(),
        name: 'start_tour',
        input: {},
        result: { started: true },
      },
    ],
  },

  // Fleet / Transport
  {
    patterns: [
      'what transport options do you have?',
      'what transport options do you have',
      'show me your fleet',
      'show me the fleet',
      'transport options',
      'fleet options',
    ],
    responseText: 'Here\'s our fleet of comfortable vehicles:',
    toolCalls: [
      {
        id: generateId(),
        name: 'show_fleet',
        input: {},
        result: FLEET_DATA,
      },
    ],
  },

  // About Us
  {
    patterns: [
      'tell me about golf okay',
      'about golf okay',
      'who is golf okay?',
      'who is golf okay',
      'about you',
      'tell me about you',
    ],
    responseText: 'Here\'s a bit about us:',
    toolCalls: [
      {
        id: generateId(),
        name: 'show_about_us',
        input: {},
        result: ABOUT_DATA,
      },
    ],
  },

  // Plan a Trip - Itinerary Builder
  {
    patterns: [
      'help me plan a golf trip',
      'help me plan my first golf trip to thailand',
      'plan a trip',
      'plan a golf trip',
      'i want to plan a trip',
      'help me plan',
    ],
    responseText: 'Let\'s build your perfect Thailand golf experience!',
    toolCalls: [
      {
        id: generateId(),
        name: 'start_itinerary_builder',
        input: {},
        result: { region: null },
      },
    ],
  },
];

/**
 * Check if a message matches a static route
 * Returns the route if matched, null otherwise
 */
export function matchStaticRoute(message: string): StaticRoute | null {
  const normalized = message.toLowerCase().trim();

  for (const route of STATIC_ROUTES) {
    if (route.patterns.some(pattern => normalized === pattern)) {
      // Return a fresh copy with new IDs to avoid duplicate keys
      return {
        ...route,
        toolCalls: route.toolCalls.map(tc => ({
          ...tc,
          id: generateId(),
        })),
      };
    }
  }

  return null;
}
