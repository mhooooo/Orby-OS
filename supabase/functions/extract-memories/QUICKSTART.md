# Extract Memories - Quick Start Guide

## What It Does

Automatically extracts user preferences from chat messages in the background.

**Example:**
- User says: "I hate waking up early"
- Extracts: `{ type: "preference", category: "logistics", content: "User prefers late tee times", confidence: 0.85 }`

## 5-Minute Setup

### 1. Install Supabase CLI

```bash
brew install supabase/tap/supabase
supabase login
```

### 2. Deploy Function

```bash
# From project root
cd supabase/functions
supabase functions deploy extract-memories
```

### 3. Set API Keys

```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-your-key-here
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

### 4. Test It

```bash
curl -i --location --request POST \
  'https://YOUR_PROJECT.supabase.co/functions/v1/extract-memories' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "message_id": "test-123",
    "session_uuid": "test-session",
    "user_id": null,
    "content": "I prefer morning tee times and luxury courses",
    "context": ""
  }'
```

### 5. Integrate with Chat

Add to `src/app/api/chat/route.ts`:

```typescript
// After storing message
fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/extract-memories`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  },
  body: JSON.stringify({
    message_id: messageId,
    session_uuid: sessionUuid,
    user_id: userId,
    content: userMessage,
    context: recentMessages.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n'),
  }),
}).catch(console.error); // Fire and forget
```

## What Gets Extracted

Only IMPLICIT preferences (not explicit booking data):

✅ **Extracts:**
- "I hate waking up early" → Time preference
- "Budget is tight this trip" → Price sensitivity
- "My knee has been bothering me" → Health constraint
- "I take my game seriously" → Play style

❌ **Ignores:**
- "Book March 15-20" → Explicit dates
- "4 golfers" → Explicit group size
- "Play at Phuket Country Club" → Explicit course

## Rate Limits

- Skips messages < 20 characters
- Max 50 extractions per session
- Only extracts if confidence > 0.7

## Costs

- ~$0.0003 per extraction
- ~$0.0016 per user session (avg 5 extractions)

## Monitoring

```bash
# View logs
supabase functions logs extract-memories --follow

# Check status
supabase functions list
```

## Local Development

```bash
# Start Supabase locally
supabase start

# Serve function
supabase functions serve extract-memories --env-file .env.local

# Test locally
curl http://localhost:54321/functions/v1/extract-memories ...
```

## Troubleshooting

**"Function not found"**
```bash
supabase functions list  # Verify deployment
```

**"API key not set"**
```bash
supabase secrets list  # Check secrets
supabase secrets set ANTHROPIC_API_KEY=...
```

**No memories extracted**
```bash
# Check logs for errors
supabase functions logs extract-memories

# Verify message is > 20 chars and has implicit signals
```

## Next Steps

1. Deploy function ✓
2. Add to chat route
3. Test with real messages
4. Monitor extraction quality
5. Tune confidence threshold if needed

## Documentation

- Full docs: `README.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- Deployment guide: `../DEPLOYMENT.md`
- Test cases: `test.example.ts`

---

**Ready to deploy!** 🚀
