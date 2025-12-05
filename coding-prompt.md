# Orby OS Implementation Plan

> **Purpose:** This document serves as the complete implementation guide for transforming Golf Okay from a B2C chat interface into Orby OS - a multi-tenant B2B platform for golf tour operators.

---

## Executive Summary

**Vision:** Build "The Operating System for Golf Tourism" - a platform where partners (tour operators, travel agents) get AI-powered tools and their customers get branded trip portals.

**Strategy:** Golf Okay becomes Partner #0, dogfooding the platform before opening to external partners.

**Architecture:** Option C - Platform Architecture (future-proof, enterprise-grade)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack](#2-tech-stack)
3. [Database Schema](#3-database-schema)
4. [Implementation Phases](#4-implementation-phases)
5. [Core Modules](#5-core-modules)
6. [API Aggregator](#6-api-aggregator)
7. [Code Patterns](#7-code-patterns)
8. [Security & Multi-Tenancy](#8-security--multi-tenancy)
9. [Observability](#9-observability)
10. [Testing Strategy](#10-testing-strategy)
11. [Migration Path](#11-migration-path)

---

## 1. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ORBY OS                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PORTALS                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │   golfokay.co    │  │ golfokay.co/office│  │trips.golfokay.co │          │
│  │   (Customer)     │  │    (Partner)      │  │    (Client)      │          │
│  │                  │  │                   │  │                  │          │
│  │  • AI Chat       │  │  • Unified Inbox  │  │  • Trip Details  │          │
│  │  • Discovery     │  │  • Quote Builder  │  │  • Itinerary     │          │
│  │  • Inquiry       │  │  • Client CRM     │  │  • Documents     │          │
│  └────────┬─────────┘  └────────┬──────────┘  └────────┬─────────┘          │
│           │                     │                      │                    │
│           └─────────────────────┼──────────────────────┘                    │
│                                 ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         tRPC API LAYER                                │  │
│  │  Type-safe, middleware-protected, tenant-aware                       │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                 │                                           │
│           ┌─────────────────────┼─────────────────────┐                    │
│           ▼                     ▼                     ▼                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐          │
│  │    SUPABASE      │  │   TRIGGER.DEV    │  │   EXTERNAL APIs  │          │
│  │                  │  │                  │  │                  │          │
│  │  • PostgreSQL    │  │  • Background    │  │  • Stripe        │          │
│  │  • Auth          │  │  • Scheduled     │  │  • Resend        │          │
│  │  • Realtime      │  │  • Retries       │  │  • WhatsApp      │          │
│  │  • Storage       │  │  • Workflows     │  │  • Claude AI     │          │
│  │  • Edge Funcs    │  │                  │  │  • OpenAI        │          │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
INBOUND (Customer/Partner Actions)
──────────────────────────────────
User Action → Next.js → tRPC Procedure → Supabase (RLS enforced)
                │
                └──→ Trigger.dev (async tasks)

OUTBOUND (Background Processing)
────────────────────────────────
Trigger.dev Task → Process → Update Supabase → Notify via Realtime
                         │
                         └──→ External APIs (Email, WhatsApp, etc.)
```

---

## 2. Tech Stack

### Current Stack (Keep)

| Layer | Technology | Version | Status |
|-------|------------|---------|--------|
| Framework | Next.js | 16.x | Keep |
| UI Library | React | 19.x | Keep |
| Language | TypeScript | 5.9.x | Keep |
| Styling | Tailwind CSS | 4.x | Keep |
| Database | Supabase PostgreSQL | Latest | Keep |
| Auth | Supabase Auth | Latest | Keep |
| AI | Anthropic Claude | Sonnet 4 | Keep |
| Embeddings | OpenAI | text-embedding-3-small | Keep |
| Email | Resend | Latest | Keep |
| Animation | Framer Motion | 12.x | Keep |

### New Additions (Add)

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| API | tRPC | 11.x | End-to-end type safety |
| State | Zustand | 5.x | Client state management |
| Background Jobs | Trigger.dev | 3.x | Durable functions, retries |
| Billing | Stripe | Latest | Subscriptions, usage billing |
| Analytics | PostHog | Latest | Product analytics, feature flags |
| Error Tracking | Sentry | 8.x | Error monitoring |
| Observability | Axiom | Latest | Logs and traces |

### Package.json Additions

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

---

## 3. Database Schema

### Multi-Tenant Foundation

```sql
-- ============================================================================
-- MULTI-TENANT FOUNDATION
-- ============================================================================

-- Partners (Organizations)
CREATE TABLE partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,  -- URL-safe identifier

  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#FF6B35',

  -- Settings
  settings JSONB DEFAULT '{
    "timezone": "Asia/Bangkok",
    "currency": "THB",
    "language": "en",
    "ai_enabled": true,
    "white_label": false
  }',

  -- Billing
  stripe_customer_id TEXT,
  subscription_tier TEXT DEFAULT 'starter',  -- 'starter', 'growth', 'enterprise'
  subscription_status TEXT DEFAULT 'trialing',

  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'suspended', 'churned'

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Partner Members (Team)
CREATE TABLE partner_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Role
  role TEXT NOT NULL DEFAULT 'staff',  -- 'owner', 'admin', 'staff'

  -- Permissions (JSON for flexibility)
  permissions JSONB DEFAULT '{
    "quotes": ["read", "create", "update"],
    "clients": ["read", "create", "update"],
    "rates": ["read"],
    "settings": ["read"],
    "billing": []
  }',

  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'invited', 'disabled'
  invited_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(partner_id, user_id)
);

-- Super Admins (Platform level)
-- Stored in auth.users metadata: raw_user_meta_data->>'is_super_admin' = 'true'
```

### Clients & Contacts

```sql
-- ============================================================================
-- CLIENTS & CONTACTS
-- ============================================================================

-- Clients (Partner's customers)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

  -- Identity
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,  -- E.164 format
  company TEXT,

  -- Profile
  tags TEXT[] DEFAULT '{}',
  notes TEXT,

  -- Preferences (learned over time)
  preferences JSONB DEFAULT '{
    "regions": [],
    "budget_range": null,
    "group_size_typical": null,
    "preferred_courses": []
  }',

  -- Stats
  total_bookings INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  last_booking_at TIMESTAMPTZ,

  -- Source
  source TEXT,  -- 'website', 'referral', 'whatsapp', 'email'
  source_detail TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_clients_partner ON clients(partner_id);
CREATE INDEX idx_clients_email ON clients(partner_id, email);
CREATE INDEX idx_clients_phone ON clients(partner_id, phone);
```

### Quotes & Bookings

```sql
-- ============================================================================
-- QUOTES & BOOKINGS
-- ============================================================================

-- Quotes
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id),

  -- Reference
  quote_number TEXT NOT NULL,  -- 'GK-2024-001'

  -- Trip Details
  title TEXT NOT NULL,
  destination TEXT,
  start_date DATE,
  end_date DATE,
  group_size INT,

  -- Pricing
  subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
  discount DECIMAL(12,2) DEFAULT 0,
  tax DECIMAL(12,2) DEFAULT 0,
  total DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'THB',

  -- Margins
  cost_total DECIMAL(12,2),  -- Partner's cost
  margin_amount DECIMAL(12,2),
  margin_percent DECIMAL(5,2),

  -- Status
  status TEXT DEFAULT 'draft',  -- 'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'

  -- Timestamps
  sent_at TIMESTAMPTZ,
  viewed_at TIMESTAMPTZ,
  responded_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,

  -- Versioning
  version INT DEFAULT 1,
  parent_quote_id UUID REFERENCES quotes(id),

  -- Notes
  internal_notes TEXT,
  client_notes TEXT,

  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Quote Items (Line items)
CREATE TABLE quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,

  -- Type
  item_type TEXT NOT NULL,  -- 'golf', 'hotel', 'transport', 'service', 'custom'

  -- Reference (polymorphic)
  reference_type TEXT,  -- 'course', 'hotel', 'vehicle'
  reference_id UUID,

  -- Details
  name TEXT NOT NULL,
  description TEXT,
  date DATE,

  -- Pricing
  quantity INT DEFAULT 1,
  unit_price DECIMAL(12,2) NOT NULL,
  unit_cost DECIMAL(12,2),  -- Partner's cost
  total_price DECIMAL(12,2) NOT NULL,

  -- Order
  sort_order INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Bookings (Confirmed quotes)
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id),
  quote_id UUID REFERENCES quotes(id),
  client_id UUID NOT NULL REFERENCES clients(id),

  -- Reference
  booking_number TEXT NOT NULL,  -- 'BK-2024-001'

  -- Portal Access
  portal_token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  portal_url TEXT GENERATED ALWAYS AS ('https://trips.golfokay.co/' || portal_token) STORED,

  -- Trip Details (denormalized from quote)
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  group_size INT,

  -- Pricing
  total_amount DECIMAL(12,2) NOT NULL,
  paid_amount DECIMAL(12,2) DEFAULT 0,
  balance_due DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - paid_amount) STORED,
  currency TEXT DEFAULT 'THB',

  -- Status
  status TEXT DEFAULT 'confirmed',  -- 'confirmed', 'in_progress', 'completed', 'cancelled'
  payment_status TEXT DEFAULT 'pending',  -- 'pending', 'partial', 'paid', 'refunded'

  -- Documents
  documents JSONB DEFAULT '[]',  -- [{type, name, url, uploaded_at}]

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_quotes_partner ON quotes(partner_id);
CREATE INDEX idx_quotes_client ON quotes(client_id);
CREATE INDEX idx_quotes_status ON quotes(partner_id, status);
CREATE INDEX idx_bookings_partner ON bookings(partner_id);
CREATE INDEX idx_bookings_portal ON bookings(portal_token);
```

### Unified Inbox (API Aggregator)

```sql
-- ============================================================================
-- UNIFIED INBOX (API AGGREGATOR)
-- ============================================================================

-- Channels (Connected accounts)
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

  -- Type
  type TEXT NOT NULL,  -- 'email', 'whatsapp', 'line', 'messenger', 'web'
  name TEXT,  -- 'Main WhatsApp', 'Support Email'

  -- Configuration (encrypted)
  config JSONB NOT NULL,
  -- email: { provider, domain, webhook_secret }
  -- whatsapp: { phone_number_id, access_token }
  -- line: { channel_id, channel_secret }

  -- Status
  status TEXT DEFAULT 'active',  -- 'active', 'paused', 'error'
  error_message TEXT,
  last_sync_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Contacts (Unified across channels)
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,

  -- Identifiers (multiple channels)
  email TEXT,
  phone TEXT,  -- E.164 format
  whatsapp_id TEXT,
  line_id TEXT,
  messenger_id TEXT,

  -- Profile
  name TEXT,
  avatar_url TEXT,
  company TEXT,

  -- Link to CRM client
  client_id UUID REFERENCES clients(id),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  last_seen_at TIMESTAMPTZ DEFAULT now(),

  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE(partner_id, email),
  UNIQUE(partner_id, phone)
);

-- Conversations (Thread per contact per channel)
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
  channel_id UUID NOT NULL REFERENCES channels(id),
  contact_id UUID NOT NULL REFERENCES contacts(id),

  -- External Reference
  external_thread_id TEXT,  -- Email thread ID, WhatsApp conversation ID

  -- Status & Priority
  status TEXT DEFAULT 'open',  -- 'open', 'pending', 'resolved', 'spam'
  priority TEXT DEFAULT 'normal',  -- 'urgent', 'high', 'normal', 'low'

  -- Assignment
  assigned_to UUID REFERENCES auth.users(id),

  -- AI Classification
  intent TEXT,  -- 'inquiry', 'quote_request', 'booking', 'support', 'spam'
  sentiment TEXT,  -- 'positive', 'neutral', 'negative'
  extracted_data JSONB,  -- { dates, group_size, destination, budget }

  -- Metrics
  message_count INT DEFAULT 0,
  first_response_time_seconds INT,
  resolution_time_seconds INT,

  -- Timestamps
  last_message_at TIMESTAMPTZ,
  first_response_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Messages (All messages, all channels)
CREATE TABLE inbox_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,

  -- Direction
  direction TEXT NOT NULL,  -- 'inbound', 'outbound'

  -- Sender
  sender_type TEXT NOT NULL,  -- 'contact', 'user', 'ai', 'system'
  sender_id UUID,  -- contact_id or user_id depending on sender_type

  -- Content
  content_type TEXT DEFAULT 'text',  -- 'text', 'image', 'document', 'audio', 'video', 'location'
  content TEXT,
  content_rich JSONB,  -- For structured content

  -- External Reference
  external_message_id TEXT,

  -- Status (for outbound)
  status TEXT DEFAULT 'sent',  -- 'draft', 'queued', 'sent', 'delivered', 'read', 'failed'
  error_message TEXT,

  -- AI
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence FLOAT,

  -- Timestamps
  sent_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now()
);

-- Message Attachments
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES inbox_messages(id) ON DELETE CASCADE,

  type TEXT,  -- 'image', 'document', 'audio', 'video'
  filename TEXT,
  mime_type TEXT,
  size_bytes INT,

  storage_path TEXT,  -- Supabase Storage path
  url TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_partner_status ON conversations(partner_id, status);
CREATE INDEX idx_conversations_assigned ON conversations(assigned_to) WHERE assigned_to IS NOT NULL;
CREATE INDEX idx_conversations_last_message ON conversations(partner_id, last_message_at DESC);
CREATE INDEX idx_inbox_messages_conversation ON inbox_messages(conversation_id, created_at DESC);
CREATE INDEX idx_contacts_partner_identifiers ON contacts(partner_id, email, phone);
```

### Rate Management

```sql
-- ============================================================================
-- RATE MANAGEMENT
-- ============================================================================

-- Course Rates
CREATE TABLE course_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id),
  partner_id UUID REFERENCES partners(id),  -- NULL = global rate

  -- Season
  season TEXT NOT NULL,  -- 'high', 'low', 'shoulder'
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,

  -- Day Type
  day_type TEXT NOT NULL,  -- 'weekday', 'weekend', 'holiday'

  -- Rates
  green_fee DECIMAL(10,2) NOT NULL,
  caddie_fee DECIMAL(10,2),
  cart_fee DECIMAL(10,2),

  -- Partner Cost (if different from public rate)
  cost_green_fee DECIMAL(10,2),
  cost_caddie_fee DECIMAL(10,2),
  cost_cart_fee DECIMAL(10,2),

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Ensure no overlapping rates
  UNIQUE(course_id, partner_id, season, day_type, valid_from)
);

