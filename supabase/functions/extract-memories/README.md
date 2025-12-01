# Extract Memories Edge Function

Passive profiler that extracts implicit user preferences from chat messages.

## Purpose

This Supabase Edge Function runs in the background after each chat message to extract soft signals about user preferences, personality traits, and constraints. It complements the Active Memory system by capturing implicit information that isn't explicitly stated.

## How It Works

1. **Receives**: Message content, context (last 3 messages), session UUID, user ID
2. **Extracts**: Uses Claude Haiku to identify implicit preferences
3. **Embeds**: Generates vector embeddings via OpenAI text-embedding-3-small
4. **Deduplicates**: Checks for similar existing memories using vector search
5. **Stores/Reinforces**: Either creates new memory or reinforces existing one

## Categories

- `play_style`: pace, walking/cart, competitive/casual
- `budget`: price sensitivity, value focus, luxury preference
- `logistics`: morning/afternoon person, location preferences
- `social`: solo/group, communication style
- `health`: physical needs, dietary, accessibility

## Rate Limiting

- Skips messages under 20 characters
- Max 50 extractions per session

## Environment Variables

Required in Supabase Edge Function secrets:

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

## Deployment

```bash
# Deploy the function
supabase functions deploy extract-memories

# Set secrets
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set OPENAI_API_KEY=sk-...
```

## Testing Locally

```bash
# Start local Supabase
supabase start

# Serve the function locally
supabase functions serve extract-memories --env-file .env.local

# Test with curl
curl -i --location --request POST 'http://localhost:54321/functions/v1/extract-memories' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "message_id": "123e4567-e89b-12d3-a456-426614174000",
    "session_uuid": "123e4567-e89b-12d3-a456-426614174001",
    "user_id": null,
    "content": "I hate waking up early for golf",
    "context": "user: Hi\nassistant: Hello! How can I help with your golf trip?"
  }'
```

## Integration

Called from `/api/chat/route.ts` after each user message (fire-and-forget):

```typescript
// After storing message
triggerPassiveProfiler(
  messageId,
  sessionUuid,
  userId,
  content,
  recentMessages
);
```

## Response Format

```json
{
  "extracted": 1,
  "results": [
    {
      "action": "created",
      "id": "uuid",
      "category": "logistics",
      "confidence": 0.85
    }
  ]
}
```

## Cost Per Invocation

- Claude Haiku: ~$0.0003
- OpenAI Embedding: ~$0.00002
- **Total: ~$0.00032 per extraction**

With rate limiting (avg 5 extractions per session):
- **Cost per user session: ~$0.0016**
