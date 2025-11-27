# Golf Okay - Changelog

## [2024-11-27] Phase 1 Foundation

### Added
- **Chat System** - Full chat engine with streaming responses
  - `useChat` hook for message state and API communication
  - `ChatContext` for global state sharing
  - Components: ChatContainer, MessageList, Message, ChatInput
  - Why: Core functionality for conversational UI
  - Impact: Users can send messages and receive streaming AI responses

- **Anthropic Integration** - Claude API with tool use
  - `/api/chat` POST endpoint with streaming
  - Golf Okay concierge persona in system prompt
  - Tool definitions: show_courses, show_course_detail, show_fleet, show_about_us
  - Why: Enable AI-powered responses with generative UI triggers
  - Impact: AI can respond contextually and trigger component rendering

- **CourseCarousel Component** - First generative UI
  - CourseCard with 3D flip animation (Framer Motion)
  - Horizontal scroll carousel with navigation
  - Mock data: 4 Thai golf courses
  - Why: Demonstrate generative UI pattern
  - Impact: AI tool calls render interactive course browsing

- **Page Refactor** - Component extraction
  - Extracted Sidebar, Header, MainContent, GreetingState
  - ChatProvider wraps application
  - Conditional rendering: greeting vs chat state
  - Why: Better code organization and maintainability
  - Impact: Cleaner architecture, easier to extend

### Technical Details
- Dependencies: @anthropic-ai/sdk, ai, framer-motion, clsx, tailwind-merge
- Model: claude-sonnet-4-20250514
- Build: Next.js 16 Turbopack, successful production build

---

## [2024-11-27] Phase 2 Data Layer

### Added
- **Supabase Integration** - Database for course data
  - `lib/supabase.ts` - Client initialization
  - `types/database.ts` - CourseRow types and conversion helpers
  - `supabase/schema.sql` - Table schema with 15 seeded courses
  - Why: Enable real data storage and querying
  - Impact: Courses now come from database, not mock data

- **Course API Endpoints**
  - `GET /api/courses` - List with region, tags, limit filters
  - `GET /api/courses/[id]` - Single course by ID
  - Why: RESTful access to course data
  - Impact: Frontend and AI tools can query courses

- **Tool Execution Loop** - Claude tools now execute
  - Rewrote `/api/chat/route.ts` with tool execution loop
  - `lib/tool-handlers.ts` - Handlers for all 4 tools
  - Tool results embedded as base64 markers in response
  - Why: AI tool_use blocks were detected but not executed
  - Impact: "Show me courses" now returns real Supabase data

- **New Generative UI Components**
  - `CourseDetailCard` - Full course info with pricing table, stats bar
  - `FleetCard` - Vehicle comparison (Sedan vs VIP Van)
  - `AboutCard` - Company info with glassmorphism styling
  - Why: Complete the generative UI pattern for all tools
  - Impact: All 4 tools now render appropriate components

### Changed
- `Message.tsx` - Updated to render all tool types with real data
- `useChat.ts` - Parse base64 tool result markers instead of simple markers

### Fixed
- Pre-existing lint errors in Header.tsx and Sidebar.tsx (any types)

### Technical Details
- New dependencies: @supabase/supabase-js, @supabase/ssr
- Database: 15 courses across Bangkok, Phuket, Pattaya, Hua Hin, Chiang Mai
- Tool flow: Claude → tool_use → execute handler → tool_result → final response
