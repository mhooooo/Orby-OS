/**
 * Memory Retrieval Service
 *
 * Retrieves context for AI conversations by combining:
 * 1. Semantic search over stored memories (via embeddings)
 * 2. Recent chat history
 * 3. Current itinerary draft
 *
 * All queries run in parallel for optimal performance.
 */

import { supabase } from './supabase';
import { getEmbeddingSafe } from './embeddings';

// ============================================================================
// Types
// ============================================================================

export interface RetrievedMemory {
  id: string;
  memory_type: string;
  category: string;
  content: string;
  confidence: number;
  similarity: number;
}

export interface RetrievalResult {
  memories: RetrievedMemory[];
  recentHistory: Array<{ role: string; content: string }>;
  currentItinerary: Record<string, unknown> | null;
}

export interface RetrievalOptions {
  memoryCount?: number;
  historyCount?: number;
  similarityThreshold?: number;
}

// Default options
const DEFAULT_OPTIONS: Required<RetrievalOptions> = {
  memoryCount: 5,
  historyCount: 10,
  similarityThreshold: 0.7,
};

// ============================================================================
// Main Retrieval Function
// ============================================================================

/**
 * Retrieve context for AI conversation
 *
 * @param sessionUuid - Current session UUID
 * @param userId - User ID (null for guest sessions)
 * @param currentMessage - User's current message for semantic search
 * @param options - Retrieval options (memory count, history count, similarity threshold)
 * @returns Combined context from memories, history, and itinerary
 */
export async function retrieveContext(
  sessionUuid: string,
  userId: string | null,
  currentMessage: string,
  options: RetrievalOptions = {}
): Promise<RetrievalResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Run all retrieval operations in parallel for optimal performance
  const [memories, recentHistory, currentItinerary] = await Promise.all([
    retrieveMemories(sessionUuid, userId, currentMessage, opts),
    retrieveRecentHistory(sessionUuid, opts.historyCount),
    retrieveCurrentItinerary(sessionUuid, userId),
  ]);

  return {
    memories,
    recentHistory,
    currentItinerary,
  };
}

// ============================================================================
// Memory Retrieval (Semantic Search)
// ============================================================================

/**
 * Retrieve relevant memories using semantic search
 * Falls back to most recent memories if embedding fails
 */
async function retrieveMemories(
  sessionUuid: string,
  userId: string | null,
  currentMessage: string,
  options: Required<RetrievalOptions>
): Promise<RetrievedMemory[]> {
  // Get embedding for current message
  const embedding = await getEmbeddingSafe(currentMessage);

  // If embedding failed, fall back to most recent memories
  if (!embedding) {
    console.warn('[Memory Retrieval] Embedding generation failed, falling back to recent memories');
    return retrieveFallbackMemories(sessionUuid, userId, options.memoryCount);
  }

  // Perform semantic search using RPC
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase.rpc as any)('search_memories', {
      query_embedding: embedding,
      p_session_uuid: sessionUuid,
      p_user_id: userId,
      match_count: options.memoryCount,
      similarity_threshold: options.similarityThreshold,
    });

    if (error) {
      console.error('[Memory Retrieval] RPC search_memories error:', error);
      return retrieveFallbackMemories(sessionUuid, userId, options.memoryCount);
    }

    if (!data || data.length === 0) {
      console.log('[Memory Retrieval] No memories found above similarity threshold');
      return [];
    }

    // Map RPC result to RetrievedMemory interface
    return data.map((row: {
      id: string;
      memory_type: string;
      category: string;
      content: string;
      confidence: number;
      similarity: number;
    }) => ({
      id: row.id,
      memory_type: row.memory_type,
      category: row.category,
      content: row.content,
      confidence: row.confidence,
      similarity: row.similarity,
    }));
  } catch (err) {
    console.error('[Memory Retrieval] Unexpected error in semantic search:', err);
    return retrieveFallbackMemories(sessionUuid, userId, options.memoryCount);
  }
}

/**
 * Fallback: Retrieve most recent memories when semantic search fails
 */
async function retrieveFallbackMemories(
  sessionUuid: string,
  userId: string | null,
  count: number
): Promise<RetrievedMemory[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('user_memories')
      .select('id, memory_type, category, content, confidence')
      .or(`session_uuid.eq.${sessionUuid},user_id.eq.${userId}`)
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error('[Memory Retrieval] Fallback query error:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Return with default similarity of 0 (no semantic matching)
    return data.map((row: {
      id: string;
      memory_type: string;
      category: string;
      content: string;
      confidence: number;
    }) => ({
      id: row.id,
      memory_type: row.memory_type,
      category: row.category,
      content: row.content,
      confidence: row.confidence,
      similarity: 0,
    }));
  } catch (err) {
    console.error('[Memory Retrieval] Unexpected error in fallback retrieval:', err);
    return [];
  }
}

// ============================================================================
// Chat History Retrieval
// ============================================================================

/**
 * Retrieve recent chat messages for context
 */
async function retrieveRecentHistory(
  sessionUuid: string,
  count: number
): Promise<Array<{ role: string; content: string }>> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (supabase as any)
      .from('chat_messages')
      .select('role, content')
      .eq('session_uuid', sessionUuid)
      .order('created_at', { ascending: false })
      .limit(count);

    if (error) {
      console.error('[Memory Retrieval] Chat history query error:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    // Reverse to get chronological order (oldest first)
    return data.reverse().map((row: { role: string; content: string }) => ({
      role: row.role,
      content: row.content,
    }));
  } catch (err) {
    console.error('[Memory Retrieval] Unexpected error retrieving chat history:', err);
    return [];
  }
}

// ============================================================================
// Current Itinerary Retrieval
// ============================================================================

/**
 * Retrieve current itinerary draft (most recent)
 */
async function retrieveCurrentItinerary(
  sessionUuid: string,
  userId: string | null
): Promise<Record<string, unknown> | null> {
  try {
    // Query for most recent itinerary draft
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (supabase as any)
      .from('itinerary_drafts')
      .select('*')
      .eq('session_uuid', sessionUuid)
      .order('updated_at', { ascending: false })
      .limit(1);

    // Add user_id filter if user is authenticated
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[Memory Retrieval] Itinerary query error:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    // Return the most recent itinerary draft
    return data[0] as Record<string, unknown>;
  } catch (err) {
    console.error('[Memory Retrieval] Unexpected error retrieving itinerary:', err);
    return null;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format retrieved context for AI prompt injection
 *
 * @param result - Retrieval result
 * @returns Formatted string for system prompt
 */
export function formatContextForPrompt(result: RetrievalResult): string {
  const sections: string[] = [];

  // Format memories
  if (result.memories.length > 0) {
    sections.push('## Relevant Memories\n');
    result.memories.forEach((memory, index) => {
      sections.push(
        `${index + 1}. [${memory.category}] (${memory.memory_type}, confidence: ${memory.confidence.toFixed(2)}, similarity: ${memory.similarity.toFixed(2)})\n${memory.content}\n`
      );
    });
  }

  // Format chat history
  if (result.recentHistory.length > 0) {
    sections.push('\n## Recent Conversation\n');
    result.recentHistory.forEach((msg) => {
      sections.push(`${msg.role}: ${msg.content}\n`);
    });
  }

  // Format current itinerary
  if (result.currentItinerary) {
    sections.push('\n## Current Itinerary Draft\n');
    sections.push(JSON.stringify(result.currentItinerary, null, 2));
  }

  return sections.join('\n');
}
