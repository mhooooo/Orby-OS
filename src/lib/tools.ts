import Anthropic from '@anthropic-ai/sdk';

const BASE_TOOLS: Anthropic.Tool[] = [
  {
    name: 'show_courses',
    description: 'Display a carousel of golf courses based on filters. Use when user asks about courses, recommendations, or wants to browse options.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          enum: ['bangkok', 'phuket', 'hua_hin', 'chiang_mai', 'pattaya', 'all'],
          description: 'Filter by region. Use "all" if not specified.',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: 'Filter by tags like championship, night_golf, scenic, value',
        },
        limit: {
          type: 'number',
          description: 'Maximum courses to show. Default 4.',
        },
      },
      required: ['region'],
    },
  },
  {
    name: 'show_course_detail',
    description: 'Show detailed information about a specific golf course.',
    input_schema: {
      type: 'object' as const,
      properties: {
        course_id: {
          type: 'string',
          description: 'The ID of the course to show details for',
        },
      },
      required: ['course_id'],
    },
  },
  {
    name: 'show_fleet',
    description: 'Display transport/fleet options for golf trips.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'show_about_us',
    description: 'Display information about Golf Okay and the founders.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  // Trip planning
  {
    name: 'start_itinerary_builder',
    description: 'Start the itinerary builder wizard. Use when user wants to plan a trip, build an itinerary, or says "help me plan". Shows a self-contained wizard card with progress indicator.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          enum: ['bangkok', 'phuket', 'hua_hin', 'chiang_mai', 'pattaya'],
          description: 'Pre-select a region if user already mentioned one',
        },
      },
      required: [],
    },
  },
  // Individual pickers (for future segmented flow)
  {
    name: 'pick_region',
    description: 'Show region picker as standalone component. Use for quick region selection outside of full itinerary builder.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'pick_group_size',
    description: 'Show group size picker. Use AFTER knowing region. Asks: "How many golfers?"',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'pick_days',
    description: 'Show days picker. Use AFTER knowing group size. Asks: "How many days of golf?"',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'pick_vibe',
    description: 'Show vibe/style picker. Use AFTER knowing days. Asks: "What style of courses?"',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'pick_transport',
    description: 'Show transport picker. Use AFTER knowing vibe. Asks: "Need transfers?"',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'start_tour',
    description: 'Start the Golf Okay guided tour. Shows an interactive showcase of all services. Use when user asks "Why Golf Okay?", wants to learn about the company, or says "show me everything".',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'show_services',
    description: 'Show all Golf Okay services in an interactive bento grid. Use when user asks about services, what you offer, or says "what can you help with".',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  {
    name: 'trigger_auth_gate',
    description: 'Trigger authentication modal when user wants to save courses, save itinerary, or book. Use this when the user expresses intent to save, bookmark, or book something and they are not authenticated.',
    input_schema: {
      type: 'object' as const,
      properties: {
        reason: {
          type: 'string',
          enum: ['save_course', 'save_itinerary', 'book_intent'],
          description: 'The reason for triggering authentication',
        },
      },
      required: ['reason'],
    },
  },
  {
    name: 'start_inquiry',
    description: 'Show the booking inquiry form when user wants to book, request a quote, or make a reservation. Use this when user expresses booking intent like "I want to book", "request quote", "make a reservation", "ready to book".',
    input_schema: {
      type: 'object' as const,
      properties: {
        context: {
          type: 'string',
          description: 'Brief context about what the user wants to book (optional)',
        },
      },
      required: [],
    },
  },
];

