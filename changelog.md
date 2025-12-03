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

---

## [2025-12-01] Memory System Complete

### Added
- **Embedding Service** - OpenAI text-embedding-3-small
  - `src/lib/embeddings.ts` - 1536-dimension vector generation
  - `getEmbedding()` and `getEmbeddingSafe()` functions
  - `cosineSimilarity()` utility for local comparisons
  - Why: Enable semantic search over user memories
  - Impact: AI can find relevant memories based on meaning, not keywords

- **Memory Retrieval Service** - Context gathering
  - `src/lib/memory-retrieval.ts` - Parallel query execution
  - Semantic search via `search_memories` RPC function
  - Recent chat history from `chat_messages` table
  - Current itinerary from `itinerary_drafts` table
  - Graceful fallback to recent memories if embeddings fail
  - Why: Gather all relevant context before AI responds
  - Impact: AI has full context of user preferences and trip state

- **Context Builder** - Enhanced system prompt
  - `src/lib/context-builder.ts` - Token-budgeted prompt sections
  - User Profile section (memories sorted by confidence)
  - Trip Planning State section (itinerary data)
  - Recent Conversation section (trimmed chat history)
  - Token budgets: 500 for memories, 1000 for history
  - Why: Inject relevant context into Claude's system prompt
  - Impact: AI responses are personalized and contextually aware

- **Passive Profiler Edge Function** - Implicit preference extraction
  - `supabase/functions/extract-memories/index.ts` - Deno Edge Function
  - Uses Claude Haiku for cost-effective extraction
  - Categories: play_style, budget, logistics, social, health
  - Rate limiting: 20 char min, 50 extractions/session max
  - Deduplication via similarity search (0.9 threshold)
  - Fire-and-forget trigger from chat route
  - Why: Extract preferences without explicit user input
  - Impact: AI learns user preferences naturally from conversation

- **Chat Message Persistence** - Conversation history
  - `src/lib/supabase-server.ts` - Service role client for API routes
  - User messages saved on receipt
  - Assistant responses saved before return
  - Why: Enable context retrieval from past conversations
  - Impact: AI remembers what was discussed in previous messages

- **System Prompt Updates** - Memory rules
  - LONG-TERM MEMORY: Prioritize User Profile facts
  - ACTIVE MEMORY: Use tools for hard data (dates, group size)
  - PASSIVE MEMORY: Automatic extraction of soft preferences
  - Why: Guide AI behavior around memory system
  - Impact: Consistent memory usage across conversations

### Fixed
- **FK Constraint on user_memories** - Migration to remove constraint
  - `supabase/migrations/20241201131900_fix_user_memories_fk.sql`
  - Why: Passive profiler generates message IDs before persistence
  - Impact: Memory extraction no longer fails on insert

### Technical Details
- New dependencies: None (uses existing OpenAI via fetch)
- New files: embeddings.ts, memory-retrieval.ts, context-builder.ts, supabase-server.ts
- Edge Function: extract-memories deployed to Supabase
- Secrets: ANTHROPIC_API_KEY, OPENAI_API_KEY set in Supabase
- Tests: sprint-memory-pipeline.spec.ts (13 tests all passing)
- Environment: OPENAI_API_KEY required for embeddings

### Memory System Flow
1. User sends message → saved to `chat_messages`
2. Context retrieved → memories, history, itinerary
3. Enhanced prompt built → injected into Claude
4. AI responds → response saved to `chat_messages`
5. Passive profiler → extracts preferences (async, non-blocking)
6. Memories stored → available for future context injection

---

## [2025-12-02] UI/UX Overhaul

### Added
- **Chat History System** - Persistent conversation threads
  - `supabase/migrations/20241201150000_chats_table.sql` - Chats table with session/user ownership
  - `src/app/api/chats/route.ts` - List/create chats API
  - `src/app/api/chats/[chatId]/route.ts` - Get/update/delete single chat
  - `src/hooks/useChatHistory.ts` - Chat list state management
  - `src/context/ChatHistoryContext.tsx` - Global chat history provider
  - `loadChat()` in useChat - Properly loads messages for selected chat
  - Why: Users needed persistent conversation history like Claude
  - Impact: Conversations persist and can be resumed

