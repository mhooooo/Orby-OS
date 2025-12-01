import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!);

const EXTRACTION_PROMPT = `You are a memory extraction system for a golf concierge AI.
Analyze the user's message and extract IMPLICIT preferences, personality traits, or long-term constraints.

RULES:
1. DO NOT extract explicit booking data (dates, group size, specific courses) - those are handled elsewhere.
2. Only extract SOFT signals that reveal personality or preferences.
3. Be conservative - only extract if confidence > 0.7.

CATEGORIES:
- play_style: pace, walking/cart, competitive/casual
- budget: price sensitivity, value focus, luxury preference
- logistics: morning/afternoon person, location preferences
- social: solo/group, communication style
- health: physical needs, dietary, accessibility

Return JSON array: [{ "type": "preference|constraint|fact|behavior", "category": "...", "content": "...", "confidence": 0.0-1.0 }]
Return [] if nothing notable.`;

interface ExtractedMemory {
  type: 'preference' | 'constraint' | 'fact' | 'behavior';
  category: 'play_style' | 'budget' | 'logistics' | 'social' | 'health';
  content: string;
  confidence: number;
}

interface RequestPayload {
  message_id: string;
  session_uuid: string;
  user_id: string | null;
  content: string;
  context: string;
}

// Rate limiting check
async function shouldExtract(sessionUuid: string, content: string): Promise<boolean> {
  // Skip short messages (less than 20 chars)
  if (content.length < 20) {
    return false;
  }

  // Check session extraction count
  const { count } = await supabase
    .from('user_memories')
    .select('*', { count: 'exact', head: true })
    .eq('session_uuid', sessionUuid);

  // Max 50 extractions per session
  if ((count || 0) >= 50) {
    return false;
  }

  return true;
}

// Extract memories using Claude Haiku
async function extractMemories(
  message: string,
  context: string
): Promise<ExtractedMemory[]> {
  const prompt = `${EXTRACTION_PROMPT}

USER MESSAGE:
${message}

RECENT CONTEXT (last 3 messages):
${context}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API failed: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.content[0]?.text || '[]';

  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
  } catch (error) {
    console.error('Failed to parse extraction:', content);
    return [];
  }
}

// Generate embedding using OpenAI
async function getEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Find similar existing memory for deduplication
async function findSimilarMemory(
  sessionUuid: string,
  userId: string | null,
  embedding: number[],
  threshold = 0.9
): Promise<{ id: string; content: string; similarity: number } | null> {
  const { data, error } = await supabase.rpc('search_memories', {
    query_embedding: embedding,
    p_session_uuid: sessionUuid,
    p_user_id: userId,
    match_count: 1,
    similarity_threshold: threshold,
  });

  if (error) {
    console.error('Error searching memories:', error);
    return null;
  }

  return data?.[0] || null;
}

serve(async (req) => {
  try {
    const payload: RequestPayload = await req.json();
    const { message_id, session_uuid, user_id, content, context } = payload;

    // Rate limiting check
    const shouldProcess = await shouldExtract(session_uuid, content);
    if (!shouldProcess) {
      return new Response(
        JSON.stringify({ extracted: 0, reason: 'rate_limited_or_too_short' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 1: Extract memories using Claude Haiku
    const extracted = await extractMemories(content, context);

    if (extracted.length === 0) {
      return new Response(
        JSON.stringify({ extracted: 0, reason: 'no_memories_found' }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Process each extracted memory
    const results = [];

    for (const memory of extracted) {
      // Skip low confidence
      if (memory.confidence < 0.7) {
        results.push({ action: 'skipped', reason: 'low_confidence', confidence: memory.confidence });
        continue;
      }

      // Generate embedding
      const embedding = await getEmbedding(memory.content);

      // Check for similar existing memory (dedup/reinforce)
      const similar = await findSimilarMemory(session_uuid, user_id, embedding);

      if (similar && similar.similarity > 0.9) {
        // Reinforce existing memory
        const { error: reinforceError } = await supabase.rpc('reinforce_memory', {
          p_memory_id: similar.id,
          p_new_confidence: Math.min(memory.confidence + 0.05, 1.0),
        });

        if (reinforceError) {
          console.error('Error reinforcing memory:', reinforceError);
          results.push({ action: 'error', error: 'reinforce_failed' });
        } else {
          results.push({
            action: 'reinforced',
            id: similar.id,
            similarity: similar.similarity,
          });
        }
      } else {
        // Insert new memory
        const { data, error } = await supabase.from('user_memories').insert({
          session_uuid,
          user_id,
          memory_type: memory.type,
          category: memory.category,
          content: memory.content,
          embedding,
          confidence: memory.confidence,
          source_message_id: message_id,
          extraction_model: 'claude-3-haiku-20240307',
        }).select('id').single();

        if (error) {
          console.error('Error inserting memory:', error);
          results.push({ action: 'error', error: 'insert_failed' });
        } else {
          results.push({
            action: 'created',
            id: data.id,
            category: memory.category,
            confidence: memory.confidence,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        extracted: results.filter(r => r.action === 'created' || r.action === 'reinforced').length,
        results,
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Extraction error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
