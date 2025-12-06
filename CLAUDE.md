# Orby OS
*The Operating System for Golf Tourism - a multi-tenant B2B platform where partners get AI-powered tools and their customers get branded trip portals.*

---

## Why This Exists

**Problem:** Golf tour operators struggle with fragmented tools - separate systems for email, quotes, bookings, and client management. No unified inbox, no AI assistance, no scalable operations.

**Solution:** Orby OS provides partners (tour operators, travel agents) with a unified operations dashboard featuring AI-powered inbox, quote generation, and client management. Golf Okay becomes Partner #0, dogfooding the platform.

**Anti-Pitch:** Not just a CRM. Not just a booking system. The platform aggregates all communication channels (email, WhatsApp, web) into one AI-enhanced inbox with automatic quote generation.

---

## Architecture Decisions

| Choice | Rationale | Trade-off |
|--------|-----------|-----------|
| **Next.js 16 (App Router)** | RSC for data fetching, streaming support for AI | Newer = less community patterns |
| **tRPC 11.x** | End-to-end type safety, middleware for tenant isolation | Learning curve |
| **Zustand 5.x** | Simple state management, replaces Context for UI state | Another state tool |
| **Trigger.dev 3.x** | Durable background jobs with retries, replaces Edge Functions | External dependency |
| **Supabase** | Auth + DB + RLS + Realtime in one | Vendor lock-in |
| **Stripe** | Subscriptions, usage billing, invoicing | Transaction fees |
| **Multi-Tenant RLS** | Data isolation via `partner_id` in every table | Query complexity |

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ORBY OS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  PORTALS                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   golfokay.co    │  │ golfokay.co/office│  │trips.golfokay.co │          │
│  │   (Customer)     │  │    (Partner)      │  │    (Client)      │          │
│  │  • AI Chat       │  │  • Unified Inbox  │  │  • Trip Details  │          │
│  │  • Discovery     │  │  • Quote Builder  │  │  • Itinerary     │          │
│  │  • Inquiry       │  │  • Client CRM     │  │  • Documents     │          │
│  └────────┬─────────┘  └────────┬──────────┘  └────────┬─────────┘          │
│           └─────────────────────┼──────────────────────┘                    │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         tRPC API LAYER                                │  │
│  │  Type-safe, middleware-protected, tenant-aware                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│           ┌─────────────────────┼─────────────────────┐                    │
│           ▼                     ▼                     ▼                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │    SUPABASE      │  │   TRIGGER.DEV    │  │   EXTERNAL APIs  │          │
│  │  • PostgreSQL    │  │  • Background    │  │  • Stripe        │          │
│  │  • Auth          │  │  • Scheduled     │  │  • Resend        │          │
│  │  • Realtime      │  │  • Retries       │  │  • WhatsApp      │          │
│  │  • Storage       │  │  • Workflows     │  │  • Claude AI     │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Development Constraints

**MANDATORY - Context7 MCP:**
Always use Context7 when code generation, setup or configuration steps, or library/API documentation is needed. Automatically use the Context7 MCP tools to resolve library IDs and get library docs without being explicitly asked.

**Framework:**
- React 19 with Next.js 16 App Router
- tRPC for API layer with tenant middleware
- Zustand for client state (replacing Context where appropriate)
- Use `"use client"` directive for interactive components
- Next.js 16: Route params are Promises - use `await params` in route handlers

**Styling:**
- Tailwind v4 syntax (no `tailwind.config.js` - uses CSS-based config)
- Dark mode first: `#131314` (bg), `#1E1F20` (cards), `#282A2C` (hover)
- Radii: `rounded-3xl` (cards), `rounded-full` (buttons/pills)

**Accent Colors:**
- `#FF6B35` - Bright Orange (CTAs, highlights)
- `#00D4FF` - Cyan (info, links)
- `#FF3B3B` - Red (errors, critical)
- `#A855F7` - Purple (premium features)
- `#FBBF24` - Gold (prices, success)

**Multi-Tenancy:**
- All partner data scoped by `partner_id`
- RLS policies enforce tenant isolation
- tRPC middleware injects `partnerId` into context
- Golf Okay = Partner #0 (dogfooding)

**Background Jobs:**
- Trigger.dev for all async work (email processing, AI classification, quote generation)
- Fire-and-forget triggers from API routes
- Built-in retries and observability

---

## Success Metrics

### Active: Orby OS Phase 0-1 (Foundation + Office Shell)
- [ ] Install tRPC, Zustand, Trigger.dev, Stripe, PostHog, Sentry
- [ ] Configure tRPC with Next.js App Router
- [ ] Set up Zustand stores (parallel to existing Context)
- [ ] Create multi-tenant database migrations
- [ ] /office layout with auth protection
- [ ] Partner context and middleware
- [ ] Golf Okay seeded as Partner #0
- [ ] Dashboard with placeholder metrics

