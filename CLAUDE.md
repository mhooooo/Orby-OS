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
- Accent: 
- Radii: `rounded-3xl` (cards), `rounded-full` (buttons/pills)
- Accent color: TBD - let design emerge from implementation

**Dev Modes (Cost Optimization):**
- `DEV_MODE=mock` - Zero API calls, reads from `/dev/mock-responses.json`
- `DEV_MODE=cached` - Cache-first, falls back to API, stores responses
- `DEV_MODE=live` - Direct API calls (production)

Mock mode for UI development, cached mode for integration testing.

**AI Integration (Implemented):**
- Anthropic Claude API with tool use for generative UI
- Tool execution loop: Claude → tool_use → execute handler → tool_result → final response
- Tools: `show_courses`, `show_course_detail`, `show_fleet`, `show_about_us`, `start_itinerary_builder`
- Model: `claude-sonnet-4-20250514`

**Data Flow (Implemented):**
- Supabase database with 15 seeded courses
- Tool results embedded as base64 markers in response stream
- Frontend parses markers and renders components with real data

---

## Success Metrics

### ✅ Completed: Phase 1 - Foundation
- [x] Chat engine functional (message history, streaming display)
- [x] Anthropic API integrated with tool definitions
- [x] First generative component: CourseCarousel renders from AI tool call
- [x] Input replaces static placeholder with real functionality

### ✅ Completed: Phase 2 - Data Layer
- [x] Supabase database with course schema
- [x] Tool execution loop - AI tools return real data
- [x] Course API endpoints with filtering
- [x] CourseDetailCard, FleetCard, AboutCard components

### ✅ Completed: Phase 3 - ItineraryBuilder Wizard
- [x] Itinerary data model (ItineraryDraft, ItineraryDay, Activity types)
- [x] ItineraryContext for wizard state management
- [x] 4-step wizard: Region → Vibe → Logistics → Dates
- [x] Pricing calculation with group discounts
- [x] ItinerarySummary with timeline and price breakdown
- [x] start_itinerary_builder tool registered and functional

### Foundation (To Be Achieved)
- Guest → Signed Up conversion: 15% target
- Average turns per session: 5+ target
- Time from landing to inquiry: <10 min target

---

## Current Phase

**Focus:** Phase 3 Complete - ItineraryBuilder Wizard & Data Layer Integration

**Current State:**
- All 5 tools execute and return real data (or handle client-side logic)
- CourseCarousel shows Supabase courses
- ItineraryBuilder wizard fully functional
- CourseDetailCard, FleetCard, AboutCard all functional
- Branch: `feat/phase3-itinerary-builder` (merged with Phase 2)

**Setup Required:**
1. Create Supabase project at https://supabase.com/dashboard
2. Run `supabase/schema.sql` in SQL Editor
3. Add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

**Decisions Made:**
- State management: React Context (ItineraryContext) for wizard
- Pricing: THB base, with group discounts at 8+ and 12+ golfers
- Tool result encoding: Base64 markers in response (not streaming during tool use)
- Auth gate: Deferred to Phase 4

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

---

## Quick Reference

**Key Files:**
- `src/app/page.tsx` - Main page with ChatProvider wrapper
- `src/app/api/chat/route.ts` - Tool execution loop + Anthropic
- `src/components/chat/Message.tsx` - Tool → Component routing
- `src/components/generative-ui/` - All generative UI components
- `src/context/ItineraryContext.tsx` - Wizard state management
- `src/hooks/useChat.ts` - Chat state + tool result parsing
- `src/lib/tools.ts` - AI tool definitions and system prompt
- `src/lib/tool-handlers.ts` - Tool execution handlers
- `src/lib/supabase.ts` - Database client
- `supabase/schema.sql` - Database schema + seed data

**Design Tokens:**
```typescript
const colors = {
  bg: '#131314',
  sidebar: '#1E1F20',
  hover: '#282A2C',
  accent: '',
};
```

**Run Commands:**
```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
```
