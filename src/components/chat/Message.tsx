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

  return (
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

      {/* Content */}
      <div className={cn(
        'flex-1 px-4 py-3 rounded-2xl',
        isUser
          ? 'bg-[#282A2C] text-gray-200'
          : 'bg-[#1E1F20] text-gray-200'
      )}>
        {/* Text content */}
        {message.content && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}

        {/* Tool call components - generative UI */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="mt-3 space-y-2">
            {message.toolCalls.map((tool) => {
              // Render specific components based on tool name
              if (tool.name === 'show_courses') {
                return <CourseCarousel key={tool.id} />;
              }

              // Fallback for unrecognized tools
              return (
                <div
                  key={tool.id}
                  data-tool={tool.name}
                  data-input={JSON.stringify(tool.input)}
                  className="rounded-xl bg-[#131314] p-4 border border-gray-800"
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
    </div>
  );
}
