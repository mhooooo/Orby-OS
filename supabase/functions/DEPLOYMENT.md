# Supabase Edge Functions Deployment Guide

## Prerequisites

1. Install Supabase CLI:
```bash
brew install supabase/tap/supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Edge Functions

### extract-memories

Passive profiler that extracts implicit user preferences from chat messages.

#### Deploy

```bash
# Deploy the function
supabase functions deploy extract-memories

# Verify deployment
supabase functions list
```

#### Set Secrets

```bash
# Set environment variables (required)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set OPENAI_API_KEY=sk-...

# Verify secrets
supabase secrets list
```

Note: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically available in Edge Functions.

#### Test Deployment

```bash
# Test with curl
curl -i --location --request POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/extract-memories' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{
    "message_id": "123e4567-e89b-12d3-a456-426614174000",
    "session_uuid": "123e4567-e89b-12d3-a456-426614174001",
    "user_id": null,
    "content": "I hate waking up early for golf",
    "context": "user: Hi\\nassistant: Hello!"
  }'
```

Expected response:
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

## Local Development

### Start Supabase locally

```bash
supabase start
```

### Serve functions locally

```bash
# Serve all functions
supabase functions serve

# Serve specific function
supabase functions serve extract-memories --env-file .env.local
```

### Create .env.local for local testing

```bash
# .env.local
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

### Test locally

```bash
curl -i --location --request POST 'http://localhost:54321/functions/v1/extract-memories' \
  --header 'Authorization: Bearer YOUR_LOCAL_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data @test-payload.json
```

## Monitoring

### View function logs

```bash
# Production logs
supabase functions logs extract-memories

# Follow logs in real-time
supabase functions logs extract-memories --follow
```

### Check function health

```bash
# List deployed functions and their status
supabase functions list
```

## Troubleshooting

### Common Issues

1. **"Function not found"**
   - Verify deployment: `supabase functions list`
   - Check project link: `supabase projects list`

2. **"API key not set"**
   - Set secrets: `supabase secrets set ANTHROPIC_API_KEY=...`
   - Verify: `supabase secrets list`

3. **"Database RPC error"**
   - Ensure migrations are applied: `supabase db push`
   - Check RLS policies are correct

4. **High error rate**
   - Check logs: `supabase functions logs extract-memories --follow`
   - Verify API quotas (Anthropic, OpenAI)

## Cost Monitoring

Monitor API usage:
- Anthropic Dashboard: https://console.anthropic.com
- OpenAI Dashboard: https://platform.openai.com/usage

Expected costs per extraction:
- Claude Haiku: ~$0.0003
- OpenAI Embedding: ~$0.00002
- **Total: ~$0.00032**

## Security

- Never commit `.env.local` or secrets
- Use `supabase secrets` for production
- Rotate API keys periodically
- Monitor for unusual usage patterns
