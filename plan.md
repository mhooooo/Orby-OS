# Golf Okay: Implementation Plan

## 📍 Current Phase: Deployment & Production Setup
**Goal:** Live production deployment with monitoring and analytics

### Active Priorities
1. Vercel deployment with environment variables
2. Plausible analytics domain configuration
3. Production monitoring and error tracking
4. Performance optimization (optional)

### Immediate Task List
- [ ] Deploy to Vercel with production environment variables
- [ ] Configure custom domain (if applicable)
- [ ] Set up Plausible analytics with domain
- [ ] Monitor initial user sessions
- [ ] Document deployment process

### Phase 6 Tasks (Completed)
- [x] Mobile responsive breakpoints for all components
- [x] Image optimization with Next.js Image component
- [x] Error handling and graceful degradation
- [x] Loading states for async operations
- [x] Analytics integration (Plausible ready)
- [x] Build verification (production build passes)
- [x] Playwright test suite (11 tests created)
- [x] Visual verification (3 viewport screenshots)
- [x] Documentation updates

### Phase 5 Tasks (Completed)
- [x] Create inquiry submission API endpoint
- [x] Build inquiry form component
- [x] Implement email notifications with Resend
- [x] Add inquiry tracking in database
- [x] Update ItinerarySummary with Book Now button
- [x] Register start_inquiry AI tool
- [x] Build verification and Playwright tests

### Phase 4 Tasks (Completed)
- [x] Set up Supabase Auth in project
- [x] Implement Google OAuth flow
- [x] Create AuthGateModal component with trigger logic
- [x] Add `trigger_auth_gate` tool to AI
- [x] Persist saved courses to user account
- [x] Persist itinerary drafts to user account
- [x] Build verification and Playwright tests
- [x] Fix OAuth callback session persistence (createServerClient with cookies)
- [x] Sidebar "My Golf" section with real-time data

---

## 🏗 Architecture Reference

### Tech Stack
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4 (dark mode default)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Database:** Supabase (Postgres) with RLS
- **Animation:** Framer Motion
- **Hosting:** Vercel (planned)

### Key Components
```
src/
├── app/api/chat/route.ts      # Tool execution loop + Anthropic
├── components/chat/           # ChatContainer, MessageList, Message, ChatInput
├── components/generative-ui/  # CourseCarousel, ItineraryBuilder, FleetCard, etc.
├── context/                   # ChatContext, ItineraryContext
├── hooks/useChat.ts           # Chat state + tool result parsing
├── lib/tools.ts               # 12 AI tool definitions
└── lib/tool-handlers.ts       # Tool execution handlers
```

### Current Tools (14 registered)
`show_courses`, `show_course_detail`, `show_fleet`, `show_about_us`, `start_itinerary_builder`, `pick_region`, `pick_group_size`, `pick_days`, `pick_vibe`, `pick_transport`, `start_tour`, `show_services`, `trigger_auth_gate`, `start_inquiry`

### Database Schema
- **courses** - 15 seeded across Bangkok, Phuket, Pattaya, Hua Hin, Chiang Mai
- **saved_courses** - User saved courses (Phase 4: ✅)
- **itinerary_drafts** - User trip drafts (Phase 4: ✅)
- **inquiries** - Booking inquiries with email notifications (Phase 5: ✅)

---

## 📅 Roadmap

### Phase 5: Booking Flow (Completed)
- [x] Inquiry submission form + API
- [x] Email notifications to Golf Okay team
- [x] Inquiry tracking in database
- [x] AI tool: start_inquiry

### Phase 6: Polish & Launch (Completed)
- [x] Mobile responsive design
- [x] Image optimization (Next.js Image)
- [x] Error handling + offline states
- [x] Analytics integration (Plausible ready)
- [ ] Vercel deployment + domain config (next phase)

### Memory System (Completed)
- [x] Session identity layer (session UUID, merge workflow)
- [x] Active Memory tools (set_trip_dates, set_group_size, etc.)
- [x] Passive Profiler Edge Function (Claude Haiku extraction)
- [x] Embedding service (OpenAI text-embedding-3-small)
- [x] Memory retrieval with semantic search
- [x] Context builder with token budgets
- [x] System prompt with memory rules
- [ ] Deploy Edge Function to Supabase production

