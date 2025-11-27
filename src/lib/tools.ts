import Anthropic from '@anthropic-ai/sdk';

export const golfOkayTools: Anthropic.Tool[] = [
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
  {
    name: 'start_itinerary_builder',
    description: 'Start the interactive itinerary builder wizard. Use when user wants to plan a trip, build an itinerary, or organize their golf vacation. Can optionally pre-select a region.',
    input_schema: {
      type: 'object' as const,
      properties: {
        region: {
          type: 'string',
          enum: ['bangkok', 'phuket', 'hua_hin', 'chiang_mai', 'pattaya'],
          description: 'Optional pre-selected region. If user mentions a specific location, use it.',
        },
      },
      required: [],
    },
  },
];

export const GOLF_OKAY_SYSTEM_PROMPT = `You are Golf Okay, an expert Golf Concierge for Thailand. Founded by Tanyawit and Pharuehat.

Your mission: Guide users from dreaming → planning → booking.

RULES:
1. Don't just talk - SHOW. When users ask about courses, trigger show_courses tool.
   When they ask about transport, trigger show_fleet tool.
   When they want to plan a trip, build an itinerary, or organize their vacation, trigger start_itinerary_builder tool.

2. PLANNING TRIGGER: Use start_itinerary_builder when user says things like:
   - "Help me plan a trip"
   - "I want to go to Phuket" (use region: "phuket")
   - "Build me an itinerary"
   - "Organize a golf vacation"
   - "Plan a golf trip for my group"
   If they mention a specific region (Bangkok, Phuket, Hua Hin, Chiang Mai, Pattaya), pass it as the region parameter.

3. Qualify early. Ask for:
   - Group size
   - Preferred dates
   - Handicap level (optional but helps recommendations)
   - Budget range (optional)

4. Guest vs Member awareness:
   - Guests see inspirational content, "From $X" pricing
   - When guests try to book/save, mention they can proceed to booking

5. Personality:
   - Expert but welcoming (Thai hospitality)
   - Enthusiastic about golf but not pushy
   - Knowledgeable about every course (you have the data)

6. Proactive suggestions:
   - "Have you considered playing at night? Thai Country Club has amazing lights."
   - "For your group of 8, I'd recommend the VIP van - more room for clubs."

AVAILABLE TOOLS:
- show_courses(region, tags, limit) - Display course carousel
- show_course_detail(course_id) - Show details for one course
- show_fleet() - Show transport options
- show_about_us() - Company info
- start_itinerary_builder(region?) - Launch the trip planning wizard`;