-- Transport Rates
CREATE TABLE transport_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),  -- NULL = global rate

  -- Vehicle
  vehicle_type TEXT NOT NULL,  -- 'sedan', 'suv', 'van', 'minibus'
  capacity INT NOT NULL,

  -- Route
  route_type TEXT NOT NULL,  -- 'airport_transfer', 'golf_transfer', 'full_day', 'half_day'
  origin_area TEXT,  -- 'bangkok', 'phuket', 'chiangmai'
  destination_area TEXT,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,
  price_per_km DECIMAL(10,2),
  price_per_hour DECIMAL(10,2),

  -- Cost
  cost_base DECIMAL(10,2),
  cost_per_km DECIMAL(10,2),
  cost_per_hour DECIMAL(10,2),

  -- Validity
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Usage & Billing

```sql
-- ============================================================================
-- USAGE & BILLING
-- ============================================================================

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id),

  -- Stripe
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,

  -- Plan
  tier TEXT NOT NULL,  -- 'starter', 'growth', 'enterprise'

  -- Period
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,

  -- Status
  status TEXT NOT NULL,  -- 'active', 'past_due', 'canceled', 'trialing'
  cancel_at_period_end BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Usage Records
CREATE TABLE usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id),

  -- Metric
  metric_type TEXT NOT NULL,  -- 'quote_created', 'booking_confirmed', 'ai_tokens', 'message_sent'
  quantity INT NOT NULL DEFAULT 1,

  -- AI Specific
  model TEXT,  -- 'claude-3-haiku', 'claude-sonnet-4'
  input_tokens INT,
  output_tokens INT,
  cost_usd DECIMAL(10,6),

  -- Context
  context TEXT,  -- 'quote_generation', 'chat', 'classification'
  reference_id UUID,  -- quote_id, conversation_id, etc.

  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id),

  -- Stripe
  stripe_invoice_id TEXT UNIQUE,

  -- Amounts
  subtotal DECIMAL(12,2),
  tax DECIMAL(12,2),
  total DECIMAL(12,2),
  currency TEXT DEFAULT 'THB',

  -- Status
  status TEXT NOT NULL,  -- 'draft', 'open', 'paid', 'void', 'uncollectible'

  -- Dates
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,

  -- PDF
  pdf_url TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_usage_records_partner ON usage_records(partner_id, recorded_at DESC);
CREATE INDEX idx_usage_records_metric ON usage_records(partner_id, metric_type, recorded_at);
```

