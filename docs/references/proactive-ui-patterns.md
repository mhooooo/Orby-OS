# Proactive UI Patterns

Best practices for progressive disclosure and proactive UI in conversational interfaces.

---

## Core Principles

### 1. Respect User Attention
- User attention is finite and precious
- Every interruption has a cost (context switching, cognitive load)
- Proactive UI should add value, not demand attention

### 2. Progressive Disclosure
- Show information progressively as needed
- Don't front-load all options
- Reveal complexity gradually based on user engagement

### 3. Contextual Relevance
- Show the right thing at the right time
- Proactive elements should feel like helpful suggestions, not interruptions
- Trigger based on user behavior patterns, not arbitrary timers

---

## When to Interrupt vs Wait

### Interrupt When:
- User is idle and hasn't interacted for 30+ seconds
- User has shown clear intent (viewed 3+ similar items)
- Information is time-sensitive (availability, pricing changes)
- User explicitly asked for help or recommendations
- System has high-confidence suggestion based on context

### Wait When:
- User is actively typing or interacting
- User just dismissed a previous nudge (respect cooldowns)
- User is in the middle of a multi-step flow
- The information isn't urgent
- Confidence in suggestion is low

### Never Interrupt:
- During error recovery flows
- While payment/checkout is in progress
- When user has shown dismissal fatigue (3+ dismissals in session)

---

## User Attention Management

### Attention Hierarchy (High to Low)
1. **Modal dialogs** - Full attention required, use sparingly
2. **Slide-up sheets** - Partial attention, can be dismissed
3. **Floating pills/banners** - Peripheral attention, non-blocking
4. **Inline badges** - No attention shift, contextual info
5. **Toasts** - Brief acknowledgment, auto-dismiss

### Attention Budget
- Max 1 modal per session
- Max 3 floating nudges per session
- Unlimited inline badges (they're non-intrusive)
- 2-minute minimum between any interruptions

---

## Modal Fatigue Prevention

### Signs of Modal Fatigue
- Quick dismissals (< 1 second)
- Increased bounce rate
- Decreased conversion on subsequent modals
- User frustration indicators (rapid clicks, navigating away)

### Prevention Strategies
1. **Rate limiting**: Max 1 modal per session
2. **Cooldown periods**: 10-minute cooldown after dismissal
3. **Progressive degradation**: After dismissal, use less intrusive patterns
4. **Respect preferences**: Remember user's dismissal patterns across sessions
5. **Value-first timing**: Show modals when user is most receptive (after positive action)

---

## Nudge Psychology (Ethical Patterns)

### Good Nudges
- **Default to best option**: Pre-select commonly chosen options
- **Social proof**: "Most golfers also book transportation"
- **Loss aversion (honest)**: "Only 2 tee times left for Saturday"
- **Completion momentum**: "You're 80% done planning your trip"
- **Helpful shortcuts**: "Based on your group size, here's a quote"

### Dark Patterns to Avoid
- Fake urgency ("Only 5 minutes left!" when not true)
- Forced continuity (hidden recurring charges)
- Confirm shaming ("No thanks, I hate saving money")
- Hidden costs revealed late
- Misdirection and visual interference
- Roach motel (easy to get in, hard to get out)

### Ethical Guidelines
1. Always provide easy dismissal
2. Never penalize users for declining
3. Be transparent about why you're showing something
4. Respect "no" as a final answer (for that session)
5. Make the helpful path obvious, not the extractive path

---

## Implementation Checklist

- [ ] Single source of truth for proactive UI state
- [ ] Centralized orchestrator that enforces rules
- [ ] Session persistence for dismissal state
- [ ] Rate limiting with configurable cooldowns
- [ ] Priority queue for competing nudges
- [ ] Analytics for nudge performance
- [ ] Easy kill switch for each nudge type
- [ ] A/B testing capability for timing/content
