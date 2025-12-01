/**
 * Memory Pipeline Audit Tests
 *
 * Tests for the Memory Logic Pipeline:
 * - Chat route with context injection
 * - Session header handling
 * - Edge function file structure
 */

import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Memory Pipeline', () => {
  test.describe('File Structure', () => {
    test('embedding service file exists', () => {
      const filePath = path.join(process.cwd(), 'src/lib/embeddings.ts');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('getEmbedding');
      expect(content).toContain('getEmbeddingSafe');
      expect(content).toContain('cosineSimilarity');
      expect(content).toContain('text-embedding-3-small');
      expect(content).toContain('1536');
    });

    test('memory retrieval service file exists', () => {
      const filePath = path.join(process.cwd(), 'src/lib/memory-retrieval.ts');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('retrieveContext');
      expect(content).toContain('formatContextForPrompt');
      expect(content).toContain('RetrievedMemory');
      expect(content).toContain('search_memories');
    });

    test('context builder file exists', () => {
      const filePath = path.join(process.cwd(), 'src/lib/context-builder.ts');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('buildEnhancedSystemPrompt');
      expect(content).toContain('User Profile');
      expect(content).toContain('Current Trip Planning State');
      expect(content).toContain('Recent Conversation');
      expect(content).toContain('maxMemoryTokens');
      expect(content).toContain('maxHistoryTokens');
    });

    test('extract-memories edge function file exists', () => {
      const filePath = path.join(process.cwd(), 'supabase/functions/extract-memories/index.ts');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('claude-3-haiku');
      expect(content).toContain('text-embedding-3-small');
      expect(content).toContain('search_memories');
      expect(content).toContain('reinforce_memory');
      expect(content).toContain('play_style');
      expect(content).toContain('budget');
      expect(content).toContain('logistics');
    });
  });

  test.describe('System Prompt', () => {
    test('tools.ts contains memory system rules', () => {
      const filePath = path.join(process.cwd(), 'src/lib/tools.ts');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain('MEMORY SYSTEM');
      expect(content).toContain('LONG-TERM MEMORY');
      expect(content).toContain('ACTIVE MEMORY');
      expect(content).toContain('PASSIVE MEMORY');
      expect(content).toContain('Prioritize facts from the "User Profile"');
    });
  });

  test.describe('Chat Route', () => {
    test('chat route includes memory imports', () => {
      const filePath = path.join(process.cwd(), 'src/app/api/chat/route.ts');
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, 'utf-8');
      expect(content).toContain("import { retrieveContext }");
      expect(content).toContain("import { buildEnhancedSystemPrompt }");
      expect(content).toContain('triggerPassiveProfiler');
      expect(content).toContain('getUserIdFromSession');
      expect(content).toContain('X-Session-UUID');
    });
  });

  test.describe('API Integration', () => {
    test('chat API accepts session UUID header', async ({ request }) => {
      // This test verifies the API route accepts the header
      // The request may fail for other reasons (auth, API key) but should not fail on the header
      const response = await request.post('/api/chat', {
        headers: {
          'Content-Type': 'application/json',
          'X-Session-UUID': 'test-session-uuid-12345',
        },
        data: {
          messages: [{ role: 'user', content: 'Hello' }],
        },
      });

      // Should get a response (even if error) - not a 400 for bad header
      expect(response.status()).not.toBe(400);
    });
  });

  test.describe('Type Definitions', () => {
    test('memory-retrieval exports correct interfaces', () => {
      const filePath = path.join(process.cwd(), 'src/lib/memory-retrieval.ts');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check RetrievedMemory interface
      expect(content).toContain('interface RetrievedMemory');
      expect(content).toContain('memory_type: string');
      expect(content).toContain('category: string');
      expect(content).toContain('confidence: number');
      expect(content).toContain('similarity: number');

      // Check RetrievalResult interface
      expect(content).toContain('interface RetrievalResult');
      expect(content).toContain('memories: RetrievedMemory[]');
      expect(content).toContain('recentHistory:');
      expect(content).toContain('currentItinerary:');
    });

    test('context-builder handles all itinerary fields', () => {
      const filePath = path.join(process.cwd(), 'src/lib/context-builder.ts');
      const content = fs.readFileSync(filePath, 'utf-8');

      // Check itinerary field handling
      expect(content).toContain('start_date');
      expect(content).toContain('end_date');
      expect(content).toContain('group_size');
      expect(content).toContain('region');
      expect(content).toContain('budget_tier');
      expect(content).toContain('selected_courses');
      expect(content).toContain('needs_golf_cart');
    });

    test('embeddings service uses correct dimensions', () => {
      const filePath = path.join(process.cwd(), 'src/lib/embeddings.ts');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain('EXPECTED_DIMENSIONS = 1536');
      expect(content).toContain("EMBEDDING_MODEL = 'text-embedding-3-small'");
    });
  });

  test.describe('Error Handling', () => {
    test('memory-retrieval has graceful degradation', () => {
      const filePath = path.join(process.cwd(), 'src/lib/memory-retrieval.ts');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain('retrieveFallbackMemories');
      expect(content).toContain('console.error');
      expect(content).toContain('console.warn');
      expect(content).toContain('falling back');
    });

    test('chat route has context retrieval error handling', () => {
      const filePath = path.join(process.cwd(), 'src/app/api/chat/route.ts');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain('Context retrieval failed');
      expect(content).toContain('Gracefully degrade');
    });

    test('embeddings has safe wrapper', () => {
      const filePath = path.join(process.cwd(), 'src/lib/embeddings.ts');
      const content = fs.readFileSync(filePath, 'utf-8');

      expect(content).toContain('getEmbeddingSafe');
      expect(content).toContain('return null');
    });
  });
});
