# Next.js App Router Patterns

## Server vs Client Components

### Server Components (Default)
```typescript
// app/posts/page.tsx - Server Component by default
export default async function PostsPage() {
  // Can access databases, APIs, environment variables directly
  const posts = await fetch('https://api.example.com/posts').then(r => r.json());

  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

**When to use Server Components:**
- Fetching data from databases or APIs
- Keeping sensitive information server-side
- Using large dependencies only on server
- Writing inline database queries

### Client Components
```typescript
'use client';

import { useState, useEffect } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

**When to use Client Components:**
- Interactive features (forms, buttons)
- Browser APIs (localStorage, geolocation)
- React hooks (useState, useContext, useEffect)
- Event handlers

### Composition Pattern (Recommended)
```typescript
// app/products/page.tsx (Server Component)
import ProductFilter from './product-filter';

export default async function ProductsPage() {
  const products = await fetchProducts(); // Server-side fetch

  return (
    <div>
      <h1>Products</h1>
      <ProductFilter products={products} /> {/* Pass data to client */}
    </div>
  );
}
```

```typescript
// app/products/product-filter.tsx (Client Component)
'use client';

import { useState } from 'react';

export default function ProductFilter({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState('');

  const filtered = products.filter(p => p.name.includes(filter));

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Search products..."
      />
      <ul>
        {filtered.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

### Interleaving Pattern (Children Prop)
```typescript
// app/ui/modal.tsx (Client Component)
'use client'

export default function Modal({ children }: { children: React.ReactNode }) {
  return <div className="modal">{children}</div>
}

// app/page.tsx (Server Component)
import Modal from './ui/modal'
import Cart from './ui/cart' // Server Component

export default function Page() {
  return (
    <Modal>
      <Cart /> {/* Server Component nested in Client Component */}
    </Modal>
  )
}
```

## Route Handlers

### Next.js 16: Route Params are Promises
```typescript
// app/api/courses/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await in Next.js 16

  const course = await getCourse(id);
  return Response.json(course);
}
```

## Server Actions

```typescript
// app/actions.ts
'use server';

export async function submitForm(formData: FormData) {
  const email = formData.get('email');
  await db.users.create({ email });
  return { success: true };
}

// app/components/form.tsx
'use client';

import { submitForm } from '@/app/actions';

export default function Form() {
  return (
    <form action={submitForm}>
      <input name="email" type="email" required />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## File Organization

```
app/
├── layout.tsx          # Root layout (Server Component)
├── page.tsx           # Home page
├── globals.css        # Global styles
├── api/
│   └── chat/
│       └── route.ts   # API route handler
├── (marketing)/       # Route group (no URL segment)
│   ├── about/
│   │   └── page.tsx
│   └── contact/
│       └── page.tsx
└── dashboard/
    ├── layout.tsx     # Nested layout
    ├── page.tsx
    └── settings/
        └── page.tsx
```

## Image Optimization

```typescript
import Image from 'next/image';

export default function CourseCard({ course }) {
  return (
    <div className="relative aspect-[16/9]">
      <Image
        src={course.imageUrl}
        alt={course.name}
        fill
        className="object-cover rounded-lg"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={false} // Set true for above-fold images
      />
    </div>
  );
}
```

## Loading & Error States

### Loading UI
```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <Skeleton />;
}
```

### Error Handling
```typescript
// app/dashboard/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
```

### Not Found
```typescript
// app/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>Not Found</h2>
      <p>Could not find requested resource</p>
    </div>
  );
}
```

## Best Practices

1. **Keep Server Components at top of component tree**
2. **Pass data from Server to Client Components via props**
3. **Use Client Components for interactivity only**
4. **Keep Client Components small and focused**
5. **Use Server Actions for data mutations**
6. **Avoid prop drilling - use composition pattern**
