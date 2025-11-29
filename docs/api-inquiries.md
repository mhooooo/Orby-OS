# Inquiries API - Frontend Integration Guide

## Overview
Three endpoints for submitting and managing booking inquiries:
- `POST /api/inquiries` - Submit new inquiry (guest or authenticated)
- `GET /api/inquiries` - List user's inquiries (auth required)
- `GET /api/inquiries/[id]` - Get single inquiry details (ownership verified)

---

## Quick Start Examples

### Submit Inquiry (Guest User)
```typescript
const response = await fetch('/api/inquiries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'guest@example.com',
    name: 'John Doe',
    phone: '+66 123456789', // optional
    itinerary_snapshot: itineraryData, // optional - current wizard state
    message: 'Looking forward to this trip!' // optional
  })
});

const { success, inquiry_id } = await response.json();
```

### Submit Inquiry (Authenticated User with Saved Draft)
```typescript
const response = await fetch('/api/inquiries', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: user.email,
    name: user.name,
    phone: user.phone,
    itinerary_draft_id: 'uuid-of-saved-draft', // links to saved itinerary
    message: 'Please confirm availability'
  })
});
```

### Get User's Inquiries
```typescript
// Requires authentication
const response = await fetch('/api/inquiries');
const { inquiries } = await response.json();

// Returns array with itinerary details
inquiries.forEach(inquiry => {
  console.log(inquiry.status); // 'pending', 'contacted', 'confirmed', 'closed'
  console.log(inquiry.itinerary_drafts?.name); // Linked itinerary name
});
```

### Get Single Inquiry
```typescript
const response = await fetch(`/api/inquiries/${inquiryId}`);
const { inquiry } = await response.json();

// Access full details
console.log(inquiry.itinerary_snapshot); // Frozen trip state at inquiry time
console.log(inquiry.itinerary_drafts?.draft_json); // Live draft if linked
```

---

## Use Cases

### 1. Wizard "Request Quote" Button
At the end of the itinerary builder wizard:

```typescript
async function handleRequestQuote() {
  const { user } = useAuth();

  // Get current wizard state
  const itineraryData = {
    region: selectedRegion,
    numberOfDays: days,
    groupSize: golfers,
    vibe: selectedVibe,
    transport: selectedTransport,
    // ... other wizard fields
  };

  // If user is authenticated, save draft first (optional)
  let draftId = null;
  if (user) {
    const draftResponse = await fetch('/api/itineraries', {
      method: 'POST',
      body: JSON.stringify({
        name: `${region} ${days}-day trip`,
        draft_json: itineraryData
      })
    });
    const { id } = await draftResponse.json();
    draftId = id;
  }

  // Submit inquiry
  const response = await fetch('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify({
      email: user?.email || guestEmail,
      name: user?.name || guestName,
      phone: user?.phone || guestPhone,
      itinerary_draft_id: draftId,
      itinerary_snapshot: itineraryData, // Always include snapshot
      message: customMessage
    })
  });

  if (response.ok) {
    // Show success message, redirect to confirmation
    const { inquiry_id } = await response.json();
    router.push(`/inquiries/${inquiry_id}?submitted=true`);
  }
}
```

### 2. Course Detail "Inquire" Button
Quick inquiry from a single course card:

```typescript
async function handleCourseInquiry(courseId: string) {
  const response = await fetch('/api/inquiries', {
    method: 'POST',
    body: JSON.stringify({
      email: user?.email || prompt('Enter email'),
      name: user?.name || prompt('Enter name'),
      itinerary_snapshot: {
        type: 'single_course',
        courseId,
        date: null // Let them specify in message
      },
      message: `Interested in ${courseName}`
    })
  });
}
```

### 3. Member Dashboard - View Inquiries
Display user's inquiry history:

```typescript
export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    fetch('/api/inquiries')
      .then(res => res.json())
      .then(data => setInquiries(data.inquiries));
  }, []);

  return (
    <div>
      {inquiries.map(inquiry => (
        <InquiryCard
          key={inquiry.id}
          status={inquiry.status}
          createdAt={inquiry.created_at}
          itinerary={inquiry.itinerary_drafts}
          onClick={() => router.push(`/inquiries/${inquiry.id}`)}
        />
      ))}
    </div>
  );
}
```

---

## Type Definitions

```typescript
interface InquirySubmission {
  email: string;              // Required, validated
  name: string;               // Required
  phone?: string;             // Optional
  itinerary_draft_id?: string; // Optional - UUID of saved itinerary
  itinerary_snapshot?: {      // Optional - frozen state at inquiry time
    region?: string;
    numberOfDays?: number;
    groupSize?: number;
    vibe?: string;
    transport?: string;
    [key: string]: unknown;
  };
  message?: string;           // Optional user notes
}

interface Inquiry {
  id: string;
  user_id: string | null;
  email: string;
  name: string;
  phone: string | null;
  itinerary_draft_id: string | null;
  itinerary_snapshot: Record<string, unknown> | null;
  message: string | null;
  status: 'pending' | 'contacted' | 'confirmed' | 'closed';
  created_at: string;
  updated_at: string;
  itinerary_drafts?: {
    id: string;
    name: string | null;
    draft_json: Record<string, unknown>;
  } | null;
}
```

---

## Error Handling

```typescript
async function submitInquiry(data: InquirySubmission) {
  const response = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const { error } = await response.json();

    switch (response.status) {
      case 400:
        // Validation error - show to user
        toast.error(error); // "Email and name are required"
        break;
      case 404:
        // Draft not found
        toast.error('Saved itinerary not found. Please try again.');
        break;
      case 500:
        // Server error - retry or contact support
        toast.error('Something went wrong. Please try again.');
        break;
    }

    return null;
  }

  const { inquiry_id } = await response.json();
  return inquiry_id;
}
```

---

## Best Practices

### 1. Always Include Snapshot
Even if you have a `itinerary_draft_id`, include `itinerary_snapshot`:
- Drafts can be modified or deleted after inquiry
- Snapshot preserves exact state at inquiry time
- Makes inquiry self-contained for admin review

### 2. Progressive Enhancement
For guest users:
```typescript
// Step 1: Collect minimal info
<Form>
  <Input name="email" required />
  <Input name="name" required />
  <Input name="phone" />
  <Button>Request Quote</Button>
</Form>

// Step 2: Suggest signup after submission
"Thanks! Check your email. Want to save this trip? <SignUpButton />"
```

### 3. Draft vs Snapshot Strategy
- **Draft**: User can edit, links to account, survives page refresh
- **Snapshot**: Frozen at inquiry time, admin sees exact request
- **Recommended**: Always send snapshot, optionally link draft if user is authenticated

### 4. Status Badge Component
```typescript
function InquiryStatusBadge({ status }: { status: InquiryStatus }) {
  const config = {
    pending: { color: 'yellow', label: 'Pending Review' },
    contacted: { color: 'blue', label: 'We Reached Out' },
    confirmed: { color: 'green', label: 'Confirmed' },
    closed: { color: 'gray', label: 'Closed' }
  };

  const { color, label } = config[status];
  return <Badge color={color}>{label}</Badge>;
}
```

---

## Next Steps

1. Create `<InquiryForm>` component for wizard final step
2. Add inquiry submission to course detail pages
3. Build member dashboard inquiry list view
4. Create inquiry detail page at `/inquiries/[id]`
5. Add email notification trigger (future - not in API)

---

## Files Created
- `/src/app/api/inquiries/route.ts` - POST and GET endpoints
- `/src/app/api/inquiries/[id]/route.ts` - Single inquiry GET endpoint