### Audit & Security

```sql
-- ============================================================================
-- AUDIT & SECURITY
-- ============================================================================

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id),
  user_id UUID REFERENCES auth.users(id),

  -- Action
  action TEXT NOT NULL,  -- 'quote.created', 'client.updated', 'rate.changed'
  resource_type TEXT NOT NULL,
  resource_id UUID,

  -- Changes
  old_value JSONB,
  new_value JSONB,

  -- Context
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_partner ON audit_logs(partner_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
```

### RLS Policies

```sql
-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Helper Functions
CREATE OR REPLACE FUNCTION get_user_partner_id()
RETURNS UUID AS $$
  SELECT partner_id
  FROM partner_members
  WHERE user_id = auth.uid()
  AND status = 'active'
  LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'is_super_admin')::boolean,
    false
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION user_has_permission(required_permission TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM partner_members pm
    WHERE pm.user_id = auth.uid()
    AND pm.status = 'active'
    AND (
      pm.role = 'owner'
      OR pm.role = 'admin'
      OR pm.permissions @> jsonb_build_array(required_permission)
    )
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inbox_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Partner Policies
CREATE POLICY "Users can view their partner"
  ON partners FOR SELECT
  USING (
    is_super_admin()
    OR id = (SELECT get_user_partner_id())
  );

-- Client Policies
CREATE POLICY "Users can view their partner's clients"
  ON clients FOR SELECT
  USING (
    is_super_admin()
    OR partner_id = (SELECT get_user_partner_id())
  );

CREATE POLICY "Users can manage their partner's clients"
  ON clients FOR ALL
  USING (partner_id = (SELECT get_user_partner_id()));

-- Quote Policies
CREATE POLICY "Users can view their partner's quotes"
  ON quotes FOR SELECT
  USING (
    is_super_admin()
    OR partner_id = (SELECT get_user_partner_id())
  );

CREATE POLICY "Users can manage their partner's quotes"
  ON quotes FOR ALL
  USING (partner_id = (SELECT get_user_partner_id()));

-- Conversation Policies
CREATE POLICY "Users can view their partner's conversations"
  ON conversations FOR SELECT
  USING (
    is_super_admin()
    OR partner_id = (SELECT get_user_partner_id())
  );

CREATE POLICY "Users can manage their partner's conversations"
  ON conversations FOR ALL
  USING (partner_id = (SELECT get_user_partner_id()));

-- Similar policies for all other tables...
```

