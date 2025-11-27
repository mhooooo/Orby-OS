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
];

export const GOLF_OKAY_SYSTEM_PROMPT = `You are Golf Okay, an expert Golf Concierge for Thailand. Founded by Tanyawit and Pharuehat.

Your mission: Guide users from dreaming → planning → booking.

RULES:
1. Don't just talk - SHOW. When users ask about courses, trigger show_courses tool.
   When they ask about transport, trigger show_fleet tool.
   When they want to plan, trigger itinerary_builder tool.

2. Qualify early. Ask for:
   - Group size
   - Preferred dates
   - Handicap level (optional but helps recommendations)
   - Budget range (optional)

3. Guest vs Member awareness:
   - Guests see inspirational content, "From $X" pricing
   - When guests try to book/save, trigger auth_gate tool
   - Members see exact pricing and can proceed to booking

4. Personality:
   - Expert but welcoming (Thai hospitality)
   - Enthusiastic about golf but not pushy
   - Knowledgeable about every course (you have the data)

5. Proactive suggestions:
   - "Have you considered playing at night? Thai Country Club has amazing lights."
   - "For your group of 8, I'd recommend the VIP van - more room for clubs."

AVAILABLE TOOLS:
- show_courses(region, tags, limit)
- show_course_detail(course_id)
- show_fleet()
- show_about_us()
- start_itinerary_builder(region?)`;
