# Golf Okay - Conversational Platform Plan

## Project Overview

**Vision:** A conversational AI interface where the chat window becomes a dynamic canvas. Users interact with beautiful, interactive React components (course cards, itinerary builders, fleet configurators) instead of static text. The AI guides users from discovery → customization → sign-up → booking.

**Target Audience:** B2C (international tourists) and B2B (tour operators, with separate platform/account type TBD)

**Tech Stack:**
- Framework: Next.js 16 (App Router)
- Styling: Tailwind CSS v4 (dark mode default)
- AI Backend: Anthropic Claude API
- Auth: Supabase Auth
- Database: Supabase (Postgres)
- Data Source: Google Sheets → sync to Supabase
- Image Hosting: Cloudinary
- Payment: Stripe (Phase 5+)
- Animation: Framer Motion
- Hosting: Vercel
- Mobile: PWA
- B2B Platform: partners.golfokay.co (separate subdomain, shared backend)

---

## Current State

The prototype (`src/app/page.tsx`) includes:
- ✅ Gemini-style dark UI shell
- ✅ Collapsible sidebar with Gems/Chats sections
- ✅ Profile dropdown with account switching
- ✅ Mode selection pills (Create image, Create video, Write anything, Help me learn)
- ✅ Input container with focus states
- ✅ Theme toggle (dark/light)

Missing:
- ❌ Actual chat functionality (message history, streaming)
- ❌ AI integration (Anthropic API)
- ❌ Generative UI components
- ❌ Data layer (courses, pricing, availability)
- ❌ Authentication system
- ❌ Responsive/mobile design

## Design Approach

**No separate design system phase.** The prototype serves as the reference.

The existing `page.tsx` contains the design language:
- Colors: `#131314` (bg), `#1E1F20` (sidebar/cards), `#282A2C` (hover/active)
- Accent: TBD - let design emerge from implementation
- Radii: `rounded-3xl` (cards), `rounded-full` (buttons/pills)
- Shadows: `shadow-lg`, custom popover shadows

**Process:** Extract tokens as components are built. Design system emerges from implementation, not the other way around.

