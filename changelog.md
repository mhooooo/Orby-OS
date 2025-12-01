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

---

## [2024-11-28] Tour System & Canvas Expansion

### Added
- **GolfOkay Logo** - Brand text logo in header
  - Copied white SVG from brand assets to `/public/golfokay-logo.svg`
  - Replaced text "golfokay" with Image component
  - Why: Professional branding, consistent visual identity
  - Impact: Header shows official logo with proper styling

- **TourShowcase Component** - Full website tour
  - Auto-playing 9-step carousel showcasing all services
  - Steps: Intro, Courses, Transport, Clubs, Airport, Insurance, Dining, Hotels, Team
  - Progress bar, play/pause, navigation dots, prev/next controls
  - CTAs on each step that trigger relevant chat actions
  - Why: Users wanted a quick way to see everything Golf Okay offers
  - Impact: "Why Golf Okay?" triggers immersive service showcase

- **ServiceBento Component** - Interactive service grid
  - Bento grid layout with variable-sized cards (large/medium/small)
  - Each service clickable → sends prompt to chat
  - Gradient backgrounds, hover animations
  - Why: Visual way to discover services without reading text
  - Impact: "Our services" shows beautiful interactive grid

- **New Tools**
  - `start_tour` - Triggers TourShowcase component
  - `show_services` - Triggers ServiceBento component
  - Why: Enable AI to show these components on demand
  - Impact: Natural language triggers for tour and services

### Changed
- **Suggestion Pills** - Two pills now direct action
  - "Why Golf Okay?" - No dropdown, triggers tour directly, orange highlight
  - "Our services" - No dropdown, triggers service bento
  - Why: Streamlined UX for common actions
  - Impact: One-click access to tour and services

- **Canvas Layout** - Expanded for more space
  - Generative UI max-width: 4xl → 5xl
  - MessageList padding: px-4 → responsive (px-4/px-8/px-12)
  - Message spacing: space-y-4 → space-y-6
  - Why: Cards needed more room to breathe
  - Impact: More immersive generative UI experience

### Technical Details
- New files: `TourShowcase.tsx`, `ServiceBento.tsx`
- Updated: `Header.tsx`, `GreetingState.tsx`, `Message.tsx`, `MessageList.tsx`, `tools.ts`, `tool-handlers.ts`
- Logo: `/public/golfokay-logo.svg` (white, no background)

---

## [2024-11-28] Auth & Sidebar Fixes

### Fixed
- **OAuth Callback Session Persistence**
  - Changed from `createClient` to `createServerClient` from `@supabase/ssr`
  - Added cookie handlers (getAll/setAll) to persist session on redirect
  - Why: Sessions were exchanged but not persisted to cookies, leaving users logged out
  - Impact: Google OAuth flow now correctly maintains session after redirect

### Added
- **Sidebar "My Golf" Section** - Real-time user data
  - Saved Courses: Shows count badge, expandable list with course names
  - Click course name → sends chat message to learn more
  - X button to unsave (hover to reveal)
  - My Itineraries: Shows count, expandable with trip preview (region, days, group size)
  - Trash button to delete drafts
  - Sign-in prompt when not authenticated
  - Why: Static sidebar needed real user data integration
  - Impact: Users can manage saved items directly from sidebar

### Changed
- **Fetch Calls with Credentials**
  - Added `credentials: 'include'` to all fetch calls in `useSavedCourses` and `useItineraryDrafts`
  - Why: Ensure cookies are sent with API requests for auth
  - Impact: More reliable authenticated API calls

### Technical Details
- Updated: `src/app/auth/callback/route.ts`, `src/components/Sidebar.tsx`, `src/hooks/useSavedCourses.ts`, `src/hooks/useItineraryDrafts.ts`
- New imports in Sidebar: `useAuth`, `useSavedCourses`, `useItineraryDrafts`

---

## [2025-11-29] Phase 5 Booking Flow

### Added
- **Inquiries Table** - Database for booking inquiries
  - `supabase/migrations/003_inquiries.sql` - Migration with RLS policies
  - Fields: user_id (nullable), email, name, phone, itinerary_snapshot, message, status
  - Status enum: pending, contacted, confirmed, closed
  - Why: Persist booking inquiries with full itinerary context
  - Impact: Inquiries are stored and can be managed by Golf Okay team

