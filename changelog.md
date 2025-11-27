# Golf Okay - Changelog

## [2024-11-27] Phase 1 Foundation

### Added
- **Chat System** - Full chat engine with streaming responses
  - `useChat` hook for message state and API communication
  - `ChatContext` for global state sharing
  - Components: ChatContainer, MessageList, Message, ChatInput
  - Why: Core functionality for conversational UI
  - Impact: Users can send messages and receive streaming AI responses

- **Anthropic Integration** - Claude API with tool use
  - `/api/chat` POST endpoint with streaming
  - Golf Okay concierge persona in system prompt
  - Tool definitions: show_courses, show_course_detail, show_fleet, show_about_us
  - Why: Enable AI-powered responses with generative UI triggers
  - Impact: AI can respond contextually and trigger component rendering

- **CourseCarousel Component** - First generative UI
  - CourseCard with 3D flip animation (Framer Motion)
  - Horizontal scroll carousel with navigation
  - Mock data: 4 Thai golf courses
  - Why: Demonstrate generative UI pattern
  - Impact: AI tool calls render interactive course browsing

- **Page Refactor** - Component extraction
  - Extracted Sidebar, Header, MainContent, GreetingState
  - ChatProvider wraps application
  - Conditional rendering: greeting vs chat state
  - Why: Better code organization and maintainability
  - Impact: Cleaner architecture, easier to extend

### Technical Details
- Dependencies: @anthropic-ai/sdk, ai, framer-motion, clsx, tailwind-merge
- Model: claude-sonnet-4-20250514
- Build: Next.js 16 Turbopack, successful production build
