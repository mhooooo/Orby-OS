# Admin Portal Setup Guide

## Phase 7 - Admin MVP

The admin portal provides B2B operators with tools to manage courses, transport rates, clients, and quotes.

---

## Authentication & Access Control

### Admin Whitelist

Access is controlled via email whitelist in environment variables:

```bash
# .env.local
ADMIN_EMAILS=admin@golfokay.co,operations@golfokay.co
```

**How it works:**
1. User must be authenticated (Google OAuth via Supabase)
2. User email must be in `ADMIN_EMAILS` comma-separated list
3. If not authenticated or not whitelisted, redirects to `/` (main site)

**Security:**
- Server-side check in `/admin/layout.tsx`
- Uses `createServerClient` from `@supabase/ssr` for session verification
- No client-side bypass possible

---

## File Structure

```
src/
├── app/admin/
│   ├── layout.tsx              # Auth guard + admin shell
│   ├── page.tsx                # Dashboard with metrics
│   ├── courses/page.tsx        # Course management (placeholder)
│   ├── transport/page.tsx      # Transport rates (placeholder)
│   ├── clients/page.tsx        # Client management (placeholder)
│   ├── quotes/page.tsx         # Quotes (placeholder)
│   └── bookings/page.tsx       # Bookings (placeholder)
└── components/admin/
    ├── AdminSidebar.tsx        # Navigation sidebar
    └── AdminHeader.tsx         # Top header with user info
```

---

## Design System

Follows existing Golf Okay design tokens from `CLAUDE.md`:

**Colors:**
- Background: `#131314`
- Cards/Sidebar: `#1E1F20`
- Hover: `#282A2C`
- Accent Orange: `#FF6B35`
- Accent Cyan: `#00D4FF`
- Accent Purple: `#A855F7`

**Components:**
- Rounded corners: `rounded-2xl` (cards), `rounded-xl` (buttons)
- Active state: Orange accent with left border
- Glassmorphism: `bg-white/5` with `border-white/5`

---

## Navigation

**Sidebar Items:**
- Dashboard (`/admin`)
- Courses (`/admin/courses`)
- Transport (`/admin/transport`)
- Clients (`/admin/clients`)
- Quotes (`/admin/quotes`)
- Bookings (`/admin/bookings`)

**Active State:**
- Orange background (`bg-[#FF6B35]/10`)
- Orange text
- Left border accent

---

## Dashboard Metrics

Current metrics (placeholder data until Phase 7 tables exist):
- **Pending Quotes** - Drafts awaiting client response
- **This Month Revenue** - From confirmed quotes
- **Active Clients** - B2B partners
- **Pending Inquiries** - From website

Data fetched from:
- `quotes` table (filters: `status = 'draft'`)
- `clients` table (all rows)
- `inquiries` table (filters: `status = 'pending'`)

**Graceful Degradation:**
- If tables don't exist, shows `0` instead of erroring
- Try-catch around each query

---

## Quick Actions

Dashboard includes quick action cards:
1. **Create New Quote** → `/admin/quotes/new`
2. **Import Course Rates** → `/admin/courses/import`

Both are placeholders for Phase 7 implementation.

---

## Development

**Local Testing:**

1. Add your email to whitelist:
   ```bash
   # .env.local
   ADMIN_EMAILS=your-email@example.com
   ```

2. Start dev server:
   ```bash
   npm run dev
   ```

3. Sign in with Google (same email as whitelist)

4. Navigate to `/admin`

**Production Deployment:**

1. Set `ADMIN_EMAILS` in Vercel environment variables
2. Deploy as usual (`git push` → auto-deploy)

---

## Next Steps (Phase 7 Implementation)

### 1. Course Management
- CRUD for courses table
- CSV import for bulk rate updates
- Seasonal pricing editor

### 2. Transport Rates
- Vehicle type configuration
- Route-based pricing
- Peak season multipliers

### 3. Client Management
- B2B partner profiles
- Commission structures
- Preferred courses/suppliers

### 4. Quote Builder
- Multi-course itinerary builder
- Dynamic pricing calculator
- PDF export
- Email to client

### 5. Bookings
- Confirmed quote → booking conversion
- Payment tracking
- Supplier coordination

---

## Tech Stack

**Frontend:**
- Next.js 16 (App Router)
- React 19
- Tailwind CSS v4
- lucide-react (icons)

**Backend:**
- Supabase (auth + database)
- `@supabase/ssr` for server-side auth
- Service role key for admin operations

**Auth:**
- Google OAuth via Supabase
- Email whitelist for admin access
- Server-side session verification

---

## Environment Variables

```bash
# Required for admin portal
ADMIN_EMAILS=admin@golfokay.co,ops@golfokay.co

# Supabase (already required for main app)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

---

## Known Limitations

1. **No Role-Based Access Control (RBAC)**
   - Currently binary: admin or not admin
   - Future: Implement roles (admin, operator, viewer)

2. **No Audit Logs**
   - No tracking of who changed what
   - Future: Add `admin_audit_log` table

3. **No Multi-Tenancy**
   - Single organization only
   - Future: Add `organization_id` if needed

4. **Email-Only Whitelist**
   - No UI for managing admin users
   - Must update env vars manually
   - Future: Add admin user management page

---

## Testing

**Manual Test Checklist:**

- [ ] Non-admin user redirected to `/`
- [ ] Admin user can access dashboard
- [ ] Sidebar navigation works
- [ ] Active state highlights current page
- [ ] Metrics load without errors (even if tables don't exist)
- [ ] User info displays in header
- [ ] "Back to Main Site" link works

**Automated Tests (Future):**
```typescript
// tests/audit/sprint-phase7-admin.spec.ts
test('admin portal requires authentication', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL('/'); // Redirected
});

test('non-admin user cannot access admin portal', async ({ page }) => {
  // Sign in as non-admin
  // Attempt to visit /admin
  // Assert redirected to /
});

test('admin user sees dashboard', async ({ page }) => {
  // Sign in as admin
  await page.goto('/admin');
  await expect(page.locator('h1')).toContainText('Dashboard');
});
```

---

## Troubleshooting

**Issue: Redirected to `/` even though I'm an admin**

1. Check email matches exactly (case-insensitive comparison)
2. Verify `ADMIN_EMAILS` env var is set
3. Check server logs for auth errors
4. Clear cookies and sign in again

**Issue: Build errors with `@supabase/ssr`**

- Ensure `@supabase/ssr` version is `^0.8.0` or higher
- Check `cookies()` import from `next/headers`
- Verify Next.js version is 16.x

**Issue: Dashboard shows errors**

- Check Supabase tables exist (`quotes`, `clients`, `inquiries`)
- If tables don't exist yet, dashboard shows `0` (graceful degradation)
- Check service role key is set for RLS bypass

---

## Migration Notes

**From Prototype to MVP:**

The admin shell is designed to be extended incrementally:

1. **Phase 7.1** - Dashboard + Shell (DONE)
2. **Phase 7.2** - Course Management + CSV Import
3. **Phase 7.3** - Transport Rates Configuration
4. **Phase 7.4** - Client Management
5. **Phase 7.5** - Quote Builder
6. **Phase 7.6** - Bookings Management

Each phase adds a single functional area without breaking existing features.

**Database Schema Required:**

```sql
-- Admin-specific tables (to be created in Phase 7.2+)
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  organization TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id),
  status TEXT DEFAULT 'draft',
  total_amount DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- inquiries table already exists from Phase 5
```