---

## 4. Implementation Phases

### Phase 0: Foundation Setup (Week 1)

**Goal:** Set up new tech stack without breaking existing functionality.

```
Tasks:
├── Install new dependencies (tRPC, Zustand, Trigger.dev, etc.)
├── Configure tRPC with Next.js App Router
├── Set up Zustand stores (alongside existing Context)
├── Configure Trigger.dev project
├── Add Sentry and PostHog
├── Create database migrations for multi-tenant schema
├── Run migrations on development database
└── Verify existing functionality still works
```

**Files to Create:**
```
src/
├── server/
│   ├── trpc.ts              # tRPC initialization
│   ├── context.ts           # Request context
│   └── routers/
│       └── index.ts         # Root router
├── stores/
│   ├── partner.ts           # Partner state
│   ├── inbox.ts             # Inbox state
│   └── quotes.ts            # Quotes state
├── trigger/
│   ├── client.ts            # Trigger.dev client
│   └── tasks/
│       └── index.ts         # Task exports
└── trpc/
    ├── client.tsx           # Client provider
    └── server.ts            # Server caller
```

### Phase 1: Office Foundation (Week 2-3)

**Goal:** Basic /office dashboard that Golf Okay can use.

```
Tasks:
├── Office layout with auth protection
├── Partner context and middleware
├── Dashboard with placeholder metrics
├── Basic navigation sidebar
├── Super admin identification
└── Golf Okay as Partner #0 seeding
```

**Routes:**
```
/office
├── /office/page.tsx              # Dashboard
├── /office/layout.tsx            # Auth check + layout
├── /office/quotes/page.tsx       # Quote list (placeholder)
├── /office/clients/page.tsx      # Client list (placeholder)
├── /office/inbox/page.tsx        # Inbox (placeholder)
└── /office/settings/page.tsx     # Settings (placeholder)
```

### Phase 2: Unified Inbox - Email (Week 4-5)

**Goal:** Email aggregation working for Golf Okay.

```
Tasks:
├── Set up email inbound webhook (Resend/Postmark)
├── Webhook endpoint with signature verification
├── Trigger.dev task for email processing
├── AI classification (intent, sentiment, priority)
├── AI draft response generation
├── Inbox UI with conversation list
├── Conversation detail view
├── Reply composition and sending
├── Assignment and status management
└── Real-time updates via Supabase
```

**Key Files:**
```
src/
├── app/api/webhooks/email/route.ts
├── trigger/tasks/process-email.ts
├── trigger/tasks/classify-message.ts
├── trigger/tasks/generate-draft.ts
├── server/routers/inbox.ts
├── components/office/
│   ├── InboxList.tsx
│   ├── ConversationView.tsx
│   ├── MessageComposer.tsx
│   └── InboxFilters.tsx
└── stores/inbox.ts
```

### Phase 3: Quote Engine (Week 6-7)

**Goal:** AI-powered quote creation.

```
Tasks:
├── Quote builder UI (reuse ItineraryBuilder patterns)
├── AI quote generation from conversation
├── Rate lookup and margin calculation
├── Quote preview and editing
├── PDF export (React PDF)
├── Email quote to client
├── Quote status tracking
├── Quote versioning
└── Link quotes to inbox conversations
```

**Key Files:**
```
src/
├── server/routers/quotes.ts
├── trigger/tasks/generate-quote.ts
├── trigger/tasks/send-quote-email.ts
├── components/office/
│   ├── QuoteBuilder.tsx
│   ├── QuotePreview.tsx
│   ├── QuoteItemEditor.tsx
│   └── QuotePDF.tsx
└── lib/quote-pdf.tsx
```

### Phase 4: Client CRM (Week 8)

**Goal:** Basic client management.

```
Tasks:
├── Client list with search and filters
├── Client detail view
├── Client creation and editing
├── Link clients to contacts (inbox)
├── Client activity timeline
├── Client preferences tracking
└── Client notes
```

### Phase 5: Rate Management (Week 9)

**Goal:** Manage course and transport rates.

```
Tasks:
├── Course rate editor
├── Transport rate editor
├── Season and validity management
├── Partner-specific vs global rates
├── Margin configuration
└── Rate import/export
```

### Phase 6: Billing Integration (Week 10)

**Goal:** Stripe integration for partner billing.

```
Tasks:
├── Stripe customer creation
├── Subscription management
├── Usage tracking and metering
├── Invoice generation
├── Billing portal integration
├── Usage alerts
└── Plan tier enforcement
```

### Phase 7: Polish & Launch (Week 11-12)

**Goal:** Production-ready for Golf Okay.

```
Tasks:
├── Error handling and edge cases
├── Performance optimization
├── Mobile responsiveness
├── Keyboard shortcuts
├── Help documentation
├── Onboarding flow
└── Analytics dashboards
```

---

## 5. Core Modules

### Module: tRPC Router Structure

```typescript
// src/server/routers/index.ts
import { router } from '../trpc';
import { partnerRouter } from './partner';
import { clientRouter } from './client';
import { quoteRouter } from './quote';
import { bookingRouter } from './booking';
import { inboxRouter } from './inbox';
import { rateRouter } from './rate';
import { analyticsRouter } from './analytics';

export const appRouter = router({
  partner: partnerRouter,
  client: clientRouter,
  quote: quoteRouter,
  booking: bookingRouter,
  inbox: inboxRouter,
  rate: rateRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
```

### Module: Zustand Stores

```typescript
// src/stores/inbox.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface InboxState {
  // Filters
  statusFilter: 'open' | 'pending' | 'resolved' | 'all';
  channelFilter: string | null;
  assigneeFilter: string | null;

  // Selection
  selectedConversationId: string | null;

  // Actions
  setStatusFilter: (status: InboxState['statusFilter']) => void;
  setChannelFilter: (channel: string | null) => void;
  selectConversation: (id: string | null) => void;
  reset: () => void;
}

export const useInboxStore = create<InboxState>()(
  persist(
    (set) => ({
      statusFilter: 'open',
      channelFilter: null,
      assigneeFilter: null,
      selectedConversationId: null,

      setStatusFilter: (status) => set({ statusFilter: status }),
      setChannelFilter: (channel) => set({ channelFilter: channel }),
      selectConversation: (id) => set({ selectedConversationId: id }),
      reset: () => set({
        statusFilter: 'open',
        channelFilter: null,
        assigneeFilter: null,
        selectedConversationId: null,
      }),
    }),
    { name: 'inbox-store' }
  )
);
```

