# Golf Okay
*A conversational AI golf concierge for Thailand - where the chat window becomes a dynamic canvas for trip discovery, customization, and booking.*

---

## Why This Exists

**Problem:** International golf tourists planning Thailand trips face fragmented information, language barriers, and opaque pricing across dozens of courses and logistics providers.

**Solution:** An AI-powered conversational interface that renders interactive React components (course carousels, itinerary builders, fleet configurators) directly in the chat - guiding users from discovery → customization → booking.

**Anti-Pitch:** Not a chatbot with text responses. Not a static booking form. The UI is generative - the AI decides what to show based on user intent.

---

## Architecture Decisions

| Choice | Rationale | Trade-off |
|--------|-----------|-----------|
| **Next.js 16 (App Router)** | Latest stable, RSC for data fetching, streaming support for AI | Newer = less community patterns |
| **Tailwind CSS v4** | Already in prototype, dark mode default, rapid iteration | Config migration from v3 |
| **Claude API** | Best tool use, streaming, agentic patterns | Cost per token |
| **Supabase** | Auth + DB + RLS in one, Google OAuth built-in | Vendor lock-in |
| **Generative UI Pattern** | AI tool calls → React components in chat | Complex state management |

---

## Development Constraints

**Framework:**
- React 19 with Next.js 16 App Router
- Use `"use client"` directive for interactive components
- Route handlers in `app/api/` for backend
- Next.js 16: Route params are Promises - use `await params` in route handlers

**Styling:**
- Tailwind v4 syntax (no `tailwind.config.js` - uses CSS-based config)
- Dark mode first: `#131314` (bg), `#1E1F20` (cards), `#282A2C` (hover)
- Radii: `rounded-3xl` (cards), `rounded-full` (buttons/pills)

**Accent Colors:**
- `#FF6B35` - Bright Orange (highlights, warnings)
- `#00D4FF` - Bluesky/Cyan (info, links)
- `#FF3B3B` - Red (errors, critical)
- `#A855F7` - Purple (premium features)
- `#FBBF24` - Yellow (caution, attention)

**Dev Modes (Cost Optimization):**
- `DEV_MODE=mock` - Zero API calls, reads from `/dev/mock-responses.json`
- `DEV_MODE=cached` - Cache-first, falls back to API, stores responses
- `DEV_MODE=live` - Direct API calls (production)

Mock mode for UI development, cached mode for integration testing.

**AI Integration (Implemented):**
- Anthropic Claude API with tool use for generative UI
- Tool execution loop: Claude → tool_use → execute handler → tool_result → final response
- Tools: `show_courses`, `show_course_detail`, `show_fleet`, `show_about_us`, `start_itinerary_builder`, `pick_region`, `pick_group_size`, `pick_days`, `pick_vibe`, `pick_transport`, `start_tour`, `show_services`, `trigger_auth_gate`, `start_inquiry`
- Model: `claude-sonnet-4-20250514`

**Data Flow (Implemented):**
- Supabase database with 15 seeded courses
- Tool results embedded as base64 markers in response stream
- Frontend parses markers and renders components with real data

---

## Success Metrics

### Phase 6 - Polish & Launch (Complete)
- [x] Mobile responsive design - Responsive layouts tested across viewports
- [x] Image optimization - Next.js Image component with proper loading
- [x] Error handling + offline states - Error boundaries and graceful degradation
- [x] Analytics + conversion tracking - Plausible integration ready (requires domain config)

### Proven Foundation (Phases 1-5 Complete)
- Chat engine with streaming display
- 14 AI tools registered and functional
- CourseCarousel, CourseDetailCard, FleetCard, AboutCard
- ItineraryBuilder 4-step wizard with pricing
- TourShowcase auto-playing carousel
- ServiceBento interactive grid
- Supabase database with 15 courses
- Authentication with Google OAuth
- User features: save courses, save itineraries
- AuthGateModal with intent-based triggers
- Booking flow: inquiry submission + email notifications

### Business Targets (Post-Launch)
- Guest → Signed Up conversion: 15% target
- Average turns per session: 5+ target
- Time from landing to inquiry: <10 min target

---

## Current Phase

**Focus:** Phase 6 - Polish & Launch

**Priorities:**
1. Mobile responsive design
2. Image optimization and performance
3. Error handling + offline states
4. Analytics + conversion tracking

**Setup Required:**
1. Add Cloudinary API keys for image optimization
2. Set up analytics (PostHog or Plausible)
3. Configure Vercel deployment

**Decisions Made (Previous Phases):**
- State management: React Context (ItineraryContext) for wizard
- Pricing: THB base, with group discounts at 8+ and 12+ golfers
- Tool result encoding: Base64 markers in response (not streaming during tool use)
- Auth trigger: Intent-based (save/book actions) via trigger_auth_gate tool
- Session persistence: Guest drafts migrated on sign-up (future enhancement)
- Email provider: Resend (simple, reliable API)
- Inquiry form: In-chat component rendered by AI tool

---

## Known Tensions

| Tension | Resolution |
|---------|------------|
| **Rich UI vs Token Cost** | Components rendered client-side; AI returns minimal tool call data |
| **Guest Freedom vs Data Capture** | Allow 3+ turns before soft auth gate at save/book intent |
| **Real-time Availability vs Complexity** | V1 uses "request" mode; real-time for V2 |
| **B2B vs B2C** | Separate subdomain (partners.golfokay.co), shared Supabase backend |
| **Streaming vs Tool Results** | Tool execution requires non-streaming; results appended to final response |

