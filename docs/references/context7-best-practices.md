# Context7 Best Practices Reference - Phase 7 Admin MVP

## Next.js App Router - Layouts, Middleware, Route Handlers

### Layout Pattern
```typescript
// app/admin/layout.tsx - Server Component layout
import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1">{children}</main>
    </div>
  )
}
```

### Middleware for Auth Guard
```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check admin access
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Auth check logic here
    const isAuthorized = checkAdminAuth(request)
    if (!isAuthorized) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
```

### Route Handlers (API Routes)
```typescript
// app/api/admin/[resource]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  return NextResponse.json({ data: [] })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  return NextResponse.json({ success: true }, { status: 201 })
}

// Dynamic route with params (Next.js 16 - params are Promises!)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return NextResponse.json({ id })
}
```

### Server vs Client Components
- **Server Components** (default): Access DB directly, no browser APIs
- **Client Components**: Use `'use client'` directive, can use useState/useEffect

---

## Supabase PostgreSQL Migrations

### Table Creation with Foreign Keys
```sql
-- supabase/migrations/XXX_create_tables.sql

-- Create clients table
create table clients (
  id bigint primary key generated always as identity,
  company_name text not null,
  contact_name text,
  email text,
  phone text,
  country text,
  client_type text check (client_type in ('B2B', 'B2C', 'Agent')),
  markup_percentage decimal(5,2) default 15.00,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create course_rates with foreign key
create table course_rates (
  id bigint primary key generated always as identity,
  course_id bigint not null references courses(id) on delete cascade,
  rate_type text not null,
  net_rate decimal(10,2),
  rack_rate decimal(10,2),
  valid_from date,
  valid_to date,
  day_type text check (day_type in ('weekday', 'weekend', 'holiday')),
  season text,
  includes_caddie boolean default false,
  includes_cart boolean default false,
  created_at timestamptz default now()
);

-- Create indexes for performance
create index idx_course_rates_course_id on course_rates(course_id);
create index idx_course_rates_valid_dates on course_rates(valid_from, valid_to);
```

### Expand Existing Table
```sql
-- Add columns to existing courses table
alter table courses
add column if not exists contact_email text,
add column if not exists contact_phone text,
add column if not exists booking_email text,
add column if not exists commission_rate decimal(5,2),
add column if not exists internal_notes text;
```

---

## Fast-CSV Parsing (TypeScript)

### Parse CSV File with Headers
```typescript
import * as fs from 'fs'
import { parse } from '@fast-csv/parse'

interface CourseRow {
  name: string
  region: string
  green_fee: string
  // ... other fields
}

const rows: CourseRow[] = []

fs.createReadStream('courses.csv')
  .pipe(parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', (row: CourseRow) => rows.push(row))
  .on('end', (rowCount: number) => {
    console.log(`Parsed ${rowCount} rows`)
    // Process rows...
  })
```

### Parse CSV String (for API upload)
```typescript
import { parseString } from '@fast-csv/parse'

export async function parseCSVString<T>(
  csvContent: string,
  options = { headers: true }
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const rows: T[] = []

    parseString(csvContent, options)
      .on('error', reject)
      .on('data', (row: T) => rows.push(row))
      .on('end', () => resolve(rows))
  })
}
```

### Transform During Parse
```typescript
import { parse } from '@fast-csv/parse'

type RawRow = { price: string; name: string }
type TransformedRow = { price: number; name: string }

const stream = parse<RawRow, TransformedRow>({ headers: true })
  .transform((data: RawRow): TransformedRow => ({
    name: data.name.trim(),
    price: parseFloat(data.price) || 0,
  }))
  .on('data', (row: TransformedRow) => console.log(row))
```

---

## Material React Table (Data Tables)

### Basic Table Setup
```tsx
import {
  MaterialReactTable,
  useMaterialReactTable,
  type MRT_ColumnDef,
} from 'material-react-table'
import { useMemo } from 'react'

type Course = {
  id: string
  name: string
  region: string
  green_fee: number
}

export default function CoursesTable({ data }: { data: Course[] }) {
  const columns = useMemo<MRT_ColumnDef<Course>[]>(
    () => [
      { accessorKey: 'name', header: 'Course Name' },
      { accessorKey: 'region', header: 'Region', filterVariant: 'select' },
      {
        accessorKey: 'green_fee',
        header: 'Green Fee',
        Cell: ({ cell }) => `฿${cell.getValue<number>().toLocaleString()}`,
        filterFn: 'betweenInclusive',
      },
    ],
    []
  )

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnFilters: true,
    enableSorting: true,
    enablePagination: true,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 25 },
    },
  })

  return <MaterialReactTable table={table} />
}
```

### Server-Side Pagination/Sorting
```tsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 })
const [sorting, setSorting] = useState([])

const table = useMaterialReactTable({
  columns,
  data,
  manualPagination: true,
  manualSorting: true,
  rowCount: totalRows, // From API
  state: { pagination, sorting },
  onPaginationChange: setPagination,
  onSortingChange: setSorting,
})
```

### Row Actions
```tsx
const table = useMaterialReactTable({
  columns,
  data,
  enableRowActions: true,
  positionActionsColumn: 'last',
  renderRowActions: ({ row }) => (
    <div className="flex gap-2">
      <button onClick={() => handleEdit(row.original)}>Edit</button>
      <button onClick={() => handleDelete(row.original.id)}>Delete</button>
    </div>
  ),
})
```

---

## Key Patterns for Admin MVP

### Service Role Client (Bypass RLS)
```typescript
// src/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
```

### Admin Email Whitelist Check
```typescript
// src/lib/admin-auth.ts
export function isAdminEmail(email: string): boolean {
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || []
  return adminEmails.includes(email.toLowerCase())
}
```

### Reusable DataTable Component
```tsx
// src/components/admin/DataTable.tsx
'use client'

import { MaterialReactTable, useMaterialReactTable, MRT_ColumnDef } from 'material-react-table'

interface DataTableProps<T extends Record<string, unknown>> {
  columns: MRT_ColumnDef<T>[]
  data: T[]
  isLoading?: boolean
  onRowClick?: (row: T) => void
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  isLoading,
  onRowClick,
}: DataTableProps<T>) {
  const table = useMaterialReactTable({
    columns,
    data,
    state: { isLoading },
    enableColumnFilters: true,
    enableSorting: true,
    enablePagination: true,
    muiTableBodyRowProps: onRowClick
      ? ({ row }) => ({
          onClick: () => onRowClick(row.original),
          sx: { cursor: 'pointer' },
        })
      : undefined,
  })

  return <MaterialReactTable table={table} />
}
```