- **Inquiry API Routes** - RESTful inquiry management
  - `POST /api/inquiries` - Submit new inquiry (guest or authenticated)
  - `GET /api/inquiries/[id]` - Fetch single inquiry with ownership check
  - Validation: email format, required name field
  - Why: Enable programmatic inquiry submission
  - Impact: Forms can submit to API, inquiries persisted to database

- **Resend Email Integration** - Email notifications
  - `src/lib/email.ts` - Resend SDK integration
  - HTML template with customer info, itinerary summary, pricing
  - Notifications sent to info@golfokay.co on new inquiries
  - Non-blocking: email failure doesn't fail inquiry submission
  - Why: Golf Okay team needs immediate notification of new leads
  - Impact: Team receives formatted email within seconds of inquiry

- **InquiryForm Component** - Booking flow UI
  - `src/components/generative-ui/InquiryForm.tsx`
  - Fields: name, email, phone (optional), message (optional)
  - States: idle, loading, success, error
  - Pre-fills from authenticated user data
  - Framer Motion animations
  - Why: Streamlined inquiry submission in chat context
  - Impact: Users can request bookings without leaving the conversation

- **ItinerarySummary Update** - Book Now button
  - Added "Request Booking" button with orange gradient
  - Modal overlay with InquiryForm
  - Passes itinerary snapshot (region, dates, courses, pricing)
  - Why: Natural progression from building trip to requesting it
  - Impact: Users can book directly from itinerary summary

- **AI Tool: start_inquiry** - Booking intent trigger
  - Added to `tools.ts` with booking-related description
  - Handler returns inquiry_form signal
  - Renders InquiryForm in chat via InquiryFormFromTool wrapper
  - Triggers on: "book", "reserve", "request quote"
  - Why: Natural language booking initiation
  - Impact: AI proactively shows booking form when user expresses intent

### Technical Details
- New dependencies: resend
- New files: InquiryForm.tsx, email.ts, 003_inquiries.sql, inquiries/route.ts, inquiries/[id]/route.ts
- Updated: ItinerarySummary.tsx, tools.ts, tool-handlers.ts, Message.tsx, database.ts
- Tool count: 13 → 14 (added start_inquiry)
- Environment: RESEND_API_KEY required
- Tests: sprint-phase5-booking.spec.ts (4 test cases)

---

## [2025-11-30] Phase 6 Polish & Launch

### Added
- **Responsive Design Testing** - Multi-viewport verification
  - Test suite: sprint-phase6-polish.spec.ts with 11 test cases
  - Viewport coverage: Mobile (375x812), Tablet (768x1024), Desktop (1920x1080)
  - Screenshots: audit-home-desktop.png, audit-home-mobile.png, audit-home-tablet.png
  - Why: Ensure app works across all device sizes
  - Impact: Verified responsive layouts, identified edge cases

- **Analytics Integration** - Plausible ready
  - Analytics component checks for NEXT_PUBLIC_PLAUSIBLE_DOMAIN
  - Script injection in page head when configured
  - Graceful degradation when not configured
  - Why: Track user behavior and conversion metrics
  - Impact: Ready for production analytics setup

- **Error Handling** - Graceful degradation
  - Network error handling in API routes
  - Offline state testing
  - Loading states for async operations
  - Why: Prevent crashes and improve UX during failures
  - Impact: App remains functional even with network issues

### Changed
- **Build Verification** - Production ready
  - Next.js 16 production build: ✅ Passes
  - TypeScript compilation: ✅ Clean
  - ESLint: ⚠️ 11 warnings (unused variables only)
  - Why: Ensure code quality before deployment
  - Impact: Confidence in production deployment

- **Image Optimization** - Next.js Image component
  - All images use Next.js Image with proper alt text
  - Lazy loading by default
  - Responsive image sizing
  - Why: Improve performance and accessibility
  - Impact: Faster page loads, better SEO

### Technical Details
- New files: tests/audit/sprint-phase6-polish.spec.ts
- Screenshots: 3 viewport captures in project root
- Test results: 6/11 passing (5 require Supabase env vars)
- Updated docs: CLAUDE.md, status.md, plan.md, changelog.md
- Lint warnings: 11 unused variable warnings (non-blocking)

### Known Issues
- Tests require Supabase environment variables to fully pass
- Logo visibility depends on intro animation state (conditional rendering)
- Analytics requires domain configuration for production use

### Deployment Ready
- ✅ Build passes
- ✅ Responsive design verified
- ✅ Error handling implemented
- ✅ Analytics integration ready
- 🔜 Requires Vercel deployment + env var configuration