// Active Memory Tools - Update itinerary_drafts in real-time
export const ACTIVE_MEMORY_TOOLS: Anthropic.Tool[] = [
  {
    name: 'set_trip_dates',
    description: 'Set the travel dates for the trip. Use when user specifies dates like "next Tuesday", "March 15-20", etc.',
    input_schema: {
      type: 'object' as const,
      properties: {
        start_date: {
          type: 'string',
          description: 'Start date in YYYY-MM-DD format',
        },
        end_date: {
          type: 'string',
          description: 'End date in YYYY-MM-DD format (optional for single day)',
        },
        flexibility: {
          type: 'string',
          enum: ['fixed', 'flexible_1_day', 'flexible_week'],
          description: 'How flexible are these dates',
        },
      },
      required: ['start_date'],
    },
  },
  {
    name: 'set_group_size',
    description: 'Set the number of golfers in the group. Use when user mentions party size.',
    input_schema: {
      type: 'object' as const,
      properties: {
        count: {
          type: 'number',
          description: 'Number of golfers',
        },
        composition: {
          type: 'string',
          description: 'Optional: "couples", "friends", "corporate", "solo"',
        },
      },
      required: ['count'],
    },
  },
  {
    name: 'add_course_to_trip',
    description: 'Add a specific golf course to the itinerary. Use when user says they want to play a specific course.',
    input_schema: {
      type: 'object' as const,
      properties: {
        course_name: {
          type: 'string',
          description: 'Name of the course',
        },
        course_id: {
          type: 'string',
          description: 'Course ID if known',
        },
        preferred_date: {
          type: 'string',
          description: 'Preferred date for this course (YYYY-MM-DD)',
        },
        tee_time_preference: {
          type: 'string',
          enum: ['early_morning', 'morning', 'midday', 'afternoon'],
          description: 'Preferred tee time slot',
        },
      },
      required: ['course_name'],
    },
  },
  {
    name: 'set_budget',
    description: 'Set budget constraints for the trip. Use when user mentions budget, price sensitivity, or spending limits.',
    input_schema: {
      type: 'object' as const,
      properties: {
        total_budget: {
          type: 'number',
          description: 'Total budget in THB',
        },
        per_round_budget: {
          type: 'number',
          description: 'Max budget per round in THB',
        },
        tier: {
          type: 'string',
          enum: ['budget', 'mid_range', 'premium', 'luxury'],
          description: 'General budget tier',
        },
      },
      required: [],
    },
  },
  {
    name: 'set_transport_needs',
    description: 'Set transportation requirements. Use when user mentions transport, transfers, or vehicle needs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        need_airport_transfer: {
          type: 'boolean',
        },
        need_daily_transport: {
          type: 'boolean',
        },
        vehicle_preference: {
          type: 'string',
          enum: ['sedan', 'suv', 'van', 'minibus'],
        },
        pickup_location: {
          type: 'string',
        },
      },
      required: [],
    },
  },
  {
    name: 'set_special_requirements',
    description: 'Record special requirements or constraints. Use for accessibility, dietary, health needs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        needs_golf_cart: {
          type: 'boolean',
          description: 'User requires a golf cart',
        },
        dietary_restrictions: {
          type: 'array',
          items: { type: 'string' },
        },
        mobility_notes: {
          type: 'string',
        },
        other: {
          type: 'string',
        },
      },
      required: [],
    },
  },
];

export const GOLF_OKAY_SYSTEM_PROMPT = `You are Golf Okay, a friendly Golf Concierge for Thailand. Founded by Tanyawit and Pharuehat.

TRIP PLANNING:
When user wants to plan a trip, build an itinerary, or asks for help planning:
- Use start_itinerary_builder to show the wizard
- If user mentions a region (e.g., "plan a trip to Phuket"), pass it as the region parameter
- The wizard handles all steps internally - no need for follow-up questions
- Just provide a brief intro and let the wizard do the work

EXAMPLE:
User: "Help me plan a golf trip"
You: "Let's build your perfect Thailand golf experience!" [start_itinerary_builder]

User: "I want to plan a trip to Phuket"
You: "Great choice! Let's plan your Phuket golf adventure." [start_itinerary_builder with region: "phuket"]

ACTIVE MEMORY TOOLS:
When user provides HARD DATA (dates, group size, specific courses, budget, transport needs), use Active Memory tools to save this information:
- set_trip_dates - When user mentions specific dates (e.g., "March 15-20", "next Tuesday")
- set_group_size - When user mentions how many people (e.g., "we're 6 golfers", "solo trip")
- add_course_to_trip - When user names a specific course they want to play
- set_budget - When user mentions budget constraints (e.g., "under 5000 THB per round", "luxury only")
- set_transport_needs - When user mentions transport preferences (e.g., "need airport pickup", "prefer van")
- set_special_requirements - When user mentions dietary, mobility, or special needs

These tools update the itinerary_drafts table in real-time. The data persists and will be remembered across the session.

IMPORTANT: Use Active Memory tools for explicit data, not preferences or soft signals.

FOR OTHER REQUESTS:
- show_courses - When browsing/exploring courses
- show_course_detail - When asking about specific course
- show_fleet - When asking about transport options
- show_about_us - When asking about Golf Okay
- start_tour - When user asks "Why Golf Okay?", "show me everything", or wants a full overview
- show_services - When user asks "what services do you offer?", "what can you help with?", or similar
- trigger_auth_gate - When user says "save", "bookmark", "book", or expresses intent to save/book something (if not authenticated)
- start_inquiry - When user says "book", "reserve", "request quote", or expresses intent to make a booking

PERSONALITY:
- Warm, concise, helpful
- Let the pickers do the work
- Celebrate their choices: "Great choice!", "Perfect!", "Nice!"`;

// Export combined tools array
export const golfOkayTools: Anthropic.Tool[] = [...BASE_TOOLS, ...ACTIVE_MEMORY_TOOLS];
