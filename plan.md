# Golf Okay: Implementation Plan

## 📍 Current Phase: Phase 7 - Admin MVP
**Goal:** B2B operations dashboard to serve Vietnam client and import existing rate data

### Active Priorities
1. Admin route structure (`/admin/*`)
2. Course data import from Excel
3. Rate sheet PDF generator
4. Quote builder for B2B clients

### Immediate Task List
- [ ] Create admin layout and sidebar
- [ ] Build CSV/Excel import tool for courses
- [ ] Create database migration for rates, clients, quotes tables
- [ ] Import 50+ courses from existing spreadsheets
- [ ] Build rate sheet export (PDF + Excel)
- [ ] Create quote builder interface
- [ ] Add client/inquiry tracker
- [ ] Respond to Vietnam B2B client

---

## 🏗 Architecture Reference

### Tech Stack
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4 (dark mode default)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Database:** Supabase (Postgres) with RLS
- **Animation:** Framer Motion
- **Email:** Resend
- **PDF:** (TBD - react-pdf or @react-pdf/renderer)
- **Hosting:** Vercel

### Route Structure
```
golfokay.co/              → Consumer chat (existing demo)
golfokay.co/admin         → Operations dashboard (Phase 7)
golfokay.co/admin/courses → Course & rate management
golfokay.co/admin/quotes  → Quote builder & export
golfokay.co/admin/clients → B2B client management
golfokay.co/admin/bookings→ Booking tracker
```

### Admin File Structure
```
src/app/admin/
├── layout.tsx              # Admin layout with sidebar
├── page.tsx                # Dashboard
├── courses/
│   ├── page.tsx            # Course list
│   ├── [id]/page.tsx       # Course detail/edit
│   └── import/page.tsx     # Bulk import
├── transport/
│   ├── page.tsx            # Transport rates
│   └── import/page.tsx     # Bulk import
├── clients/
│   ├── page.tsx            # Client list
│   └── [id]/page.tsx       # Client detail
├── quotes/
│   ├── page.tsx            # Quote list
│   ├── new/page.tsx        # Quote builder
│   └── [id]/page.tsx       # Quote detail/edit
├── bookings/
│   ├── page.tsx            # Booking list
│   └── [id]/page.tsx       # Booking detail
└── components/
    ├── AdminSidebar.tsx
    ├── AdminHeader.tsx
    ├── DataTable.tsx
    ├── QuoteBuilder.tsx
    ├── RateSheetExport.tsx
    └── PDFGenerator.tsx
```

### Database Schema (New Tables)
- **clients** - B2B partners (tour operators, travel agents)
- **course_rates** - Net rates, rack rates, seasonal pricing
- **transport_rates** - Vehicle and route pricing
- **quotes** - Quote builder with line items
- **bookings** - Confirmed bookings from quotes

### Existing Assets
- **50+ courses** with net rates (in Excel)
- **Transport rates** (in Excel)
- **Course contacts** (direct relationships)
- **Vietnam B2B inquiry** (active lead)

---

## 📅 Roadmap

### Phase 7: Admin MVP (Current - 1-2 Weeks)
**Goal:** Serve Vietnam client, import existing data

Week 1: Data Foundation
- [ ] CSV/Excel bulk import tool
- [ ] Course rates table + import
- [ ] Transport rates table + import
- [ ] Admin CRUD interface

Week 2: Operations Tools
- [ ] Rate sheet PDF generator
- [ ] Quote builder
- [ ] Client/inquiry tracker
- [ ] Dashboard with metrics

### Phase 8: Quote & Booking Workflow (2-3 Weeks)
- [ ] Quote templates
- [ ] Version tracking
- [ ] Convert quote → booking
- [ ] Booking confirmation workflow
- [ ] Payment tracking
- [ ] Reporting

### Phase 9: B2B Partner Portal (4-6 Weeks)
- [ ] Partner login
- [ ] View contracted rates
- [ ] Submit booking requests
- [ ] Track bookings
- [ ] Download invoices

### Phase 10: Consumer Enhancement (Lower Priority)
- [ ] Connect chat to real course data
- [ ] Real pricing display
- [ ] Inquiry → Admin notification
- [ ] SEO/content

### Foundation (Completed)

**Phase 1 - Chat Foundation:**
Chat engine with streaming, Anthropic integration, CourseCarousel with 3D flip animation

**Phase 2 - Data Layer:**
Supabase integration, 15 seed courses, tool execution loop, CourseDetailCard, FleetCard, AboutCard

**Phase 3 - ItineraryBuilder:**
4-step wizard (Region → Vibe → Logistics → Dates), pricing with group discounts, ItinerarySummary

**Phase 3b - Tour & Services:**
TourShowcase auto-playing carousel, ServiceBento grid, GolfOkay logo, Chipotle-style pickers

**Phase 4 - Authentication:**
Supabase Auth with Google OAuth, AuthGateModal, saved courses + itinerary drafts

**Phase 5 - Booking Flow:**
InquiryForm component, inquiry API routes, Resend email integration

**Phase 6 - Polish & Launch:**
Mobile responsive design, error boundaries, loading states, Plausible analytics ready

**Memory System:**
Session identity, passive profiler Edge Function, OpenAI embeddings, semantic retrieval, context builder

**UI/UX Overhaul:**
Gemini-style sidebar, chat history, Header Explore dropdown, NeuralDots avatar, thinking halo

---

## 📝 Implementation Notes

### Admin Security
```typescript
// Protect admin routes with email whitelist
const ADMIN_EMAILS = ['your-email@gmail.com'];

// In admin layout.tsx
const { user } = await getUser();
if (!user || !ADMIN_EMAILS.includes(user.email)) {
  redirect('/');
}
```

### Rate Sheet Export Pattern
```typescript
// Generate PDF with course rates
interface RateSheetOptions {
  courses: Course[];
  region?: string;
  dateRange: { from: Date; to: Date };
  markupPercent: number;
  format: 'pdf' | 'excel';
}
```

### Quote Builder Pattern
```typescript
interface QuoteLineItem {
  type: 'golf' | 'transport' | 'service';
  description: string;
  quantity: number;
  netRate: number;
  sellRate: number;
  date?: Date;
}

interface Quote {
  client: Client;
  items: QuoteLineItem[];
  validUntil: Date;
  notes: string;
}
```

---

## 📊 Success Metrics

### Phase 7 (Admin MVP)
- [ ] 50+ courses imported with net rates
- [ ] Transport rates in system
- [ ] Generate rate sheet PDF in <5 minutes
- [ ] Create custom quote in <10 minutes
- [ ] Vietnam client served professionally

### Business (Ongoing)
- B2B clients onboarded: Target 5
- Quotes sent per month: Track
- Quote → Booking conversion: Track
- Revenue pipeline: Track

---

## Environment Variables

```env
# Required
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...

# Admin
ADMIN_EMAILS=your-email@gmail.com

# Future
STRIPE_SECRET_KEY=sk_...
```
