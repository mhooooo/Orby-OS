'use client';

import React from 'react';
import { Message as MessageType } from '@/types/chat';
import { cn } from '@/lib/utils';
import { User, Sparkles } from 'lucide-react';
import { CourseCarousel } from '@/components/generative-ui/CourseCarousel';

interface MessageProps {
  message: MessageType;
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
          {message.toolCalls!.map((tool) => {
            if (tool.name === 'show_courses') {
              return <CourseCarousel key={tool.id} />;
            }

            // Fallback for unrecognized tools
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
          })}
        </div>
      )}
    </div>
  );
}