### Foundation (Completed)

**Phase 1 - Chat Foundation:**
Chat engine with streaming, Anthropic integration, CourseCarousel with 3D flip animation

**Phase 2 - Data Layer:**
Supabase integration, 15 courses seeded, tool execution loop, CourseDetailCard, FleetCard, AboutCard

**Phase 3 - ItineraryBuilder:**
4-step wizard (Region → Vibe → Logistics → Dates), pricing with group discounts, ItinerarySummary with timeline

**Phase 3b - Tour & Services:**
TourShowcase auto-playing carousel, ServiceBento grid, GolfOkay logo, expanded canvas layout, Chipotle-style pickers

**Phase 4 - Authentication & User Features:**
Supabase Auth with Google OAuth, AuthGateModal with save/book triggers, saved courses + itinerary drafts persistence, auth context, user hooks (useSavedCourses, useItineraryDrafts)

**Phase 5 - Booking Flow:**
InquiryForm component, inquiry API routes, Resend email integration, email notifications, database persistence, start_inquiry AI tool

---

## 📝 Implementation Notes

### Auth Gate Strategy (Decision Needed)
Options:
1. **Turn-based:** Trigger after 3+ chat turns
2. **Intent-based:** Trigger only on save/book actions
3. **Hybrid:** Soft prompt at 3 turns, hard gate on save/book

### Tool Result Pattern
```typescript
// Tool results embedded as base64 markers in response stream
const marker = `[[TOOL_RESULT:${toolName}:${base64Data}]]`;
// Frontend parses markers and renders components
```

### Design Tokens
```typescript
const colors = {
  bg: '#131314',
  sidebar: '#1E1F20',
  hover: '#282A2C',
  accent: {
    orange: '#FF6B35',
    cyan: '#00D4FF',
    red: '#FF3B3B',
    purple: '#A855F7',
    yellow: '#FBBF24'
  }
};
```

---

## 📊 Success Metrics (Phase 5)
- Inquiry form submits successfully
- Email notifications sent to Golf Okay team
- Inquiries persisted to database
- Form validation prevents invalid submissions

### Business Targets (Post-Launch)
- Guest → Signed Up: 15% conversion
- Average turns per session: 5+
- Time to inquiry: <10 min

---

## Generative UI Components

| Component | Trigger Tool | Status |
|-----------|-------------|--------|
| CourseCarousel | `show_courses` | ✅ |
| CourseDetailCard | `show_course_detail` | ✅ |
| FleetCard | `show_fleet` | ✅ |
| AboutCard | `show_about_us` | ✅ |
| ItineraryBuilder | `start_itinerary_builder` | ✅ |
| ItinerarySummary | (wizard completion) | ✅ |
| TourShowcase | `start_tour` | ✅ |
| ServiceBento | `show_services` | ✅ |
| AuthGateModal | `trigger_auth_gate` | ✅ |
| InquiryForm | `start_inquiry` | ✅ |
| GearRentalCard | `show_gear_rental` | 📋 Backlog |

---

## Data Models

### ItineraryDraft (Current)
```typescript
interface ItineraryDraft {
  id: string;
  userId?: string;
  region: string;
  groupSize: number;
  vibe: 'championship' | 'scenic' | 'value';
  days: ItineraryDay[];
  includesTransfer: boolean;
  transferType?: 'sedan' | 'vip_van';
  totalEstimate: number;
  status: 'draft' | 'inquiry_sent' | 'confirmed';
}
```

### User (Phase 4)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  savedCourses: string[];
  userType: 'guest' | 'member';
}
```

---

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Phase 4-5
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...

# Memory System
OPENAI_API_KEY=sk-...  # For embeddings (text-embedding-3-small)

# Future
STRIPE_SECRET_KEY=sk_...
CLOUDINARY_API_KEY=...
```
