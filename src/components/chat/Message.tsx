'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Message as MessageType, ToolCall } from '@/types/chat';
import { cn } from '@/lib/utils';
import { CourseCarousel } from '@/components/generative-ui/CourseCarousel';
import { CourseDetailCard } from '@/components/generative-ui/CourseDetailCard';
import { FleetCard } from '@/components/generative-ui/FleetCard';
import { AboutCard } from '@/components/generative-ui/AboutCard';
import {
  RegionPicker,
  VibePicker,
  TransportPicker,
  GroupSizePicker,
  DaysPicker,
} from '@/components/generative-ui/pickers';
import { ItineraryBuilder } from '@/components/generative-ui/ItineraryBuilder';
import { TourShowcase } from '@/components/generative-ui/TourShowcase';
import { ServiceBento } from '@/components/generative-ui/ServiceBento';
import { Course } from '@/types/course';
import AuthGateModal from '@/components/generative-ui/AuthGateModal';
import InquiryForm from '@/components/generative-ui/InquiryForm';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

// Typing effect component for AI messages
function TypewriterText({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    if (!text) return;

    // Reset refs and state for new text
    indexRef.current = 0;

    const typeNextChar = () => {
      if (indexRef.current < text.length) {
        setDisplayedText(text.slice(0, indexRef.current + 1));
        indexRef.current++;
        // Variable speed: faster for spaces, slower for punctuation
        const char = text[indexRef.current - 1];
        const delay = char === ' ' ? 10 : ['.', '!', '?', ','].includes(char) ? 80 : 20;
        setTimeout(typeNextChar, delay);
      } else {
        setIsComplete(true);
        onComplete?.();
      }
    };

    // Start typing after a brief pause
    const timeout = setTimeout(typeNextChar, 100);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]); // onComplete intentionally omitted to avoid re-triggering

  return (
    <span>
      {displayedText}
      {!isComplete && <span className="inline-block w-0.5 h-4 bg-gray-400 ml-0.5 animate-pulse" />}
    </span>
  );
}

interface MessageProps {
  message: MessageType;
}

// Type guards for tool results
interface ShowCoursesResult {
  courses: Course[];
}

interface ShowCourseDetailResult {
  course: Course | null;
}

interface FleetData {
  vehicles: {
    id: string;
    type: string;
    model: string;
    capacity: number;
    luggage: number;
    amenities: string[];
    pricePerDay: number;
    image: string;
  }[];
  notes: string;
}

interface AboutData {
  company: string;
  tagline: string;
  founded: number;
  yearsExperience: number;
  founders: { name: string; role: string; expertise: string }[];
  certifications: string[];
  stats: {
    coursesPartner: number;
    happyGolfers: number;
    averageRating: number;
  };
  description: string;
}

interface AuthGateResult {
  type: 'auth_gate';
  reason: 'save_course' | 'save_itinerary' | 'book_intent';
}

interface InquiryFormResult {
  type: 'inquiry_form';
  context: string | null;
}

// Wrapper component to manage auth gate modal state
function AuthGateFromTool({ result }: { result: AuthGateResult }) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <AuthGateModal
      isOpen={true}
      onClose={() => setIsDismissed(true)}
      triggerReason={result.reason}
    />
  );
}

// Wrapper component to manage inquiry form state
function InquiryFormFromTool() {
  const [isCompleted, setIsCompleted] = useState(false);

  if (isCompleted) return null;

  return (
    <InquiryForm
      onSuccess={() => setIsCompleted(true)}
      onClose={() => setIsCompleted(true)}
    />
  );
}