### Module: Trigger.dev Tasks

```typescript
// src/trigger/tasks/process-email.ts
import { task, retry } from "@trigger.dev/sdk";
import { anthropic } from "@/lib/anthropic";
import { supabaseAdmin } from "@/lib/supabase-server";

export const processInboundEmail = task({
  id: "process-inbound-email",
  retry: {
    maxAttempts: 3,
    factor: 2,
    minTimeoutInMs: 1000,
    maxTimeoutInMs: 30000,
  },

  run: async (payload: {
    from: string;
    subject: string;
    body: string;
    threadId?: string;
    messageId: string;
    partnerId: string;
  }) => {
    const { from, subject, body, partnerId } = payload;

    // 1. Find or create contact
    let contact = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('partner_id', partnerId)
      .eq('email', from)
      .single();

    if (!contact.data) {
      const { data } = await supabaseAdmin
        .from('contacts')
        .insert({
          partner_id: partnerId,
          email: from,
          name: extractNameFromEmail(from),
        })
        .select()
        .single();
      contact = { data };
    }

    // 2. Find or create conversation
    let conversation = await supabaseAdmin
      .from('conversations')
      .select('*')
      .eq('contact_id', contact.data.id)
      .eq('external_thread_id', payload.threadId)
      .single();

    if (!conversation.data) {
      const channel = await supabaseAdmin
        .from('channels')
        .select('id')
        .eq('partner_id', partnerId)
        .eq('type', 'email')
        .single();

      const { data } = await supabaseAdmin
        .from('conversations')
        .insert({
          partner_id: partnerId,
          channel_id: channel.data.id,
          contact_id: contact.data.id,
          external_thread_id: payload.threadId,
          status: 'open',
        })
        .select()
        .single();
      conversation = { data };
    }

    // 3. Store message
    const { data: message } = await supabaseAdmin
      .from('inbox_messages')
      .insert({
        conversation_id: conversation.data.id,
        direction: 'inbound',
        sender_type: 'contact',
        sender_id: contact.data.id,
        content_type: 'text',
        content: body,
        external_message_id: payload.messageId,
      })
      .select()
      .single();

    // 4. Classify with AI
    const classification = await classifyMessage.trigger({
      messageId: message.id,
      content: body,
      subject,
    });

    // 5. Update conversation
    await supabaseAdmin
      .from('conversations')
      .update({
        intent: classification.intent,
        sentiment: classification.sentiment,
        priority: classification.priority,
        extracted_data: classification.extractedData,
        last_message_at: new Date().toISOString(),
      })
      .eq('id', conversation.data.id);

    // 6. Generate draft if appropriate
    if (classification.shouldGenerateDraft) {
      await generateDraft.trigger({
        conversationId: conversation.data.id,
        intent: classification.intent,
        context: classification.extractedData,
      });
    }

    // 7. Notify if urgent
    if (classification.priority === 'urgent') {
      await notifyTeam.trigger({
        conversationId: conversation.data.id,
        message: `Urgent: ${subject}`,
      });
    }

    return {
      conversationId: conversation.data.id,
      messageId: message.id,
      classification,
    };
  },
});

export const classifyMessage = task({
  id: "classify-message",
  retry: { maxAttempts: 2 },

  run: async (payload: {
    messageId: string;
    content: string;
    subject?: string;
  }) => {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      system: `You are a golf tour operator assistant. Classify incoming messages.

        Return JSON:
        {
          "intent": "inquiry" | "quote_request" | "booking_change" | "support" | "spam",
          "sentiment": "positive" | "neutral" | "negative",
          "priority": "urgent" | "high" | "normal" | "low",
          "extractedData": {
            "dates": string | null,
            "groupSize": number | null,
            "destination": string | null,
            "budget": string | null,
            "courses": string[] | null
          },
          "shouldGenerateDraft": boolean,
          "suggestedAction": string
        }`,
      messages: [{
        role: 'user',
        content: payload.subject
          ? `Subject: ${payload.subject}\n\n${payload.content}`
          : payload.content,
      }],
    });

    return JSON.parse(response.content[0].text);
  },
});

export const generateDraft = task({
  id: "generate-draft",
  retry: { maxAttempts: 2 },

  run: async (payload: {
    conversationId: string;
    intent: string;
    context: Record<string, unknown>;
  }) => {
    // Get conversation history
    const { data: messages } = await supabaseAdmin
      .from('inbox_messages')
      .select('*')
      .eq('conversation_id', payload.conversationId)
      .order('created_at', { ascending: true })
      .limit(10);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `You are a helpful golf tour operator assistant. Draft a professional response.

        Context:
        - Intent: ${payload.intent}
        - Extracted info: ${JSON.stringify(payload.context)}

        Guidelines:
        - Be friendly and professional
        - If it's an inquiry, ask clarifying questions
        - If it's a quote request, acknowledge and mention you'll prepare one
        - Include relevant golf course suggestions if appropriate
        - Sign off with the team name`,
      messages: messages.map(m => ({
        role: m.direction === 'inbound' ? 'user' : 'assistant',
        content: m.content,
      })),
    });

    const draftContent = response.content[0].text;

    // Store as draft
    await supabaseAdmin
      .from('inbox_messages')
      .insert({
        conversation_id: payload.conversationId,
        direction: 'outbound',
        sender_type: 'ai',
        content_type: 'text',
        content: draftContent,
        status: 'draft',
        ai_generated: true,
        ai_confidence: 0.85,
      });

    return { draft: draftContent };
  },
});
```

---

## 6. API Aggregator

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     API AGGREGATOR LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    CHANNEL ADAPTERS                      │   │
│  │                                                          │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │  Email   │  │ WhatsApp │  │   Line   │  │   Web    │ │   │
│  │  │ Adapter  │  │ Adapter  │  │ Adapter  │  │ Adapter  │ │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘ │   │
│  │       │             │             │             │        │   │
│  │       └─────────────┴──────┬──────┴─────────────┘        │   │
│  │                            ▼                             │   │
│  │              ┌─────────────────────────┐                 │   │
│  │              │   NORMALIZED MESSAGE    │                 │   │
│  │              │   {                     │                 │   │
│  │              │     channel,            │                 │   │
│  │              │     direction,          │                 │   │
│  │              │     from,               │                 │   │
│  │              │     content,            │                 │   │
│  │              │     timestamp           │                 │   │
│  │              │   }                     │                 │   │
│  │              └───────────┬─────────────┘                 │   │
│  └──────────────────────────┼───────────────────────────────┘   │
│                             ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                  PROCESSING PIPELINE                     │   │
│  │                                                          │   │
│  │  Store → Classify → Route → [Auto-respond | Queue | AI] │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Channel Adapter Interface

