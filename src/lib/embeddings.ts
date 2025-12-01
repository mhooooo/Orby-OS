/**
 * Embedding Service
 *
 * Provides text embedding generation using OpenAI's text-embedding-3-small model.
 * Used by the memory system for semantic search and similarity matching.
 *
 * Model: text-embedding-3-small
 * Dimensions: 1536
 *
 * @see https://platform.openai.com/docs/guides/embeddings
 */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_EMBEDDING_ENDPOINT = 'https://api.openai.com/v1/embeddings';
const EMBEDDING_MODEL = 'text-embedding-3-small';
const EXPECTED_DIMENSIONS = 1536;

interface OpenAIEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate embedding vector for given text using OpenAI API
 *
 * @param text - Text to embed (will be trimmed)
 * @returns Array of 1536 floating point numbers
 * @throws Error if API key is missing, API call fails, or response is invalid
 *
 * @example
 * const embedding = await getEmbedding("User loves Siam Country Club Old Course");
 * // embedding.length === 1536
 */
export async function getEmbedding(text: string): Promise<number[]> {
  // Validate API key
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  // Validate input
  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error('Cannot generate embedding for empty text');
  }

  try {
    const response = await fetch(OPENAI_EMBEDDING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: EMBEDDING_MODEL,
        input: trimmedText,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI API request failed with status ${response.status}: ${errorText}`
      );
    }

    const data: OpenAIEmbeddingResponse = await response.json();

    // Validate response structure
    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Invalid response from OpenAI API: missing data array');
    }

    const embedding = data.data[0].embedding;

    // Validate embedding dimensions
    if (!Array.isArray(embedding) || embedding.length !== EXPECTED_DIMENSIONS) {
      throw new Error(
        `Invalid embedding dimensions: expected ${EXPECTED_DIMENSIONS}, got ${embedding?.length || 0}`
      );
    }

    return embedding;
  } catch (error) {
    // Re-throw with context if it's our own error
    if (error instanceof Error) {
      throw error;
    }

    // Wrap unknown errors
    throw new Error(
      `Unexpected error generating embedding: ${String(error)}`
    );
  }
}

/**
 * Safe wrapper for getEmbedding that catches errors and returns null
 *
 * Use this when embedding generation failure should not break the application flow.
 * Logs errors to console.error for debugging.
 *
 * @param text - Text to embed
 * @returns Array of 1536 numbers, or null if embedding generation fails
 *
 * @example
 * const embedding = await getEmbeddingSafe("User prefers afternoon tee times");
 * if (embedding) {
 *   // Use embedding for similarity search
 * } else {
 *   // Gracefully degrade - skip memory storage
 * }
 */
export async function getEmbeddingSafe(text: string): Promise<number[] | null> {
  try {
    return await getEmbedding(text);
  } catch (error) {
    console.error('[Embeddings] Failed to generate embedding:', error);
    return null;
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 *
 * Used for semantic similarity matching in memory retrieval.
 * Returns value between -1 and 1, where 1 means identical vectors.
 *
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns Cosine similarity score
 *
 * @example
 * const similarity = cosineSimilarity(embedding1, embedding2);
 * if (similarity > 0.8) {
 *   console.log("Highly similar memories");
 * }
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error(
      `Vector dimensions must match: ${a.length} vs ${b.length}`
    );
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);

  if (magnitude === 0) {
    return 0;
  }

  return dotProduct / magnitude;
}
