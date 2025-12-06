# Orby OS: Implementation Plan

## 📍 Current Phase: Phase 0 - Foundation Setup
**Goal:** Set up new tech stack without breaking existing B2C functionality

### Active Priorities
1. Install new dependencies (tRPC, Zustand, Trigger.dev, etc.)
2. Configure tRPC with Next.js App Router
3. Set up Zustand stores (parallel to existing Context)
4. Configure Trigger.dev project
5. Add Sentry and PostHog
6. Create multi-tenant database migrations

### Immediate Task List
- [ ] Install tRPC packages (@trpc/server, @trpc/client, @trpc/react-query)
- [ ] Install Zustand and configure stores
- [ ] Install Trigger.dev SDK and configure project
- [ ] Install Stripe packages
- [ ] Install PostHog and Sentry
- [ ] Create `src/server/trpc.ts` with tenant middleware
- [ ] Create `src/server/context.ts` for request context
- [ ] Create `src/server/routers/index.ts` root router
- [ ] Create `src/stores/` directory with partner, inbox, quotes stores
- [ ] Create `src/trigger/` directory with client and tasks
- [ ] Create `src/trpc/client.tsx` provider
- [ ] Run migration: `20241205000001_multi_tenant.sql`
- [ ] Seed Golf Okay as Partner #0
- [ ] Verify existing B2C chat still works

### Pending Decisions
- None for Phase 0 (foundational setup)

---

## 🏗 Architecture Reference

### Tech Stack (New)
- **API Layer:** tRPC 11.x (type-safe, middleware-protected)
- **State:** Zustand 5.x (client state management)
- **Background:** Trigger.dev 3.x (durable functions, retries)
- **Billing:** Stripe (subscriptions, usage billing)
- **Analytics:** PostHog (product analytics, feature flags)
- **Errors:** Sentry 8.x (error monitoring)

### Tech Stack (Existing)
- **Framework:** Next.js 16 (App Router), React 19
- **Styling:** Tailwind CSS v4 (dark mode default)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Database:** Supabase (Postgres) with RLS
- **Email:** Resend
- **Hosting:** Vercel

### Route Structure
```
golfokay.co/              → Customer chat (existing B2C)
golfokay.co/office        → Partner dashboard (new)
golfokay.co/office/inbox  → Unified inbox
golfokay.co/office/quotes → Quote management
golfokay.co/office/clients→ Client CRM
golfokay.co/office/rates  → Rate management
trips.golfokay.co/[token] → Client trip portals (future)
```

### New File Structure
```
src/
├── server/
│   ├── trpc.ts              # tRPC initialization
│   ├── context.ts           # Request context with partnerId
│   └── routers/
│       ├── index.ts         # Root router
│       ├── partner.ts
│       ├── client.ts
│       ├── quote.ts
│       ├── booking.ts
│       ├── inbox.ts
│       ├── rate.ts
│       └── analytics.ts
├── stores/
│   ├── partner.ts           # Partner state
│   ├── inbox.ts             # Inbox filters, selection
│   └── quotes.ts            # Quote filters, draft state
├── trigger/
│   ├── client.ts            # Trigger.dev client
│   └── tasks/
│       ├── process-email.ts
│       ├── classify-message.ts
│       ├── generate-draft.ts
│       ├── generate-quote.ts
│       └── send-quote-email.ts
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
    │       ├── rates/
    │       └── settings/
    ├── api/
    │   ├── trpc/[trpc]/route.ts
    │   └── webhooks/
    │       ├── email/route.ts
    │       ├── whatsapp/route.ts
    │       └── stripe/route.ts
    └── (portal)/            # Client trip portals
        └── trips/[token]/
```

### Database Schema (Multi-Tenant)
- **partners** - Organizations with settings, billing, branding
- **partner_members** - Team members with roles/permissions
- **clients** - Partner's customers
- **channels** - Connected communication channels
- **contacts** - Unified contacts across channels
- **conversations** - Thread per contact per channel
- **inbox_messages** - All messages, all channels
- **quotes** - Quote with line items, versioning
- **quote_items** - Line items (golf, transport, service)
- **bookings** - Confirmed quotes with portal access
- **course_rates** / **transport_rates** - Rate management
- **usage_records** - AI token tracking, billing metrics
- **audit_logs** - Action history

---

## 📅 Roadmap