```typescript
// src/lib/channels/types.ts
export interface ChannelAdapter {
  type: ChannelType;

  // Webhook handling
  verifyWebhook(request: Request): Promise<boolean>;
  parseInbound(request: Request): Promise<NormalizedMessage>;

  // Outbound
  send(message: OutboundMessage): Promise<SendResult>;

  // Status
  getStatus(messageId: string): Promise<MessageStatus>;
}

export interface NormalizedMessage {
  channel: ChannelType;
  externalId: string;
  externalThreadId?: string;

  from: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };

  content: {
    type: 'text' | 'image' | 'document' | 'audio' | 'location';
    text?: string;
    mediaUrl?: string;
    mimeType?: string;
    location?: { lat: number; lng: number };
  };

  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface OutboundMessage {
  conversationId: string;
  to: string;
  content: {
    type: 'text' | 'image' | 'document';
    text?: string;
    mediaUrl?: string;
  };
}

export type ChannelType = 'email' | 'whatsapp' | 'line' | 'messenger' | 'web';
```

### Email Adapter Implementation

```typescript
// src/lib/channels/email.ts
import { Resend } from 'resend';
import { ChannelAdapter, NormalizedMessage, OutboundMessage } from './types';
import crypto from 'crypto';

export class EmailAdapter implements ChannelAdapter {
  type = 'email' as const;
  private resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async verifyWebhook(request: Request): Promise<boolean> {
    const signature = request.headers.get('svix-signature');
    const timestamp = request.headers.get('svix-timestamp');
    const body = await request.text();

    // Verify Resend webhook signature
    const secret = process.env.RESEND_WEBHOOK_SECRET!;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${timestamp}.${body}`)
      .digest('base64');

    return signature === expectedSignature;
  }

  async parseInbound(request: Request): Promise<NormalizedMessage> {
    const payload = await request.json();

    return {
      channel: 'email',
      externalId: payload.messageId,
      externalThreadId: payload.threadId,
      from: {
        id: payload.from,
        email: payload.from,
        name: payload.fromName,
      },
      content: {
        type: 'text',
        text: payload.text || payload.html,
      },
      timestamp: new Date(payload.timestamp),
      metadata: {
        subject: payload.subject,
        cc: payload.cc,
        attachments: payload.attachments,
      },
    };
  }

  async send(message: OutboundMessage): Promise<SendResult> {
    const conversation = await getConversation(message.conversationId);

    const result = await this.resend.emails.send({
      from: 'Golf Okay <hello@golfokay.co>',
      to: message.to,
      subject: conversation.subject || 'Re: Your inquiry',
      text: message.content.text,
      headers: {
        'In-Reply-To': conversation.externalThreadId,
        'References': conversation.externalThreadId,
      },
    });

    return {
      success: true,
      externalId: result.id,
    };
  }
}
```

### Webhook Endpoint

```typescript
// src/app/api/webhooks/email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { EmailAdapter } from '@/lib/channels/email';
import { processInboundEmail } from '@/trigger/tasks/process-email';

const emailAdapter = new EmailAdapter(process.env.RESEND_API_KEY!);

export async function POST(request: NextRequest) {
  // Verify webhook
  const isValid = await emailAdapter.verifyWebhook(request.clone());
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Parse message
  const message = await emailAdapter.parseInbound(request);

  // Determine partner from recipient email
  const partnerId = await getPartnerFromEmail(message.metadata?.to);
  if (!partnerId) {
    return NextResponse.json({ error: 'Unknown recipient' }, { status: 400 });
  }

  // Trigger async processing
  await processInboundEmail.trigger({
    from: message.from.email!,
    subject: message.metadata?.subject,
    body: message.content.text!,
    threadId: message.externalThreadId,
    messageId: message.externalId,
    partnerId,
  });

  return NextResponse.json({ received: true });
}
```

---

## 7. Code Patterns

### tRPC Procedure with Tenant Middleware

```typescript
// src/server/trpc.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { type Context } from './context';
import superjson from 'superjson';

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Auth middleware
const isAuthed = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

// Partner middleware (tenant isolation)
const hasPartner = t.middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  const { data: membership } = await ctx.supabase
    .from('partner_members')
    .select('partner_id, role, permissions')
    .eq('user_id', ctx.user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'No active partner membership',
    });
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

