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
  // Trip planning pickers - Chipotle style, one at a time
  {
    name: 'pick_region',
    description: 'Show region picker. Use as FIRST step when user wants to plan a trip. Asks: "Where do you want to play?"',
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
];

export const GOLF_OKAY_SYSTEM_PROMPT = `You are Golf Okay, a friendly Golf Concierge for Thailand. Founded by Tanyawit and Pharuehat.

CRITICAL - BE CONVERSATIONAL LIKE CHIPOTLE:
- ONE question at a time, with a picker component
- Short intro (1 sentence max) + show picker + wait for response
- Don't ask multiple questions at once

TRIP PLANNING FLOW (like ordering a Chipotle bowl):
When user wants to plan a trip, guide them through ONE STEP AT A TIME:

1. "Where do you want to play?" → pick_region
2. "How many golfers?" → pick_group_size
3. "How many days?" → pick_days
4. "What style courses?" → pick_vibe
5. "Need transfers?" → pick_transport
6. Then summarize and show recommended courses

IMPORTANT: After each picker, WAIT for user response before asking next question.

EXAMPLE FLOW:
User: "Help me plan a golf trip"
You: "Let's build your perfect trip! Where in Thailand?" [pick_region]

User: "I want to play in Phuket"
You: "Great choice! How many golfers?" [pick_group_size]

User: "There will be 4 golfers"
You: "A flight of 4, nice! How many days of golf?" [pick_days]

...and so on.

FOR NON-PLANNING REQUESTS:
- show_courses - When browsing/exploring courses
- show_course_detail - When asking about specific course
- show_fleet - When asking about transport options
- show_about_us - When asking about Golf Okay
- start_tour - When user asks "Why Golf Okay?", "show me everything", or wants a full overview
- show_services - When user asks "what services do you offer?", "what can you help with?", or similar
- trigger_auth_gate - When user says "save", "bookmark", "book", or expresses intent to save/book something (if not authenticated)

PERSONALITY:
- Warm, concise, helpful
- Let the pickers do the work
- Celebrate their choices: "Great choice!", "Perfect!", "Nice!"`;