Reference the prototype's `colors` object and existing component patterns when building new generative UI components.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Sidebar   │  │  Chat Feed  │  │  Generative UI      │  │
│  │  - Gems     │  │  - Messages │  │  - CourseCarousel   │  │
│  │  - History  │  │  - Stream   │  │  - ItineraryBuilder │  │
│  │  - Auth     │  │  - Input    │  │  - FleetConfig      │  │
│  └─────────────┘  └─────────────┘  │  - TrustCard        │  │
│                                     │  - PricingCard      │  │
│                                     └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     API Routes                               │
│  /api/chat          - Anthropic streaming + tool use         │
│  /api/courses       - Course data CRUD                       │
│  /api/availability  - Check/update availability              │
│  /api/inquiries     - Submit booking inquiries               │
│  /api/auth/*        - Authentication endpoints               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Database   │  │  Google     │  │  Anthropic          │  │
│  │  - Users    │  │  Sheets     │  │  Claude API         │  │
│  │  - Sessions │  │  - Courses  │  │  - Tool Use         │  │
│  │  - Inquiries│  │  - Pricing  │  │  - Streaming        │  │
│  │  - Drafts   │  │  - Sync Job │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Generative UI Components

These components render inside the chat feed based on AI tool calls.

### 1. CourseCarousel
**Trigger:** User asks "What courses do you have in Bangkok?"
**Display:** Horizontal swipeable cards with hero images
**Features:**
- Flip animation to show scorecard/pricing
- Heart icon to save to draft
- Tags: Championship, Night Golf, Scenic, etc.
- Guest sees "From $X" / Member sees exact price

### 2. ItineraryBuilder (Multi-step Wizard)
**Trigger:** User clicks "Build Custom Trip" or asks to plan
**Steps:**
1. Region Select (Bangkok, Phuket, Hua Hin, Chiang Mai) - map visual
2. Vibe Check (Championship, Scenic, Value)
3. Logistics (Transfer toggle, Caddie tip toggle)
4. Date/Group size
**Output:** ItinerarySummary card with timeline and rolling price counter

### 3. ItinerarySummary
**Trigger:** Builder completion or package selection
**Display:** Vertical timeline connecting airport → hotel → courses
**Features:**
- Animated price counter
- Day-by-day breakdown
- CTA: "Proceed to Booking" (triggers auth gate for guests)

### 4. FleetConfigurator
**Trigger:** User asks about transport
**Display:** Vehicle cards with toggle between options
**Features:**
- Sedan vs VIP Van comparison
- Amenity icons (WiFi, cold towels, etc.)
- Price impact display

### 5. TrustCard (About Us)
**Trigger:** User asks "Who are you?" or about legitimacy
**Display:** Glass-morphism card with founder photos
**Features:**
- IAGTO badge, 28 Years Experience badge
- Hover flip to show golfer profiles
- CTA: Chat with Tanyawit

### 6. CourseDetailCard
**Trigger:** User selects a specific course
**Display:** Full-width card with signature hole image
**Features:**
- Stats bar (Par, Yardage, Holes)
- Amenities icons
- Green fee display (guest vs member)
- "Add to Trip" button

### 7. GearRentalCard
**Trigger:** User asks about club rental
**Display:** Equipment showcase
**Features:**
- Brand options (Callaway, TaylorMade, etc.)
- Condition ratings
- Pricing tiers

---

## User Flows

### Flow 1: Guest Discovery
```
Landing (Hero State)
    │
    ├── Click "Popular Packages"
    │   └── CourseCarousel renders
    │       └── User browses, hearts courses
    │
    ├── Click "Build Custom Trip"
    │   └── ItineraryBuilder wizard
    │       └── ItinerarySummary renders
    │           └── Click "Proceed"
    │               └── Auth Gate Modal
    │
    └── Ask questions via chat
        └── AI responds with text + components
```

### Flow 2: Member Experience
```
Logged In
    │
    ├── Sidebar shows: Draft Trips, Confirmed Bookings, Saved Courses
    │
    ├── Full pricing visibility (no "From $X")
    │
    ├── ItinerarySummary shows:
    │   └── "Pay Deposit" or "Export PDF" buttons
    │
    └── Human Support link (direct to Tanyawit)
```

### Flow 3: Auth Gate (Soft Conversion)
```
Guest interacts freely for 3+ turns or clicks "Book/Save"
    │
    └── Modal appears:
        "Save this Itinerary?"
        "Create a free Golf Okay account to unlock..."
        │
        ├── Continue with Google
        └── Sign Up with Email
```

---

## AI System Prompt

```
You are Golf Okay, an expert Golf Concierge for Thailand. Founded by Tanyawit and Pharuehat.

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
- show_gear_rental()
- show_about_us()
- start_itinerary_builder(region?)
- show_itinerary_summary(itinerary_data)
- trigger_auth_gate(reason)
- submit_inquiry(itinerary_id, contact_info)
```

---

## Data Model

### Courses (from Google Sheets → Database)
```typescript
interface Course {
  id: string;
  name: string;
  region: 'bangkok' | 'phuket' | 'hua_hin' | 'chiang_mai' | 'pattaya';
  location: string;
  coordinates: { lat: number; lng: number };
  par: number;
  yardage: number;
  holes: 18 | 9;
  tags: string[]; // ['championship', 'night_golf', 'scenic', 'fast_greens']
  signatureHole: number;
  heroImage: string;
  galleryImages: string[];
  description: string;
  amenities: string[];
  greenFee: {
    weekday: { guest: number; member: number };
    weekend: { guest: number; member: number };
  };
  caddieFee: number;
  cartFee: number;
  contractPrice: number; // Your net rate
  availabilityMode: 'realtime' | 'request'; // For V1, mostly 'request'
}
```

### Itinerary Draft
```typescript
interface ItineraryDraft {
  id: string;
  userId?: string; // null for guests (stored in session)
  region: string;
  startDate?: Date;
  endDate?: Date;
  groupSize: number;
  vibe: 'championship' | 'scenic' | 'value';
  days: ItineraryDay[];
  includesTransfer: boolean;
  transferType?: 'sedan' | 'vip_van';
  includesCaddieTip: boolean;
  totalEstimate: number;
  status: 'draft' | 'inquiry_sent' | 'confirmed';
  createdAt: Date;
  updatedAt: Date;
}

interface ItineraryDay {
  date?: Date;
  dayNumber: number;
  activities: Activity[];
}

interface Activity {
  type: 'airport_pickup' | 'hotel' | 'golf' | 'transfer' | 'airport_dropoff';
  courseId?: string;
  hotelName?: string;
  teeTime?: string;
  notes?: string;
}
```

### User
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  handicap?: number;
  phone?: string;
  country?: string;
  userType: 'guest' | 'member' | 'b2b_operator'; // For future B2B
  savedCourses: string[]; // course IDs
  createdAt: Date;
}
```

### Inquiry
```typescript
interface Inquiry {
  id: string;
  userId: string;
  itineraryId: string;
  status: 'pending' | 'quoted' | 'confirmed' | 'cancelled';
  contactMethod: 'email' | 'whatsapp' | 'line';
  notes?: string;
  quotedPrice?: number;
  depositPaid?: boolean;
  createdAt: Date;
}
```

---

## Development Phases

### Phase 1: Foundation ✅ COMPLETED
**Goal:** Chat works, AI responds, basic components render

- [x] Set up project structure
  - [x] Create `/components/chat/` directory
  - [x] Create `/components/generative-ui/` directory
  - [x] Create `/lib/` for utilities
  - [x] Create `/api/` routes structure

- [x] Implement chat engine
  - [x] Message state management (React Context)
  - [x] Chat history component
  - [x] Streaming message display
  - [x] Input handling (replace current static input)

- [x] Anthropic integration
  - [x] API route `/api/chat` with streaming
  - [x] Tool definitions for generative UI
  - [x] System prompt implementation
  - [ ] Error handling and rate limiting (deferred to Phase 2)

- [x] First generative component: CourseCarousel
  - [x] Static card component with mock data
  - [x] Horizontal scroll/swipe
  - [x] Basic flip animation (Framer Motion 3D)
  - [x] Heart/save interaction (local state)

### Phase 2: Data Layer (Week 2-3)
**Goal:** Real course data flows through the system

- [ ] Database setup
  - [ ] Choose provider (Supabase recommended for speed)
  - [ ] Schema design and migrations
  - [ ] Connection setup

- [ ] Google Sheets sync
  - [ ] Read course data from Sheets
  - [ ] Transform to database schema
  - [ ] Sync script (manual trigger for V1, cron later)

- [ ] Course images
  - [ ] Organize local images
  - [ ] Upload to CDN (Vercel Blob, Cloudinary, or S3)
  - [ ] Map image URLs to course records

- [ ] API routes
  - [ ] `/api/courses` - list, filter, get by ID
  - [ ] `/api/courses/[id]` - single course detail
  - [ ] Connect AI tools to real data

### Phase 3: ItineraryBuilder Wizard ✅ COMPLETED
**Goal:** Multi-step trip planning wizard

- [x] ItineraryBuilder wizard
  - [x] Step components (Region, Vibe, Logistics, Dates)
  - [x] State management for wizard flow (ItineraryContext)
  - [x] Price calculation logic with group discounts

- [x] ItinerarySummary
  - [x] Timeline visualization
  - [x] Animated price counter
  - [x] Day breakdown cards

- [x] start_itinerary_builder tool registered

### Phase 3b: Additional Components (Pending)
**Goal:** Full generative UI suite

- [ ] FleetConfigurator
  - [ ] Vehicle cards
  - [ ] Toggle comparison
  - [ ] Price impact display

- [ ] TrustCard (About Us)
  - [ ] Glass-morphism styling
  - [ ] Founder info
  - [ ] Badges

- [ ] CourseDetailCard
  - [ ] Full detail view
  - [ ] Scorecard display
  - [ ] Add to trip functionality

### Phase 4: Authentication (Week 4-5)
**Goal:** Users can sign up, save, and manage trips

- [ ] Auth provider setup
  - [ ] Choose provider (Supabase Auth or NextAuth)
  - [ ] Google OAuth
  - [ ] Email/password

- [ ] Auth gate modal
  - [ ] Trigger conditions (3-turn limit, save/book click)
  - [ ] Smooth modal animation
  - [ ] Post-auth redirect

- [ ] User features
  - [ ] Save courses (heart)
  - [ ] Save itinerary drafts
  - [ ] View booking history

- [ ] Sidebar auth state
  - [ ] Guest view vs Member view
  - [ ] My Drafts section
  - [ ] Saved Courses section

### Phase 5: Booking Flow (Week 5-6)
**Goal:** Users can submit inquiries

- [ ] Inquiry submission
  - [ ] Form component (contact details, notes)
  - [ ] API route to store inquiry
  - [ ] Email notification to Golf Okay team

- [ ] Availability handling
  - [ ] "Request Availability" flow for courses
  - [ ] Manual availability update interface (admin)
  - [ ] Status display in itinerary

- [ ] Member pricing
  - [ ] Show exact prices for logged-in users
  - [ ] Price breakdown component

### Phase 6: Polish & Launch (Week 6-7)
**Goal:** Production ready

- [ ] Responsive design
  - [ ] Mobile chat interface
  - [ ] Mobile-friendly components
  - [ ] Touch interactions

- [ ] Performance
  - [ ] Image optimization
  - [ ] Lazy loading components
  - [ ] Streaming optimization

- [ ] Error handling
  - [ ] Graceful AI failures
  - [ ] Offline states
  - [ ] Loading states for all async operations

- [ ] Analytics
  - [ ] Track user flows
  - [ ] Conversion funnel
  - [ ] AI interaction metrics

- [ ] Deployment
  - [ ] Vercel production setup
  - [ ] Environment variables
  - [ ] Domain configuration (golfokay.co)

---

## File Structure

```
overhauled-golfokay/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Main chat interface
│   │   ├── globals.css
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts            # Anthropic streaming endpoint
│   │   │   ├── courses/
│   │   │   │   ├── route.ts            # List/filter courses
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts        # Single course
│   │   │   ├── inquiries/
│   │   │   │   └── route.ts            # Submit inquiry
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts        # If using NextAuth
│   │   │
│   │   └── (auth)/                     # Auth-related pages if needed
│   │       ├── login/
│   │       └── signup/
│   │
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatContainer.tsx       # Main chat wrapper
│   │   │   ├── MessageList.tsx         # Scrollable message history
│   │   │   ├── Message.tsx             # Single message (text or component)
│   │   │   ├── ChatInput.tsx           # Input bar with modes
│   │   │   └── StreamingText.tsx       # Typewriter effect for AI
│   │   │
│   │   ├── generative-ui/
│   │   │   ├── CourseCarousel.tsx
│   │   │   ├── CourseCard.tsx
│   │   │   ├── CourseDetailCard.tsx
│   │   │   ├── ItineraryBuilder/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── RegionStep.tsx
│   │   │   │   ├── VibeStep.tsx
│   │   │   │   └── LogisticsStep.tsx
│   │   │   ├── ItinerarySummary.tsx
│   │   │   ├── FleetConfigurator.tsx
│   │   │   ├── TrustCard.tsx
│   │   │   ├── GearRentalCard.tsx
│   │   │   └── AuthGateModal.tsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── ProfileDropdown.tsx
│   │   │
│   │   └── ui/                         # Shared UI primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Badge.tsx
│   │       └── Toggle.tsx
│   │
│   ├── lib/
│   │   ├── anthropic.ts                # Claude API client
│   │   ├── tools.ts                    # Tool definitions for AI
│   │   ├── db.ts                       # Database client
│   │   ├── sheets.ts                   # Google Sheets sync
│   │   └── utils.ts                    # Shared utilities
│   │
│   ├── hooks/
│   │   ├── useChat.ts                  # Chat state management
│   │   ├── useCourses.ts               # Course data fetching
│   │   └── useAuth.ts                  # Auth state
│   │
│   ├── context/
│   │   ├── ChatContext.tsx
│   │   ├── AuthContext.tsx
│   │   └── ItineraryContext.tsx
│   │
│   └── types/
│       ├── course.ts
│       ├── itinerary.ts
│       ├── user.ts
│       └── chat.ts
│
├── public/
│   ├── courses/                        # Course images (or use CDN)
│   └── icons/
│
├── scripts/
│   └── sync-sheets.ts                  # Google Sheets sync script
│
├── plan.md                             # This file
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── .env.local                          # API keys, DB connection
```

---

## Dev Modes (Cost Optimization)

```env
# Development mode - controls API usage
DEV_MODE=mock    # Zero API calls, reads from /dev/mock-responses.json
DEV_MODE=cached  # Cache-first, falls back to API, stores responses
DEV_MODE=live    # Direct API calls (production)
```

Mock mode for UI development, cached mode for integration testing.

---

## Environment Variables

```env
# Development
DEV_MODE=mock

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Google Sheets (for sync)
GOOGLE_SHEETS_ID=...
GOOGLE_SERVICE_ACCOUNT_EMAIL=...
GOOGLE_PRIVATE_KEY=...

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Stripe (Phase 5+)
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## Dependencies to Add

```bash
# AI
npm install @anthropic-ai/sdk ai

# Supabase (Auth + Database)
npm install @supabase/supabase-js @supabase/ssr

# Animation
npm install framer-motion

# UI utilities
npm install clsx tailwind-merge
npm install @radix-ui/react-dialog
npm install @radix-ui/react-toggle

# Google Sheets (for sync script)
npm install googleapis

# Cloudinary
npm install cloudinary next-cloudinary

# Carousel
npm install embla-carousel-react

# Forms
npm install react-hook-form zod @hookform/resolvers

# Stripe (Phase 5+)
npm install stripe @stripe/stripe-js
```

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Auth** | Supabase Auth | Integrated with DB, Google OAuth built-in, row-level security |
| **Database** | Supabase (Postgres) | Single platform with auth, real-time capable, good DX |
| **Payment** | Stripe | International card support, Thai Baht, excellent docs |
| **B2B Platform** | partners.golfokay.co | Separate subdomain, clean separation, can share Supabase backend |
| **Image Hosting** | Cloudinary | Auto-optimization, responsive transforms, good free tier |
| **Mobile** | PWA for V1 | Sufficient for conversational UI, native consideration for V2 |

---

## Success Metrics

- **Conversion:** Guest → Signed Up (target: 15% of engaged users)
- **Engagement:** Average turns per session (target: 5+)
- **Inquiry Rate:** Signed Up → Inquiry Submitted (target: 30%)
- **Time to Inquiry:** Average time from landing to inquiry (target: <10 min)

---

## Next Steps

1. ~~Review this plan, adjust priorities~~ ✅
2. ~~Set up environment (Supabase account, Anthropic API key)~~ ✅
3. ~~Begin Phase 1: Chat engine + first component~~ ✅
4. ~~Phase 3: ItineraryBuilder wizard~~ ✅
5. Merge Phase 2 data layer branch (Supabase, tool execution loop)
6. Implement dev modes (mock/cached/live) to reduce API costs during development
7. Phase 3b: Additional generative components (FleetConfigurator, TrustCard, etc.)