- **Sidebar Redesign** - Gemini-style layout
  - New Chat button at top with SquarePen icon
  - My Golf section with horizontal scrolling course cards
  - Plans section with Draft badges and delete buttons
  - Chats grouped by date (Today, Yesterday, Previous 7 Days, Previous 30 Days, Older)
  - Settings at bottom
  - Why: Declutter sidebar, organize by user intent
  - Impact: Cleaner navigation, better UX

- **Header Explore Dropdown** - Navigation menu
  - DISCOVER section: Find a Course, Plan a Trip (orange icons)
  - SERVICES section: Fleet & Transport, Club Rentals, etc. (gray icons)
  - Unified list design with strokeWidth={1.5} for consistency
  - Gray subtitles (not orange) for proper visual hierarchy
  - Why: Move Explore from sidebar to header for quick access
  - Impact: Streamlined navigation without sidebar clutter

- **Spectrum Pills** - Target mindset actions
  - First-Time Guide (purple #9B5DE5) - The Beginner
  - Top Rated (blue #00BBF9) - The Dreamer
  - Build a Trip (orange #FF6B35) - The Planner
  - Get a Price (red #F05D5E) - The Buyer
  - Premium pill design with colored icon containers
  - Why: Guide users based on their intent/mindset
  - Impact: Clear entry points for different user types

- **Morphing Avatar** - Dynamic agent presence
  - `src/components/AgentAvatar.tsx` - Avatar with halo effects
  - `src/components/MorphingAvatar.tsx` - Position morphing component
  - Thinking state: 5-color spinning conic gradient (blur: 8px)
  - Idle state: Subtle breathing glow animation
  - Hero position: Centered above greeting (80x80)
  - Chat position: Top-left header area (32x32)
  - Framer Motion spring animations for smooth transitions
  - Why: Establish AI as "main character" then get out of the way
  - Impact: Polished, premium feel during interactions

### Changed
- **GreetingState** - Removed static GolfOkayIcon (replaced by MorphingAvatar)
- **Page Layout** - Refactored to PageContent component for context access

### Fixed
- **Nested Button Error** - Changed saved course cards from `<button>` to `<div>`
- **Type Mismatches** - Fixed `handlePlanClick` to accept `string | null`

### Technical Details
- New files: AgentAvatar.tsx, MorphingAvatar.tsx, ChatHistoryContext.tsx, useChatHistory.ts
- Updated: Sidebar.tsx (complete rewrite), Header.tsx, GreetingState.tsx, page.tsx
- Migration: chats table with session_uuid, user_id, title, timestamps
- Colors: Brand palette (purple, blue, orange, red) in BRAND_COLORS constant
- Animation: Framer Motion for avatar morphing and halo spin

---

## [2025-12-02] NeuralDots Actor & Premium Polish

### Added
- **NeuralDots "Persistent Actor"** - AI presence visualization
  - Pentagon formation: 5 dots at 72° intervals (closed shape, not C-arc)
  - Dark Glass Orb: `bg-white/5 backdrop-blur-md border-white/10`
  - Neon glow on dots: `box-shadow: 0 0 15px color`
  - Three states: loading (chaos), hero (order), chat (compact)
  - Why: Golf ball dots on black don't read as a logo without a container
  - Impact: Premium "Iron Man / Jarvis" aesthetic

- **Snap-to-Static Behavior** - Confidence through stillness
  - Hero mode: NO animation - solid, fixed, confident
  - Loading mode: Spinning, breathing, chaotic
  - `isStatic` flag controls animation behavior
  - Scale locks at 1.15 with spring snap
  - Why: Constant breathing creates anxiety, signals "not ready"
  - Impact: Chaos → Order transition feels premium (Apple/Sony pattern)

- **Profile Modal "Black Card"** - Premium member card design
  - Credit card aspect ratio (340×195px, scaled down 20%)
  - Matte black (`#0a0a0a`) with SVG noise texture overlay
  - Gold accent (`#D4AF37`) for avatar ring, MEMBER badge, PRO status
  - Holographic name: `bg-gradient-to-r from-white via-purple-200 to-cyan-200`
  - Stats strip: HANDICAP | TRIPS | STATUS
  - Why: Generic admin modal doesn't convey golf status/premium
  - Impact: Amex Centurion-style exclusivity

- **Explore Menu "HUD Panel"** - Glassmorphism navigation
  - `border border-white/10` for crisp edges
  - `shadow-[0_10px_40px_-10px_rgba(255,255,255,0.05)]` white glow
  - `backdrop-blur-xl` for frosted glass depth
  - Hover: `bg-gradient-to-r from-white/5 to-transparent`
  - Left orange accent bar on hover (`border-l-2 border-l-[#FF6B35]`)
  - Why: Default CSS shadow looked flat against dark background
  - Impact: Menu floats with premium depth

### Changed
- **Sidebar Transparency** - Unified "dark glass" material
  - Changed from `bg-[#1E1F20]` to `bg-transparent`
  - Added `border-r border-white/5` for subtle edge
  - Why: Solid sidebar block clashed with airy center
  - Impact: Background flows through, cohesive material language

- **New Chat Button Demoted** - Concierge doesn't shout
  - Changed from loud orange gradient to ghost button
  - `bg-white/5` with `border-white/5` and muted text
  - Why: Bright orange button stole focus from "Hi, there!" hero
  - Impact: Sidebar whispers, center speaks

- **Course Images Desaturated** - Visual hierarchy fix
  - Added `opacity-50 grayscale-[30%]` at rest
  - `opacity-80 grayscale-0` on hover
  - Why: Colorful thumbnails fought with orange accent colors
  - Impact: Images subtle until intentionally viewed

### Fixed
- **Header Z-Index Stacking** - Actor no longer covers header
  - Added fixed Header at `z-[70]` to page layout
  - Actor drops to `z-10` in chat mode
  - Chat layer at `z-[60]`
  - Why: Dark glass orb's backdrop-blur created stacking issues
  - Impact: Logo, Explore, Profile always accessible

### Technical Details
- Updated: NeuralDots.tsx (complete rewrite), Header.tsx, Sidebar.tsx, page.tsx
- Key values: DOT_CONFIGS radius 16px (hero), pentagon angles at 72° intervals
- Animation: Framer Motion springs with stiffness 300 for snap effect
- Colors: Gold `#D4AF37`, holographic gradient, glassmorphism `white/5`

---

## [2025-12-02] Design System Foundation & Token Migration

### Added
- **Design Token Audit** - Comprehensive codebase analysis
  - Extracted 250+ unique styling values
  - Identified 80+ color values across components
  - Found 4 inconsistent "almost black" values (#131314, #1E1F20, #282A2C, #0D0D0D)
  - Discovered duplicate golds (#FBBF24 vs #F4D03F)
  - Documented typography scale (text-xs to text-6xl + custom text-[10px])
  - Mapped border radius patterns (rounded-full, rounded-3xl, rounded-2xl, etc.)
  - Why: Needed visibility into inconsistencies before standardization
  - Impact: Clear roadmap for design system consolidation

- **Experimental CourseCard Variants** - Boundary exploration
  - `CourseCardEdgy.tsx` - Asymmetric with skewed elements, clip-path polygons
  - `CourseCardColorful.tsx` - Thai sunset gradients (orange → pink → purple → cyan)
  - `CourseCardPersonality.tsx` - Golf flag, Thai decorative border, emoji tags
  - `CourseCardComposition.tsx` - Pill-shaped zones, vertical text, negative space
  - Why: Visualize "too far" before dialing back to find sweet spot
  - Impact: Creative reference for future design decisions

- **V2 CourseCard Explorations** - Usability spectrum
  - `CourseCardV2a.tsx` - 80/20 subtle shift (asymmetric crop at borderRadius 24px/80px)
  - `CourseCardV2b.tsx` - 50/50 balanced (horizontal split, location promoted)
  - `CourseCardV2c.tsx` - 30/70 bold (organic image 65% width, price floats at -bottom-5)
  - `CourseCardV2d.tsx` - Context-aware (compact 80px pill ↔ full mode with layoutId)
  - Why: Graduated options for finding right balance of personality vs usability
  - Impact: Multiple production-ready variants to choose from

- **Audit Page Experiments Section** - Design showcase
  - Section 4: Experiments with all 4 extreme variants
  - Section 5: V2 Explorations with usability spectrum visualization
  - Side-by-side comparisons with same mock data
  - Why: Visual playground for design exploration
  - Impact: Easy comparison and stakeholder review

### Changed
- **Spinner.tsx** - Migrated to design tokens
  - `border-accent-coral` for accent color variant
  - `bg-background-card rounded-card shadow-glass` for overlay
  - `text-text-secondary` for loading text
  - Why: Consistency with design system
  - Impact: Unified loading states across app

- **Toast.tsx** - Semantic color mapping
  - Success: `bg-accent-goldMuted`, `text-accent-gold`
  - Error: `bg-accent-redMuted`, `text-accent-red`
  - Warning: `bg-accent-coralMuted`, `text-accent-coral`
  - Info: `bg-accent-cyanMuted`, `text-accent-cyan`
  - `bg-surface-glass backdrop-blur-xl rounded-cardSmall`
  - Why: Semantic colors communicate meaning consistently
  - Impact: Clear visual feedback for different notification types

- **ErrorState.tsx** - Token-based styling
  - `bg-accent-redMuted rounded-full` for error icon container
  - `bg-background-card rounded-card` for error container
  - `bg-accent-coral rounded-button` for retry button
  - Why: Unified error presentation
  - Impact: Professional, consistent error handling

- **EmptyState.tsx** - Text hierarchy tokens
  - `text-text-disabled` for icons
  - `text-text-muted` for description
  - `text-text-secondary` for title
  - `bg-accent-coral rounded-button` for action button
  - Why: Clear visual hierarchy in empty states
  - Impact: Better UX guidance when content is missing

- **Chat Components** - User/AI message distinction
  - User messages: `bg-white/5 rounded-button` (lightweight, text-forward)
  - AI messages: `bg-surface-glass backdrop-blur-xl border-white/10 shadow-glass rounded-card` (rich, content-forward)
  - ChatInput: `bg-surface-glass ring-accent-coral/30` on focus
  - TypingIndicator: NeuralDots-inspired dots (coral, cyan, purple)
  - ChatContainer/MessageList: `bg-background-base` with token spacing
  - Why: Establish clear visual hierarchy between user and AI
  - Impact: Intuitive conversation flow, premium feel

### Technical Details
- New directory: `src/components/experiments/`
- New files: CourseCardEdgy.tsx, CourseCardColorful.tsx, CourseCardPersonality.tsx, CourseCardComposition.tsx, CourseCardV2a.tsx, CourseCardV2b.tsx, CourseCardV2c.tsx, CourseCardV2d.tsx, index.ts
- Updated: Spinner.tsx, Toast.tsx, ErrorState.tsx, EmptyState.tsx, ChatInput.tsx, Message.tsx, MessageList.tsx, TypingIndicator.tsx, ChatContainer.tsx, audit/page.tsx
- Key patterns:
  - `clip-path: polygon()` for edgy shapes
  - `borderRadius: '200px 40px 40px 200px'` for pill zones
  - Framer Motion `layoutId` for context-aware morphing
  - Semantic color mapping: success=gold, error=red, warning=coral, info=cyan
- Build: TypeScript clean, ESLint warnings only (unused vars)

### Tool Widget Token Migration
- **9 Components Migrated** - Consistent design tokens
  - CourseCarousel: Nav arrows → `bg-background-elevated/80 shadow-glass`
  - CourseDetailCard: Stats → token accents (purple, gold, cyan)
  - FleetCard: Selection → `accent-cyan`, glass surfaces
  - AboutCard: Stats icons → coral/cyan/gold hierarchy
  - TourShowcase: Progress bar → `accent-coral`, controls → background tokens
  - ServiceBento: Grid items → glass, hover → token accents
  - AuthGateModal: Gradient → `accent-cyanMuted`, benefits → cyan
  - InquiryForm: Submit → `accent-coral`, inputs → cyan focus
  - ItinerarySummary: Timeline → muted accents, total → `accent-gold`
  - Why: Unified visual language across all tool widgets
  - Impact: Consistent branding, easier maintenance

### ItineraryBuilder Wizard Token Migration
- **8 Components Migrated** - Complete wizard redesign
  - index.tsx: Container → `rounded-card bg-background-card`
  - RegionStep: Cards → glass surface, selected → `ring-accent-coral shadow-glow-coral`
  - VibeStep: Gradients → `accent-gold/cyan/purple` for championship/scenic/value
  - LogisticsStep: Toggles → `bg-accent-coral shadow-glow-coral`, prices → gold
  - DateGroupStep: Focus states → cyan, group hints → purple
  - ProgressIndicator: Line → `from-accent-coral to-accent-cyan`, completed → coral, active → cyan
  - WizardNavigation: Next → `bg-accent-coral shadow-glow-coral`, Back → ghost, Skip → `text-text-muted`
  - PriceCounter: Price → `text-accent-gold`
  - Why: Wizard flow needed consistent visual feedback
  - Impact: Clear progress indication, premium interactions

### Token Pattern Established
- Surfaces: `bg-surface-glass backdrop-blur-xl border-white/10`
- Shadows: `shadow-glass` for elevated, `shadow-glow-*` for interactive
- Radius: `rounded-card` containers, `rounded-cardSmall` cards, `rounded-button` interactive
- Text: `text-text-primary` → `text-text-secondary` → `text-text-muted`
- Accents: coral CTAs, cyan info/links, gold prices, purple premium

---

## [2025-12-03] Component Styling Overhaul

### Added
- **Educational Service Card Pattern** - Info-first, not selection
  - Structure: Header → "What is this?" → "Why would you want it?" → "What's included" → Soft prompt
  - Applied to: AirportFastTrackCard, GolfInsuranceCard, FleetCard
  - No pricing tiers, no selection, no "Book Now" buttons
  - Why: Educate before asking for commitment
  - Impact: Reduced friction, builds trust before upsell

- **AirportFastTrackCard Enhancements**
  - Hero image with gradient overlay
  - Stats row: 5 min vs 45 min average, 4.9 rating, 100% stress-free
  - Responsive layout: stack on mobile, side-by-side on desktop
  - CloudinaryImage for optimized images
  - Why: Premium look with clear value proposition
  - Impact: Visual proof of service quality

- **GolfInsuranceCard Enhancements**
  - Hero image with shield badge overlay
  - Coverage icons: Heart (medical), Briefcase (equipment), Plane (cancellation)
  - Responsive grid layout
  - Why: Make abstract insurance tangible
  - Impact: Clear visualization of coverage areas

- **FleetCard Enhancements**
  - Hero image of luxury vehicle
  - Vehicle images with CloudinaryImage
  - Feature icons for amenities
  - Why: Show quality of fleet visually
  - Impact: Premium perception of transport service

- **CourseCard Information Hierarchy** - New front/back split
  - Extended Course type: tier, travelTimeFromBangkok, hookLine, caddieFee, cartFee, facilities
  - Front: Name, tier badge, all-in price (green fee + caddie + cart), travel time, hook line
  - Back: Price breakdown table, availability notes, facilities list, "Best For" section
  - Why: All-in pricing reduces cognitive load, tier badges enable quick comparison
  - Impact: Faster course selection, clear value perception

- **DatesCard Duration Selector** - Improved date selection UX
  - Changed from start+end date pickers to start date + duration buttons
  - Duration options: 1-7+ days as horizontally scrollable chips
  - End date calculated internally from start + duration
  - Date summary shows full range when selected
  - Why: "How many days?" is more natural than picking two dates
  - Impact: Faster trip planning, fewer input errors

- **LogisticsStep Auto-Selection** - Smart defaults
  - "What's included" section displayed before selection
  - Auto-select vehicle based on group size: sedan for ≤4, vip-van for >4
  - useRef to track if auto-selection already occurred
  - Why: Reduce decisions, sensible defaults for common cases
  - Impact: Faster wizard completion, fewer confused users

### Changed
- **Neutral Design System** - Premium over gaming aesthetic
  - Backgrounds always neutral: `bg-surface-glass`, `bg-white/5`
  - Accent colors only for small elements: icon backgrounds, prices, CTAs
  - Removed glow effects (`shadow-glow-*`) from most components
  - Only one coral CTA button per screen
  - Selection states: `border-white/30` instead of `border-accent-coral`
  - Toggle switches: `bg-white/30` instead of coral when enabled
  - Why: Previous styling was "too neon, too gaming"
  - Impact: Premium golf aesthetic, not gaming UI

- **CourseCard Flip Animation** - Fixed asymmetry
  - Changed from separate forward/back durations to unified timing
  - Added `initial={false}` to AnimatePresence for consistent animation
  - Duration: 0.4s with easeInOut timing
  - Why: Forward flip was slow, back flip was normal
  - Impact: Smooth, consistent card interaction

- **FleetCard/Service Cards Props** - Simplified API
  - Removed data props (no longer needed for educational cards)
  - Components now self-contained with static content
  - Updated: audit/page.tsx, card-demo/page.tsx, Message.tsx
  - Why: Educational cards don't need dynamic data
  - Impact: Simpler component usage

### Technical Details
- New files: None (all updates to existing components)
- Modified: AirportFastTrackCard.tsx, GolfInsuranceCard.tsx, FleetCard.tsx, CourseCard.tsx, DatesCard.tsx, LogisticsStep.tsx, course.ts, audit/page.tsx, card-demo/page.tsx, Message.tsx
- Key patterns:
  - Educational card: Hero image (40%) + Content (60%) responsive split
  - All-in pricing: `greenFee + caddieFee + cartFee` displayed as single value
  - Duration selector: `DURATION_OPTIONS` array with {days, label} objects
  - Auto-selection: `useRef<boolean>` to track first-run
  - Neutral styling: `border-white/30 ring-white/20` for selection states
- Build: TypeScript clean, production build passes

### Design Pattern Established
- Educational cards: Inform before asking for selection
- All-in pricing: Combine related costs into single displayed value
- Duration over date range: "How long?" is more natural than "start to end"
- Auto-selection with opt-out: Smart defaults that can be changed
- Neutral surfaces with accent punctuation: Premium, not gaming

---

## [2025-12-03] Critical UI Fixes & Proactive UI System

### Fixed - Critical UI Issues (FIX 29-37)
- **Golf Stats Removal** - Removed holes, par, yards from CourseCard/CourseDetailCard
  - Added "Best For" tags derived from course.tags
  - Why: Stats don't help booking decisions, Best For is actionable
  - Impact: Cleaner cards focused on decision-relevant info

- **AboutCard Floating Bubbles** - Stats as floating pill badges
  - Glass styling with hover effects
  - Framer Motion spring animations
  - Why: Grid layout was static, bubbles are more engaging
  - Impact: Premium, interactive stat presentation

- **Educational Cards Responsive** - 6 cards now mobile/desktop adaptive
  - `flex-col md:flex-row` layout pattern
  - Image: 40% on desktop, full-width stack on mobile
  - Content: 60% on desktop, full-width on mobile
  - Cards: FleetCard, ClubRentalCard, AirportFastTrackCard, GolfInsuranceCard, DiningCard, AccommodationCard
  - Why: Cards were desktop-only
  - Impact: Full mobile support for educational content

- **ServiceBento Modal** - Now renders actual educational cards
  - Modal imports and renders card components directly
  - No duplicate content maintenance
  - Why: Modal had static duplicate content
  - Impact: Single source of truth for service info

- **ItinerarySummary Spacing** - Reduced vertical spacing
  - Timeline items: `mb-4 sm:mb-6` → `mb-2 sm:mb-3`
  - Section padding: `p-6 lg:p-8` → `p-5 lg:p-6`
  - Price breakdown: `space-y-4` → `space-y-2`
  - Why: Too much whitespace, not scannable
  - Impact: Compact, scannable timeline

- **Wizard Step Order** - WHEN (dates) is now FIRST
  - Order: dates → region → vibe → logistics → group → summary
  - Updated WIZARD_STEPS constant and initial state
  - Why: "When are you going?" is most natural first question
  - Impact: More intuitive trip planning flow

- **Wizard Buttons Toned Down** - Reduced neon/color
  - CTA buttons: `bg-white text-background-base` instead of coral
  - Progress indicators: white/gray instead of coral/cyan
  - Toggle switches: `bg-white/30` instead of coral
  - Selection states: `border-white/30` instead of coral ring
  - Why: Previous styling was "too neon, too gaming"
  - Impact: Premium, professional aesthetic

- **Global Orange Reduction** - Removed excessive coral usage
  - RegionCard, GroupCard: White/gray selections
  - ItinerarySummary: Neutral timeline icons
  - All wizard components: Subtle white tones
  - Why: Orange was overused, diluting CTA impact
  - Impact: Orange reserved for true CTAs only

### Added - Proactive UI System
- **DateIntentModal** - Quick date/time intent capture
  - Small, non-intrusive modal from bottom/center
  - Date preference: This week / Next week / Specific date
  - Time preference: Morning / Afternoon / Flexible
  - Golfers count with +/- controls
  - "Check Availability" CTA, "I'm just looking" dismiss
  - Why: Capture intent early to check availability in parallel
  - Impact: Backend can pre-check availability while user browses

- **DateIntentToast** - Confirmation after submission
  - Floating pill: "Got it! Checking availability as you browse"
  - Auto-dismiss after 4 seconds
  - Why: Confirm action without blocking
  - Impact: User knows their intent was captured

- **AvailabilityBadge** - Live availability status
  - States: checking, available, limited, unavailable, unknown
  - `AvailabilityBadge`: Full badge with label and date
  - `AvailabilityDot`: Compact dot-only for tight spaces
  - `AvailabilityBadgeWithInfo`: Badge with tooltip showing slots
  - Colors: emerald (available), amber (limited), gray (unavailable)
  - Pulse animation for checking/available states
  - Why: Show availability feedback on course cards
  - Impact: Users see real-time availability while browsing

- **ProactiveUIManager** - Central orchestration
  - Rate limits and cooldowns
  - Priority queue for component display
  - Session-scoped (only shows once per session)
  - Components: ProactiveDateIntentModal, GroupSizeNudge, TripBuilderPrompt
  - Why: Prevent multiple popups fighting for attention
  - Impact: Controlled, non-annoying proactive UI

- **Audit Page Section** - "Proactive UI" demos
  - Interactive demos for all proactive components
  - AvailabilityBadge state variants displayed
  - ProactiveUIManager orchestration demo
  - Why: Visual reference for all proactive patterns
  - Impact: Easy testing and stakeholder review

### Technical Details
- New files: DateIntentModal.tsx, AvailabilityBadge.tsx, src/components/proactive/*
- Modified: 20+ component files for FIX 29-37
- Key patterns:
  - Responsive: `flex flex-col md:flex-row`
  - Neutral selection: `border-white/30 ring-white/20`
  - White CTA: `bg-white text-background-base hover:bg-gray-100`
  - Status colors: emerald (success), amber (warning), gray (unavailable)
- Build: TypeScript clean, production build passes
