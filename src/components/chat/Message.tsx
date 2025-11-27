'use client';

import React from 'react';
import { Message as MessageType, ToolCall } from '@/types/chat';
import { cn } from '@/lib/utils';
import { User, Sparkles } from 'lucide-react';
import { CourseCarousel } from '@/components/generative-ui/CourseCarousel';
import { CourseDetailCard } from '@/components/generative-ui/CourseDetailCard';
import { FleetCard } from '@/components/generative-ui/FleetCard';
import { AboutCard } from '@/components/generative-ui/AboutCard';
import { Course } from '@/types/course';

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

function renderToolComponent(tool: ToolCall) {
  switch (tool.name) {
    case 'show_courses': {
      const result = tool.result as ShowCoursesResult | undefined;
      if (result?.courses && result.courses.length > 0) {
        return <CourseCarousel key={tool.id} courses={result.courses} />;
      }
      return <CourseCarousel key={tool.id} />;
    }

    case 'show_course_detail': {
      const result = tool.result as ShowCourseDetailResult | undefined;
      if (result?.course) {
        return <CourseDetailCard key={tool.id} course={result.course} />;
      }
      return (
        <div key={tool.id} className="rounded-xl bg-[#1E1F20] p-4 border border-gray-800">
          <p className="text-sm text-gray-400">Course not found</p>
        </div>
      );
    }

    case 'show_fleet': {
      const result = tool.result as FleetData | undefined;
      if (result) {
        return <FleetCard key={tool.id} data={result} />;
      }
      return null;
    }

    case 'show_about_us': {
      const result = tool.result as AboutData | undefined;
      if (result) {
        return <AboutCard key={tool.id} data={result} />;
      }
      return null;
    }

    default:
      return (
        <div
          key={tool.id}
          className="rounded-xl bg-[#1E1F20] p-4 border border-gray-800"
        >
          <p className="text-xs text-gray-500">
            Component: {tool.name}
          </p>
        </div>
      );
  }
}

export function Message({ message }: MessageProps) {
  const isUser = message.role === 'user';
  const hasToolCalls = message.toolCalls && message.toolCalls.length > 0;

  return (
    <div className="space-y-4">
      {/* Message bubble */}
      <div className={cn(
        'flex gap-3 max-w-3xl mx-auto',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}>
        {/* Avatar */}
        <div className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-blue-600' : 'bg-[#A4E600]'
        )}>
          {isUser ? (
            <User size={16} className="text-white" />
          ) : (
            <Sparkles size={16} className="text-black" />
          )}
        </div>

        {/* Text Content */}
        {message.content && (
          <div className={cn(
            'flex-1 px-4 py-3 rounded-2xl',
            isUser
              ? 'bg-[#282A2C] text-gray-200'
              : 'bg-[#1E1F20] text-gray-200'
          )}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          </div>
        )}
      </div>

      {/* Generative UI components - rendered outside bubble */}
      {hasToolCalls && (
        <div className="max-w-4xl mx-auto space-y-4">
          {message.toolCalls!.map((tool) => renderToolComponent(tool))}
        </div>
      )}
    </div>
  );
}
