/**
 * Context Builder for Golf Okay Memory System
 *
 * Constructs enhanced system prompts by appending:
 * - User profile memories (sorted by confidence)
 * - Current trip planning state
 * - Recent conversation history
 *
 * Token budget controls ensure context fits within model limits.
 */

interface RetrievalResult {
  memories: Array<{ category: string; content: string; confidence: number }>;
  recentHistory: Array<{ role: string; content: string }>;
  currentItinerary: Record<string, unknown> | null;
}

interface ContextConfig {
  maxMemoryTokens?: number;
  maxHistoryTokens?: number;
}

/**
 * Rough token estimation (4 characters ≈ 1 token)
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Build User Profile section from retrieved memories
 */
function buildUserProfileSection(
  memories: Array<{ category: string; content: string; confidence: number }>,
  maxTokens: number
): string {
  if (memories.length === 0) {
    return '';
  }

  // Sort by confidence descending
  const sortedMemories = [...memories].sort((a, b) => b.confidence - a.confidence);

  const header = `## User Profile (Retrieved from Memory)
The following facts are known about this user. Prioritize these over assumptions:

`;

  let content = header;
  let currentTokens = estimateTokens(header);

  const footer = '\nIMPORTANT: If memory contradicts user\'s current request, ask for clarification.';
  const footerTokens = estimateTokens(footer);

  // Add memories until we hit token budget
  for (const memory of sortedMemories) {
    const line = `- [${memory.category}] ${memory.content} (confidence: ${memory.confidence.toFixed(2)})\n`;
    const lineTokens = estimateTokens(line);

    if (currentTokens + lineTokens + footerTokens > maxTokens) {
      // Add truncation notice if we're cutting off memories
      const remainingCount = sortedMemories.length - content.split('\n').filter(l => l.startsWith('- [')).length;
      if (remainingCount > 0) {
        content += `\n... and ${remainingCount} more memories (truncated for token budget)\n`;
      }
      break;
    }

    content += line;
    currentTokens += lineTokens;
  }

  content += footer;

  return content;
}

/**
 * Build Current Trip Planning State section
 */
function buildTripStateSection(itinerary: Record<string, unknown> | null): string {
  if (!itinerary) {
    return '';
  }

  const header = `## Current Trip Planning State
The user is building a trip with these confirmed details:

`;

  let details = '';

  // Travel dates
  if (itinerary.start_date && itinerary.end_date) {
    details += `- Travel dates: ${itinerary.start_date} to ${itinerary.end_date}\n`;
  }

  // Group size
  if (itinerary.group_size) {
    details += `- Group size: ${itinerary.group_size} golfers\n`;
  }

  // Region
  if (itinerary.region) {
    details += `- Region: ${itinerary.region}\n`;
  }

  // Budget tier
  if (itinerary.budget_tier) {
    details += `- Budget tier: ${itinerary.budget_tier}\n`;
  }

  // Selected courses
  if (itinerary.selected_courses && Array.isArray(itinerary.selected_courses) && itinerary.selected_courses.length > 0) {
    const courseNames = itinerary.selected_courses.map((c: { name?: string } | string) =>
      typeof c === 'string' ? c : c.name || String(c)
    ).join(', ');
    details += `- Selected courses: ${courseNames}\n`;
  }

  // Special requirements
  if (itinerary.needs_golf_cart) {
    details += `- Special: User needs golf cart\n`;
  }
  if (itinerary.needs_caddie) {
    details += `- Special: User needs caddie\n`;
  }
  if (itinerary.dietary_restrictions) {
    details += `- Dietary restrictions: ${itinerary.dietary_restrictions}\n`;
  }
  if (itinerary.accessibility_needs) {
    details += `- Accessibility needs: ${itinerary.accessibility_needs}\n`;
  }

  // If no details, return empty
  if (!details) {
    return '';
  }

  const footer = '\nUse Active Memory tools (set_trip_dates, set_group_size, etc.) to update this state when user provides new hard data.';

  return header + details + footer;
}

/**
 * Build Recent Conversation section
 */
function buildRecentConversationSection(
  history: Array<{ role: string; content: string }>,
  maxTokens: number
): string {
  if (history.length === 0) {
    return '';
  }

  const header = `## Recent Conversation\n\n`;
  let content = header;
  let currentTokens = estimateTokens(header);

  // Process history in reverse (most recent first), then reverse back
  const reversedHistory = [...history].reverse();
  const includedMessages: Array<{ role: string; content: string }> = [];

  for (const message of reversedHistory) {
    const messageLine = `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}\n\n`;
    const messageTokens = estimateTokens(messageLine);

    if (currentTokens + messageTokens > maxTokens) {
      // Add truncation notice
      const remainingCount = history.length - includedMessages.length;
      if (remainingCount > 0) {
        content = header + `[Earlier conversation truncated - ${remainingCount} messages omitted for token budget]\n\n` + content.slice(header.length);
      }
      break;
    }

    includedMessages.push(message);
    currentTokens += messageTokens;
  }

  // Reverse back to chronological order
  includedMessages.reverse();

  // Build final content
  if (includedMessages.length > 0) {
    content = header;
    for (const message of includedMessages) {
      content += `${message.role === 'user' ? 'User' : 'Assistant'}: ${message.content}\n\n`;
    }

    // Add truncation notice if needed
    if (includedMessages.length < history.length) {
      const truncatedCount = history.length - includedMessages.length;
      content = header + `[Earlier conversation truncated - ${truncatedCount} messages omitted for token budget]\n\n` + content.slice(header.length);
    }
  }

  return content.trim();
}

/**
 * Build enhanced system prompt with retrieved context
 *
 * @param basePrompt - The base system prompt
 * @param retrieved - Retrieved memories, history, and itinerary
 * @param config - Token budget configuration
 * @returns Enhanced system prompt with appended context
 */
export function buildEnhancedSystemPrompt(
  basePrompt: string,
  retrieved: RetrievalResult,
  config: ContextConfig = {}
): string {
  const {
    maxMemoryTokens = 500,
    maxHistoryTokens = 1000,
  } = config;

  const sections: string[] = [basePrompt];

  // Add User Profile section
  const userProfileSection = buildUserProfileSection(retrieved.memories, maxMemoryTokens);
  if (userProfileSection) {
    sections.push(userProfileSection);
  }

  // Add Trip State section
  const tripStateSection = buildTripStateSection(retrieved.currentItinerary);
  if (tripStateSection) {
    sections.push(tripStateSection);
  }

  // Add Recent Conversation section
  const conversationSection = buildRecentConversationSection(retrieved.recentHistory, maxHistoryTokens);
  if (conversationSection) {
    sections.push(conversationSection);
  }

  // Join sections with separator
  return sections.join('\n\n---\n\n');
}