### Orby OS Roadmap

**Phase 0-1 (Week 1-3):** Foundation + Office Shell
**Phase 2 (Week 4-5):** Unified Inbox - Email aggregation, AI classification, draft generation
**Phase 3 (Week 6-7):** Quote Engine - AI quote generation, PDF export, versioning
**Phase 4 (Week 8):** Client CRM - Client management, activity timeline
**Phase 5 (Week 9):** Rate Management - Course/transport rates, seasons
**Phase 6 (Week 10):** Billing Integration - Stripe subscriptions, usage tracking
**Phase 7 (Week 11-12):** Polish & Launch

### Proven Foundation (Golf Okay B2C - Complete)
- Chat engine with streaming, 14 AI tools, generative UI pattern
- CourseCarousel, CourseDetailCard, FleetCard, AboutCard, ItineraryBuilder
- TourShowcase, ServiceBento, AuthGateModal, InquiryForm
- Supabase database, Google OAuth, saved courses/itineraries
- Memory system with passive profiler, embeddings, semantic retrieval
- Admin MVP: B2B dashboard, rate management, CSV import, quote builder

---

## Current Phase

**Focus:** Orby OS Phase 0 - Foundation Setup

**Priorities:**
1. Install new dependencies (tRPC, Zustand, Trigger.dev, etc.)
2. Configure tRPC with Next.js App Router
3. Set up Zustand stores
4. Configure Trigger.dev project
5. Add Sentry and PostHog
6. Create multi-tenant database migrations
7. Verify existing B2C functionality still works

**Key Decisions Made:**
- Architecture: Option C - Platform Architecture (future-proof, enterprise-grade)
- Strategy: Golf Okay becomes Partner #0, dogfooding before external partners
- State: Zustand for UI state, tRPC for server state
- Background: Trigger.dev replaces Supabase Edge Functions for complex workflows
- Billing: Stripe for subscriptions and usage billing

**New File Structure:**
```
src/
├── server/
│   ├── trpc.ts              # tRPC initialization
│   ├── context.ts           # Request context with partnerId
│   └── routers/             # tRPC routers (partner, client, quote, inbox, etc.)
├── stores/
│   ├── partner.ts           # Partner state
│   ├── inbox.ts             # Inbox filters, selection
│   └── quotes.ts            # Quote filters, draft state
├── trigger/
│   ├── client.ts            # Trigger.dev client
│   └── tasks/               # Background tasks
├── trpc/
│   ├── client.tsx           # Client provider
│   └── server.ts            # Server caller
└── app/
    ├── (customer)/          # Existing B2C routes
    ├── (office)/            # Partner dashboard
    │   └── office/
    │       ├── layout.tsx
    │       ├── page.tsx     # Dashboard
    │       ├── inbox/
    │       ├── quotes/
    │       ├── clients/
    │       └── settings/
    └── (portal)/            # Client trip portals
        └── trips/[token]/
```

---

## Known Tensions

| Tension | Resolution |
|---------|------------|
| **Rich UI vs Token Cost** | Components rendered client-side; AI returns minimal tool call data |
| **B2B vs B2C** | Separate routes: `/` for B2C, `/office` for B2B partners |
| **Multi-tenant Complexity** | RLS + tRPC middleware + service role key for admin operations |
| **Background Job Reliability** | Trigger.dev with retries > Edge Functions for critical workflows |
| **State Management Migration** | Zustand alongside Context, gradual migration |

---

## Anti-Patterns & Lessons

**Architecture**
- [2024-11]: Design system emerges from implementation - don't build a separate design phase. The prototype IS the reference.
- [2024-12]: Multi-tenant RLS requires `get_user_partner_id()` helper function for clean policies

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
- [2024-12]: SessionProvider must wrap inside AuthProvider to access user state for merge workflow
- [2024-12]: Supabase type inference issues with new tables - use `as any` with eslint-disable for upsert/rpc calls until types are regenerated
- [2024-12]: getSessionUuid called during SSR throws error - initialize session UUID in useEffect on client-side only
- [2024-12]: Supabase Edge Functions use Deno runtime - exclude `supabase/functions` from tsconfig.json and eslint
- [2024-12]: Service role key required for server-side Supabase operations that bypass RLS
- [2024-12]: Fire-and-forget async patterns (no await) for non-blocking operations - use `.catch()` for error handling
- [2024-12]: Token budgeting for AI prompts - set explicit limits per section to prevent context overflow
- [2024-12]: Chat history requires atomic state updates - use single `loadChat()` function instead of separate calls
- [2024-12]: Nested buttons cause React hydration errors - use `<div>` with `cursor-pointer` for clickable containers
- [2024-12]: Visual hierarchy in menus: use color for importance, not shapes/backgrounds
- [2024-12]: Framer Motion `layoutId` enables smooth position morphing between components
- [2024-12]: Conic gradients with blur create elegant "thinking halo" effects
- [2024-12]: Dark Glass orb (glassmorphism): `bg-white/5 backdrop-blur-md border-white/10`
- [2024-12]: backdrop-blur creates stacking context issues - use explicit z-index on parent containers
- [2024-12]: Sidebar transparency with border lets background flow through
- [2024-12]: Demote loud buttons to ghost buttons when they steal focus from hero content
- [2024-12]: Admin auth guard: email whitelist via ADMIN_EMAILS env var, comma-separated, case-insensitive
- [2024-12]: Reusable DataTable component: generic TypeScript with sorting, pagination, search, custom cell renderers
- [2024-12]: CSV import pattern: FormData + parseCSV utility, validate against existing records, return line-specific errors
- [2024-12]: Quote builder: JSONB items array for flexible line items, auto-calculate sell_rate from net_rate + client markup

