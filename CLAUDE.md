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

**Styling:**
- Tailwind v4 syntax (no `tailwind.config.js` - uses CSS-based config)
- Dark mode first: `#131314` (bg), `#1E1F20` (cards), `#282A2C` (hover)
- Accent: `#A4E600` (green CTAs per brand)
- Radii: `rounded-3xl` (cards), `rounded-full` (buttons/pills)

**AI Integration (Implemented):**
- Anthropic Claude API with tool use for generative UI
- Streaming responses via `@anthropic-ai/sdk`
- Tools: `show_courses`, `show_course_detail`, `show_fleet`, `show_about_us`
- Model: `claude-sonnet-4-20250514`

**Data Flow (Planned):**
- Google Sheets → sync script → Supabase (courses, pricing)
- Cloudinary for image hosting
- Guest session → auth gate at booking intent

---

## Success Metrics

### ✅ Completed: Phase 1 - Foundation
- [x] Chat engine functional (message history, streaming display)
- [x] Anthropic API integrated with tool definitions
- [x] First generative component: CourseCarousel renders from AI tool call
- [x] Input replaces static placeholder with real functionality

### Active: Phase 2 - Data Layer
- [ ] Supabase database setup
- [ ] Google Sheets sync for course data
- [ ] Connect AI tools to real course data

### Foundation (To Be Achieved)
- Guest → Signed Up conversion: 15% target
- Average turns per session: 5+ target
- Time from landing to inquiry: <10 min target

---

## Current Phase

**Focus:** Phase 2 - Data Layer (Real course data flows through the system)

**Current State (After Phase 1):**
- Chat engine functional with streaming responses
- CourseCarousel renders on `show_courses` tool call
- Components extracted: Sidebar, Header, MainContent, GreetingState
- Branch: `feat/phase1-chat-foundation` pushed to GitHub

**Priorities:**
1. Set up Supabase database with course schema
2. Implement Google Sheets → Supabase sync
3. Create `/api/courses` endpoints
4. Connect AI tools to real course data

**Decisions Made:**
- State management: React Context (not Zustand) - simpler for current scope
- Auth gate: Deferred to Phase 4

---

## Known Tensions

| Tension | Resolution |
|---------|------------|
| **Rich UI vs Token Cost** | Components rendered client-side; AI returns minimal tool call data |
| **Guest Freedom vs Data Capture** | Allow 3+ turns before soft auth gate at save/book intent |
| **Real-time Availability vs Complexity** | V1 uses "request" mode; real-time for V2 |
| **B2B vs B2C** | Separate subdomain (partners.golfokay.co), shared Supabase backend |

---

## Anti-Patterns & Lessons

**Architecture**
- [2024-11]: Design system emerges from implementation - don't build a separate design phase. The prototype IS the reference.

**Implementation Gotchas**
- [2024-11]: ESLint `react-hooks/set-state-in-effect` error - use `useLayoutEffect` + `requestAnimationFrame` for mount animations instead of `useEffect` with direct `setState`
- [2024-11]: Framer Motion 3D flip requires explicit `backface-visibility: hidden` CSS and `perspective` on parent

---

## Quick Reference

**Key Files:**
- `src/app/page.tsx` - Main page with ChatProvider wrapper
- `src/app/api/chat/route.ts` - Anthropic streaming endpoint
- `src/components/chat/` - Chat UI components
- `src/components/generative-ui/` - CourseCarousel, CourseCard
- `src/hooks/useChat.ts` - Chat state management
- `src/lib/tools.ts` - AI tool definitions and system prompt
- `plan.md` - Full project plan with phases, data models

**Design Tokens (from prototype):**
```typescript
const colors = {
  bg: '#131314',
  sidebar: '#1E1F20',
  hover: '#282A2C',
  accent: '#A4E600',
};
```

**Run Commands:**
```bash
npm run dev    # Start dev server
npm run build  # Production build
npm run lint   # ESLint
```