function renderToolComponent(tool: ToolCall, onAuthRequired?: () => void) {
  // Wrap each component in ErrorBoundary for isolation
  const wrapWithErrorBoundary = (component: React.ReactNode) => (
    <ErrorBoundary key={tool.id}>
      {component}
    </ErrorBoundary>
  );

  switch (tool.name) {
    case 'show_courses': {
      const result = tool.result as ShowCoursesResult | undefined;
      if (result?.courses && result.courses.length > 0) {
        return wrapWithErrorBoundary(
          <CourseCarousel courses={result.courses} onAuthRequired={onAuthRequired} />
        );
      }
      return wrapWithErrorBoundary(
        <CourseCarousel onAuthRequired={onAuthRequired} />
      );
    }

    case 'show_course_detail': {
      const result = tool.result as ShowCourseDetailResult | undefined;
      if (result?.course) {
        return wrapWithErrorBoundary(
          <CourseDetailCard course={result.course} />
        );
      }
      return wrapWithErrorBoundary(
        <div className="rounded-xl bg-[#1E1F20] p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Course not found</p>
        </div>
      );
    }

    case 'show_fleet': {
      const result = tool.result as FleetData | undefined;
      if (result) {
        return wrapWithErrorBoundary(
          <FleetCard data={result} />
        );
      }
      return null;
    }

    case 'show_about_us': {
      const result = tool.result as AboutData | undefined;
      if (result) {
        return wrapWithErrorBoundary(
          <AboutCard data={result} />
        );
      }
      return null;
    }

    // Itinerary Builder wizard
    case 'start_itinerary_builder': {
      const input = tool.input as { region?: string } | undefined;
      const regionMap: Record<string, 'bangkok' | 'phuket' | 'hua_hin' | 'chiang_mai' | 'pattaya'> = {
        bangkok: 'bangkok',
        phuket: 'phuket',
        hua_hin: 'hua_hin',
        chiang_mai: 'chiang_mai',
        pattaya: 'pattaya',
      };
      const initialRegion = input?.region ? regionMap[input.region] : undefined;
      return wrapWithErrorBoundary(
        <ItineraryBuilder initialRegion={initialRegion} />
      );
    }

    // Individual pickers (for future segmented flow)
    case 'pick_region':
      return wrapWithErrorBoundary(<RegionPicker />);

    case 'pick_group_size':
      return wrapWithErrorBoundary(<GroupSizePicker />);

    case 'pick_days':
      return wrapWithErrorBoundary(<DaysPicker />);

    case 'pick_vibe':
      return wrapWithErrorBoundary(<VibePicker />);

    case 'pick_transport':
      return wrapWithErrorBoundary(<TransportPicker />);

    case 'start_tour':
      return wrapWithErrorBoundary(<TourShowcase />);

    case 'show_services':
      return wrapWithErrorBoundary(<ServiceBento />);

    case 'trigger_auth_gate': {
      const result = tool.result as AuthGateResult | undefined;
      if (result) {
        return wrapWithErrorBoundary(
          <AuthGateFromTool result={result} />
        );
      }
      return null;
    }

    case 'start_inquiry': {
      const result = tool.result as InquiryFormResult | undefined;
      if (result) {
        return wrapWithErrorBoundary(
          <InquiryFormFromTool />
        );
      }
      return null;
    }

    default:
      return wrapWithErrorBoundary(
        <div className="rounded-xl bg-[#1E1F20] p-4 border border-gray-800">
          <p className="text-xs text-gray-500">
            Component: {tool.name}
          </p>
        </div>
      );
  }
}

export function Message({ message, isLatest = false }: MessageProps & { isLatest?: boolean }) {
  const isUser = message.role === 'user';
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;
  const hasContent = !!message.content;

  // Show tools immediately if:
  // - Not the latest message, OR
  // - User message, OR
  // - No text content (just tool calls)
  // Use useMemo to derive initial state instead of useEffect
  const shouldShowToolsImmediately = !isLatest || isUser || !hasContent;
  const [showTools, setShowTools] = useState(shouldShowToolsImmediately);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleTypingComplete = () => {
    setShowTools(true);
  };

  const handleAuthRequired = () => {
    setShowAuthModal(true);
  };

  return (
    <div className="space-y-4">
      {/* Message bubble - only show if there's content */}
      {hasContent && (
        <div className={cn(
          'flex max-w-3xl mx-auto',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          {/* Text Content - inline width based on content */}
          <div className={cn(
            'max-w-[80%] px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-[#282A2C] text-gray-200'
              : 'bg-[#1E1F20] text-gray-200'
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {isUser || !isLatest ? (
                message.content
              ) : (
                <TypewriterText
                  text={message.content}
                  onComplete={handleTypingComplete}
                />
              )}
            </p>
          </div>
        </div>
      )}

      {/* Generative UI components - rendered after typing completes */}
      {hasToolCalls && showTools && (
        <div className="w-full max-w-5xl mx-auto space-y-4">
          {message.toolCalls!.map((tool) => renderToolComponent(tool, handleAuthRequired))}
        </div>
      )}

      {/* Auth Gate Modal */}
      <AuthGateModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerReason="save_course"
      />
    </div>
  );
}