**tRPC Patterns (New)**
- tRPC middleware chain: `isAuthed` → `hasPartner` → `hasPermission(resource, action)`
- Use `protectedProcedure` for all partner routes (includes auth + partner check)
- SuperJSON transformer for Date, Map, Set serialization
- Prefetch queries in server components with `queryClient.prefetchQuery()`

**Zustand Patterns (New)**
- Persist filters to sessionStorage, not localStorage (per-tab state)
- Use `partialize` to exclude transient state from persistence
- Create stores are singletons - no need for providers

**Trigger.dev Patterns (New)**
- `task()` for simple jobs, `workflow()` for multi-step processes
- Always set `retry` config with exponential backoff
- Fire-and-forget: `await task.trigger(payload)` returns immediately

---

## Quick Reference

**Key Files (Existing B2C):**
- `src/app/page.tsx` - Main customer chat page
- `src/app/api/chat/route.ts` - AI tool execution loop
- `src/components/chat/Message.tsx` - Tool → Component routing
- `src/components/generative-ui/` - All generative UI components
- `src/lib/tools.ts` - AI tool definitions
- `src/lib/tool-handlers.ts` - Tool execution handlers

**Key Files (New Orby OS):**
- `src/server/trpc.ts` - tRPC initialization with tenant middleware
- `src/server/routers/index.ts` - Root router aggregating all routers
- `src/stores/` - Zustand stores for UI state
- `src/trigger/tasks/` - Background job definitions
- `src/app/(office)/office/` - Partner dashboard routes
- `src/trpc/client.tsx` - tRPC React Query provider

**Database Schema (Multi-Tenant):**
- `partners` - Organizations with settings, billing, branding
- `partner_members` - Team members with roles/permissions
- `clients` - Partner's customers
- `channels` - Connected communication channels (email, WhatsApp, etc.)
- `contacts` - Unified contacts across channels
- `conversations` - Thread per contact per channel
- `inbox_messages` - All messages, all channels
- `quotes` - Quote with line items, versioning, status
- `quote_items` - Line items (golf, transport, service)
- `bookings` - Confirmed quotes with portal access
- `course_rates` / `transport_rates` - Rate management
- `usage_records` - AI token tracking, billing metrics
- `audit_logs` - Action history for compliance

**Design Tokens:**
```typescript
const colors = {
  bg: '#131314',
  card: '#1E1F20',
  hover: '#282A2C',
  coral: '#FF6B35',
  cyan: '#00D4FF',
  red: '#FF3B3B',
  purple: '#A855F7',
  gold: '#FBBF24',
};
```

**Environment Variables:**
```env
# Existing
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...
ADMIN_EMAILS=admin@golfokay.co,ops@golfokay.co

# New for Orby OS
TRIGGER_API_KEY=tr_...
TRIGGER_API_URL=https://api.trigger.dev
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://...@sentry.io/...
ENCRYPTION_KEY=...  # 32-byte hex for API key encryption
RESEND_WEBHOOK_SECRET=...
```

**New Dependencies to Install:**
```json
{
  "dependencies": {
    "@trpc/server": "^11.0.0",
    "@trpc/client": "^11.0.0",
    "@trpc/react-query": "^11.0.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^5.0.0",
    "@trigger.dev/sdk": "^3.0.0",
    "@trigger.dev/react-hooks": "^3.0.0",
    "stripe": "^14.0.0",
    "@stripe/stripe-js": "^2.0.0",
    "posthog-js": "^1.0.0",
    "@sentry/nextjs": "^8.0.0",
    "superjson": "^2.0.0",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "vitest": "^2.0.0",
    "@testing-library/react": "^16.0.0",
    "msw": "^2.0.0"
  }
}
```

**Run Commands:**
```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run lint      # ESLint
npx trigger dev   # Start Trigger.dev dev server
```

**Implementation Reference:**
- See `coding-prompt.md` for complete implementation guide
- Includes: database schema, tRPC patterns, Zustand stores, Trigger.dev tasks
- Week-by-week execution plan with success criteria