// Permission middleware
const hasPermission = (resource: string, action: string) => {
  return t.middleware(async ({ ctx, next }) => {
    const { role, permissions } = ctx;

    if (role === 'owner' || role === 'admin') {
      return next();
    }

    const allowed = permissions?.[resource]?.includes(action);
    if (!allowed) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Missing permission: ${resource}.${action}`,
      });
    }

    return next();
  });
};

export const protectedProcedure = t.procedure.use(isAuthed).use(hasPartner);

export const adminProcedure = t.procedure
  .use(isAuthed)
  .use(hasPartner)
  .use(hasPermission('*', '*'));
```

### Zustand Store with Persistence

```typescript
// src/stores/quotes.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface QuoteFilters {
  status: 'all' | 'draft' | 'sent' | 'accepted' | 'expired';
  clientId: string | null;
  dateRange: { start: Date; end: Date } | null;
}

interface QuoteState {
  // Filters
  filters: QuoteFilters;

  // Draft in progress
  draftQuote: Partial<Quote> | null;

  // Actions
  setFilter: <K extends keyof QuoteFilters>(key: K, value: QuoteFilters[K]) => void;
  resetFilters: () => void;
  setDraftQuote: (quote: Partial<Quote> | null) => void;
  updateDraftQuote: (updates: Partial<Quote>) => void;
}

const defaultFilters: QuoteFilters = {
  status: 'all',
  clientId: null,
  dateRange: null,
};

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      draftQuote: null,

      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      resetFilters: () => set({ filters: defaultFilters }),

      setDraftQuote: (quote) => set({ draftQuote: quote }),

      updateDraftQuote: (updates) =>
        set((state) => ({
          draftQuote: state.draftQuote
            ? { ...state.draftQuote, ...updates }
            : updates,
        })),
    }),
    {
      name: 'quote-store',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ filters: state.filters }),
    }
  )
);
```

### React Query with tRPC

```typescript
// src/components/office/QuoteList.tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTRPC } from '@/trpc/client';
import { useQuoteStore } from '@/stores/quotes';

export function QuoteList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { filters, setFilter } = useQuoteStore();

  // Query quotes
  const quotes = useQuery(
    trpc.quote.list.queryOptions({
      status: filters.status === 'all' ? undefined : filters.status,
      clientId: filters.clientId ?? undefined,
      limit: 50,
    })
  );

  // Mutation for status update
  const updateStatus = useMutation(
    trpc.quote.updateStatus.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['quote', 'list'] });
      },
    })
  );

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['all', 'draft', 'sent', 'accepted', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter('status', status as QuoteFilters['status'])}
            className={filters.status === status ? 'bg-orange-500' : 'bg-gray-700'}
          >
            {status}
          </button>
        ))}
      </div>

      {/* List */}
      {quotes.isLoading ? (
        <LoadingSkeleton />
      ) : (
        <div className="space-y-2">
          {quotes.data?.map((quote) => (
            <QuoteRow
              key={quote.id}
              quote={quote}
              onStatusChange={(status) =>
                updateStatus.mutate({ quoteId: quote.id, status })
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

### Server Component with tRPC Prefetch

```typescript
// src/app/office/quotes/page.tsx
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { getQueryClient, trpc } from '@/trpc/server';
import { QuoteList } from '@/components/office/QuoteList';

export default async function QuotesPage() {
  const queryClient = getQueryClient();

  // Prefetch quotes on server
  await queryClient.prefetchQuery(
    trpc.quote.list.queryOptions({ limit: 50 })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Quotes</h1>
        <QuoteList />
      </div>
    </HydrationBoundary>
  );
}
```

---

## 8. Security & Multi-Tenancy

### Middleware for Office Routes

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Protect /office routes
  if (request.nextUrl.pathname.startsWith('/office')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login?redirect=/office', request.url));
    }

    // Check partner membership
    const { data: membership } = await supabase
      .from('partner_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!membership) {
      return NextResponse.redirect(new URL('/no-access', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/office/:path*'],
};
```

### API Key Encryption

```typescript
// src/lib/encryption.ts
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, KEY, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}
```

---

## 9. Observability

### Sentry Configuration

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: 0.1,

  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    Sentry.replayIntegration(),
  ],

  beforeSend(event) {
    // Scrub sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }
    return event;
  },
});
```

### PostHog Setup

```typescript
// src/providers/analytics.tsx
'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false,
      persistence: 'localStorage',
    });
  }, []);

  useEffect(() => {
    if (user) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.user_metadata?.name,
      });
    }
  }, [user]);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
```

### Usage Tracking

```typescript
// src/lib/usage.ts
import { supabaseAdmin } from './supabase-server';

export async function trackUsage(params: {
  partnerId: string;
  metricType: 'quote_created' | 'booking_confirmed' | 'ai_tokens' | 'message_sent';
  quantity?: number;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  context?: string;
  referenceId?: string;
}) {
  const costUsd = params.inputTokens && params.outputTokens
    ? calculateAICost(params.model!, params.inputTokens, params.outputTokens)
    : null;

  await supabaseAdmin.from('usage_records').insert({
    partner_id: params.partnerId,
    metric_type: params.metricType,
    quantity: params.quantity ?? 1,
    model: params.model,
    input_tokens: params.inputTokens,
    output_tokens: params.outputTokens,
    cost_usd: costUsd,
    context: params.context,
    reference_id: params.referenceId,
  });
}

function calculateAICost(model: string, inputTokens: number, outputTokens: number): number {
  const rates: Record<string, { input: number; output: number }> = {
    'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
    'claude-sonnet-4-20250514': { input: 0.003, output: 0.015 },
  };

  const rate = rates[model] ?? rates['claude-3-haiku-20240307'];
  return (inputTokens / 1000) * rate.input + (outputTokens / 1000) * rate.output;
}
```

---

## 10. Testing Strategy

### Unit Test Example (Vitest)

```typescript
// src/lib/__tests__/pricing.test.ts
import { describe, it, expect } from 'vitest';
import { calculateQuoteTotal, applyGroupDiscount } from '../pricing';

describe('calculateQuoteTotal', () => {
  it('calculates total correctly', () => {
    const items = [
      { unitPrice: 1000, quantity: 2 },
      { unitPrice: 500, quantity: 4 },
    ];

    expect(calculateQuoteTotal(items)).toBe(4000);
  });

  it('applies discount', () => {
    const items = [{ unitPrice: 1000, quantity: 1 }];

    expect(calculateQuoteTotal(items, { discount: 100 })).toBe(900);
  });
});

describe('applyGroupDiscount', () => {
  it('applies 10% for 8+ golfers', () => {
    expect(applyGroupDiscount(10000, 8)).toBe(9000);
  });

  it('applies 15% for 12+ golfers', () => {
    expect(applyGroupDiscount(10000, 12)).toBe(8500);
  });

  it('no discount under 8 golfers', () => {
    expect(applyGroupDiscount(10000, 6)).toBe(10000);
  });
});
```

### Integration Test Example

```typescript
// src/server/routers/__tests__/quote.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestContext } from '@/test/utils';
import { appRouter } from '../index';

describe('quote router', () => {
  let ctx: Awaited<ReturnType<typeof createTestContext>>;

  beforeAll(async () => {
    ctx = await createTestContext({ partnerId: 'test-partner' });
  });

  afterAll(async () => {
    await ctx.cleanup();
  });

  it('creates a quote', async () => {
    const caller = appRouter.createCaller(ctx);

    const quote = await caller.quote.create({
      clientId: ctx.testClient.id,
      title: 'Test Quote',
      items: [
        {
          itemType: 'golf',
          name: 'Blue Canyon',
          quantity: 4,
          unitPrice: 3500,
        },
      ],
    });

    expect(quote.id).toBeDefined();
    expect(quote.total).toBe(14000);
    expect(quote.status).toBe('draft');
  });

  it('cannot access other partner quotes', async () => {
    const otherCtx = await createTestContext({ partnerId: 'other-partner' });
    const caller = appRouter.createCaller(otherCtx);

    await expect(
      caller.quote.get({ id: ctx.testQuote.id })
    ).rejects.toThrow('NOT_FOUND');

    await otherCtx.cleanup();
  });
});
```

### E2E Test Example (Playwright)

```typescript
// tests/office/quote-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Quote Creation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/office');
    // Login helper
    await loginAsPartner(page, 'test@golfokay.co');
  });

  test('creates a quote from inbox conversation', async ({ page }) => {
    // Navigate to inbox
    await page.click('[data-testid="nav-inbox"]');

    // Select a conversation
    await page.click('[data-testid="conversation-row"]:first-child');

    // Click create quote
    await page.click('[data-testid="create-quote-btn"]');

    // Fill quote details
    await page.fill('[data-testid="quote-title"]', 'Phuket Golf Trip');

    // Add item
    await page.click('[data-testid="add-item-btn"]');
    await page.selectOption('[data-testid="item-type"]', 'golf');
    await page.fill('[data-testid="item-name"]', 'Blue Canyon Country Club');
    await page.fill('[data-testid="item-quantity"]', '4');
    await page.fill('[data-testid="item-price"]', '3500');

    // Save quote
    await page.click('[data-testid="save-quote-btn"]');

    // Verify
    await expect(page.locator('[data-testid="quote-total"]')).toContainText('14,000');
    await expect(page.locator('[data-testid="quote-status"]')).toContainText('Draft');
  });
});
```

---

## 11. Migration Path

### Week-by-Week Execution

```
WEEK 1: Foundation
────────────────────
□ Install dependencies
□ Configure tRPC
□ Set up Zustand (parallel to Context)
□ Configure Trigger.dev
□ Add Sentry + PostHog
□ Create migrations