---

## Anti-Patterns & Lessons

**Architecture**
- [2024-11]: Design system emerges from implementation - don't build a separate design phase. The prototype IS the reference.

**Implementation Gotchas**
- [2024-11]: ESLint `react-hooks/set-state-in-effect` error - use `useMemo` for derived state instead of `useEffect` + `setState`
- [2024-11]: Framer Motion 3D flip requires explicit `backface-visibility: hidden` CSS and `perspective` on parent
- [2024-11]: Framer Motion `useSpring` + `useTransform` returns MotionValue - use `.on('change')` subscription to update React state
- [2024-11]: Tool inputs in stream: base64 encode JSON to avoid parsing issues with special characters
- [2024-11]: Implement mock/cache modes early - repeated testing burns tokens fast
- [2024-11]: Anthropic tool_use requires sending tool_result back before getting final response - can't stream during tool execution
- [2024-11]: TypeScript `Record<string, unknown>` to specific type requires double cast: `input as unknown as SpecificType`
- [2024-11]: Next.js 16 route params are Promises: `const { id } = await params;`
- [2024-11]: Suggestion pills can use `directPrompt` for single-action vs `subPrompts` for dropdowns - reduces friction for common actions
- [2024-11]: Auto-playing carousel needs useCallback for nextStep to avoid stale closure in interval
- [2024-11]: Bento grid layout with CSS Grid `auto-rows-[100px]` + variable col/row spans creates organic layouts
- [2024-11]: @supabase/ssr client type inference issues in Next.js 16 API routes - use `as any` with eslint-disable comment for insert operations
- [2024-11]: Optimistic UI pattern for save actions: update state immediately, rollback on error
- [2024-11]: Auth modal state in chat messages: use wrapper component with local isDismissed state to prevent re-renders
- [2024-11]: React setState in useEffect triggers cascading renders - derive initial state from props/context instead of syncing with effects
- [2024-11]: Supabase OAuth callback needs `createServerClient` from `@supabase/ssr` with cookie handlers - basic `createClient` won't persist session to cookies
- [2024-11]: Always add `credentials: 'include'` to fetch calls for authenticated API routes to ensure cookies are sent
- [2024-11]: Resend API requires RESEND_API_KEY env var at build time - ensure it's in .env.local with correct case
- [2024-11]: ESLint react/no-unescaped-entities requires &apos; for apostrophes in JSX text
- [2024-11]: Playwright tests need proper selectors for components without semantic HTML tags - look for actual DOM structure, not assumed tags
- [2024-11]: Logo visibility depends on intro animation state (showLogo prop) - tests should account for conditional rendering
- [2024-11]: Phase 6 polish complete - responsive design tested, build verified, analytics ready for deployment

---

## Quick Reference

**Key Files:**
- `src/app/page.tsx` - Main page with ChatProvider wrapper
- `src/app/api/chat/route.ts` - Tool execution loop + Anthropic
- `src/components/chat/Message.tsx` - Tool → Component routing
- `src/components/generative-ui/` - All generative UI components
- `src/components/generative-ui/TourShowcase.tsx` - Full service tour
- `src/components/generative-ui/ServiceBento.tsx` - Bento grid for services
- `src/components/generative-ui/AuthGateModal.tsx` - Auth conversion modal
- `src/components/generative-ui/InquiryForm.tsx` - Booking inquiry form
- `src/components/generative-ui/pickers/` - Chipotle-style trip pickers
- `src/app/api/inquiries/route.ts` - Inquiry submission API
- `src/lib/email.ts` - Email notification service (Resend)
- `src/context/ItineraryContext.tsx` - Wizard state management
- `src/context/AuthContext.tsx` - Auth state management
- `src/hooks/useChat.ts` - Chat state + tool result parsing
- `src/hooks/useAuth.ts` - Auth session hooks
- `src/hooks/useSavedCourses.ts` - Saved courses CRUD
- `src/hooks/useItineraryDrafts.ts` - Itinerary drafts CRUD
- `src/lib/tools.ts` - AI tool definitions and system prompt
- `src/lib/tool-handlers.ts` - Tool execution handlers
- `src/lib/supabase.ts` - Database client
- `src/lib/auth.ts` - Auth helper functions
- `public/golfokay-logo.svg` - Brand logo (white, no background)
- `supabase/schema.sql` - Database schema + seed data
- `supabase/migrations/002_user_data.sql` - User data tables
- `supabase/migrations/003_inquiries.sql` - Inquiries table
- `playwright.config.ts` - E2E test configuration
- `tests/audit/sprint-phase4-auth.spec.ts` - Auth flow tests
- `tests/audit/sprint-phase5-booking.spec.ts` - Booking flow tests
- `tests/audit/sprint-phase6-polish.spec.ts` - Polish & responsive tests

**Design Tokens:**
```typescript
const colors = {
  bg: '#131314',
  sidebar: '#1E1F20',
  hover: '#282A2C',
  accent: '',
};
```

**Environment Variables:**
```env
# AI
ANTHROPIC_API_KEY=sk-ant-...

# Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Email
RESEND_API_KEY=re_...

# Future
CLOUDINARY_API_KEY=...
```

**Run Commands:**
```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
```