### Phase 0: Foundation Setup (Current - Week 1)
- [ ] Install all new dependencies
- [ ] Configure tRPC with tenant middleware
- [ ] Set up Zustand stores
- [ ] Configure Trigger.dev
- [ ] Create multi-tenant migrations
- [ ] Verify B2C still works

### Phase 1: Office Foundation (Week 2-3)
- [ ] /office layout with auth protection
- [ ] Partner context and middleware
- [ ] Dashboard with placeholder metrics
- [ ] Basic navigation sidebar
- [ ] Golf Okay seeded as Partner #0

### Phase 2: Unified Inbox - Email (Week 4-5)
- [ ] Email inbound webhook (Resend)
- [ ] Trigger.dev task for email processing
- [ ] AI classification (intent, sentiment, priority)
- [ ] AI draft response generation
- [ ] Inbox UI with conversation list
- [ ] Conversation detail view
- [ ] Reply composition and sending
- [ ] Real-time updates via Supabase

### Phase 3: Quote Engine (Week 6-7)
- [ ] Quote builder UI
- [ ] AI quote generation from conversation
- [ ] Rate lookup and margin calculation
- [ ] PDF export (React PDF)
- [ ] Email quote to client
- [ ] Quote versioning

### Phase 4: Client CRM (Week 8)
- [ ] Client list with search/filters
- [ ] Client detail view
- [ ] Link clients to contacts
- [ ] Activity timeline
- [ ] Preferences tracking

### Phase 5: Rate Management (Week 9)
- [ ] Course rate editor
- [ ] Transport rate editor
- [ ] Season and validity management
- [ ] Partner-specific vs global rates

### Phase 6: Billing Integration (Week 10)
- [ ] Stripe customer creation
- [ ] Subscription management
- [ ] Usage tracking and metering
- [ ] Invoice generation

### Phase 7: Polish & Launch (Week 11-12)
- [ ] Error handling and edge cases
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Help documentation

### Foundation (Completed - Golf Okay B2C)
**Phases 1-7:** Chat engine, 14 AI tools, CourseCarousel, CourseDetailCard, FleetCard, AboutCard, ItineraryBuilder wizard, TourShowcase, ServiceBento, AuthGateModal, InquiryForm, Supabase database, Google OAuth, memory system, admin MVP

---

## 📝 Implementation Notes

### tRPC Setup Pattern
```typescript
// src/server/trpc.ts
const hasPartner = t.middleware(async ({ ctx, next }) => {
  const { data: membership } = await ctx.supabase
    .from('partner_members')
    .select('partner_id, role, permissions')
    .eq('user_id', ctx.user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }

  return next({
    ctx: {
      ...ctx,
      partnerId: membership.partner_id,
      role: membership.role,
      permissions: membership.permissions,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed).use(hasPartner);
```

### Zustand Store Pattern
```typescript
// src/stores/inbox.ts
export const useInboxStore = create<InboxState>()(
  persist(
    (set) => ({
      statusFilter: 'open',
      channelFilter: null,
      selectedConversationId: null,
      setStatusFilter: (status) => set({ statusFilter: status }),
      selectConversation: (id) => set({ selectedConversationId: id }),
    }),
    { name: 'inbox-store' }
  )
);
```

### Trigger.dev Task Pattern
```typescript
// src/trigger/tasks/process-email.ts
export const processInboundEmail = task({
  id: "process-inbound-email",
  retry: { maxAttempts: 3, factor: 2 },
  run: async (payload) => {
    // 1. Find or create contact
    // 2. Find or create conversation
    // 3. Store message
    // 4. Classify with AI
    // 5. Generate draft if appropriate
    // 6. Notify if urgent
  },
});
```

---

## 📊 Success Metrics

### Phase 0-1 Complete When:
- [ ] All dependencies installed
- [ ] tRPC routes respond correctly
- [ ] Zustand stores persist state
- [ ] Trigger.dev dashboard shows project
- [ ] Golf Okay team can log into /office
- [ ] Existing B2C chat unaffected

### MVP Complete When:
- [ ] Golf Okay operates entirely from /office for 2 weeks
- [ ] Emails appear in unified inbox
- [ ] AI classifies and drafts responses
- [ ] Quotes can be created and sent
- [ ] Response time < 1 second for all operations

---

## Environment Variables (New)

```env
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

---

## References

- `coding-prompt.md` - Complete implementation guide with code patterns
- [tRPC Documentation](https://trpc.io/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