WEEK 2-3: Office Foundation
────────────────────────────
□ /office layout + auth
□ Partner context + middleware
□ Dashboard skeleton
□ Sidebar navigation
□ Golf Okay seeded as Partner #0

WEEK 4-5: Unified Inbox (Email)
────────────────────────────────
□ Email webhook endpoint
□ Trigger.dev email processing
□ AI classification
□ AI draft generation
□ Inbox UI
□ Conversation view
□ Reply sending

WEEK 6-7: Quote Engine
───────────────────────
□ Quote builder UI
□ AI quote generation
□ Rate lookup
□ PDF export
□ Email to client
□ Quote versioning

WEEK 8: Client CRM
───────────────────
□ Client list + detail
□ Link to contacts
□ Activity timeline
□ Preferences

WEEK 9: Rate Management
────────────────────────
□ Course rate editor
□ Transport rate editor
□ Season management

WEEK 10: Billing
─────────────────
□ Stripe integration
□ Subscription management
□ Usage tracking
□ Plan enforcement

WEEK 11-12: Polish
───────────────────
□ Error handling
□ Performance optimization
□ Mobile responsive
□ Help docs
□ Launch checklist
```

---

## File Structure

```
src/
├── app/
│   ├── (customer)/              # Existing customer routes
│   │   ├── page.tsx
│   │   └── ...
│   ├── (office)/                # Partner dashboard
│   │   ├── office/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx         # Dashboard
│   │   │   ├── inbox/
│   │   │   │   └── page.tsx
│   │   │   ├── quotes/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── rates/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   ├── (portal)/                # Client portal
│   │   └── trips/
│   │       └── [token]/page.tsx
│   ├── api/
│   │   ├── trpc/
│   │   │   └── [trpc]/route.ts
│   │   └── webhooks/
│   │       ├── email/route.ts
│   │       ├── whatsapp/route.ts
│   │       └── stripe/route.ts
│   └── ...
├── server/
│   ├── trpc.ts                  # tRPC init
│   ├── context.ts               # Request context
│   └── routers/
│       ├── index.ts
│       ├── partner.ts
│       ├── client.ts
│       ├── quote.ts
│       ├── booking.ts
│       ├── inbox.ts
│       ├── rate.ts
│       └── analytics.ts
├── stores/
│   ├── partner.ts
│   ├── inbox.ts
│   └── quotes.ts
├── trigger/
│   ├── client.ts
│   └── tasks/
│       ├── process-email.ts
│       ├── classify-message.ts
│       ├── generate-draft.ts
│       ├── generate-quote.ts
│       ├── send-quote-email.ts
│       └── track-usage.ts
├── trpc/
│   ├── client.tsx
│   └── server.ts
├── lib/
│   ├── channels/
│   │   ├── types.ts
│   │   ├── email.ts
│   │   ├── whatsapp.ts
│   │   └── line.ts
│   ├── encryption.ts
│   ├── usage.ts
│   └── ...
├── components/
│   ├── office/
│   │   ├── OfficeLayout.tsx
│   │   ├── OfficeSidebar.tsx
│   │   ├── InboxList.tsx
│   │   ├── ConversationView.tsx
│   │   ├── QuoteBuilder.tsx
│   │   ├── QuotePreview.tsx
│   │   ├── ClientList.tsx
│   │   └── ...
│   └── ...
└── ...

supabase/
├── migrations/
│   ├── 20241201000001_memory_system.sql
│   ├── 20241205000001_multi_tenant.sql
│   ├── 20241205000002_unified_inbox.sql
│   ├── 20241205000003_quotes_bookings.sql
│   ├── 20241205000004_rates.sql
│   ├── 20241205000005_billing.sql
│   └── 20241205000006_rls_policies.sql
└── ...
```

---

## Environment Variables

```env
# Existing
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
RESEND_API_KEY=re_...

# New for Phase 7
TRIGGER_API_KEY=tr_...
TRIGGER_API_URL=https://api.trigger.dev
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
SENTRY_DSN=https://...@sentry.io/...
ENCRYPTION_KEY=... # 32-byte hex key for API key encryption
RESEND_WEBHOOK_SECRET=...
```

---

## Success Criteria

### Phase 1 Complete When:
- [ ] Golf Okay team can log into /office
- [ ] Dashboard shows placeholder metrics
- [ ] Navigation works between sections

### Phase 2 Complete When:
- [ ] Emails to inquiries@golfokay.co appear in inbox
- [ ] AI classifies intent and priority
- [ ] AI drafts are generated
- [ ] Team can reply from inbox
- [ ] Replies are sent via email

### Phase 3 Complete When:
- [ ] Quotes can be created from inbox conversations
- [ ] AI generates quote from conversation context
- [ ] PDFs can be exported
- [ ] Quotes can be emailed to clients

### MVP Complete When:
- [ ] Golf Okay operates entirely from /office for 2 weeks
- [ ] No critical bugs
- [ ] Response time < 1 second for all operations
- [ ] AI assistance saves measurable time

---

## References

- [tRPC Documentation](https://trpc.io/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Trigger.dev Documentation](https://trigger.dev/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Billing Integration](https://stripe.com/docs/billing)
- [PostHog Next.js Guide](https://posthog.com/docs/libraries/next-js)

---

*This document is the single source of truth for Orby OS implementation. Update as decisions are made.*
