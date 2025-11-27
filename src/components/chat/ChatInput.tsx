'use client';

import React, { useState, KeyboardEvent } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { Send, Plus, Mic } from 'lucide-react';

interface ChatInputProps {
  className?: string;
}

export function ChatInput({ className }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { sendMessage, isLoading } = useChatContext();

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('p-4', className)}>
      <div className={cn(
        'w-full max-w-3xl mx-auto rounded-3xl p-3 h-[72px] transition-all duration-200 border border-transparent relative',
        isFocused
          ? 'shadow-lg ring-1 ring-gray-400/20 bg-[#282A2C]'
          : 'bg-[#1E1F20]'
      )}>
        <div className="flex items-center gap-3 h-full">
          <button
            className="p-2 rounded-full bg-[#282A2C] hover:bg-[#3a3c3e] text-gray-400 transition-colors flex-shrink-0"
          >
            <Plus size={20} />
          </button>

          <input
            type="text"
            placeholder="Enter a prompt for golfokay"
            className="flex-1 bg-transparent text-lg outline-none text-gray-200 placeholder-gray-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />

          <div className="flex items-center gap-2 flex-shrink-0">
            <button className="p-2 rounded-full hover:bg-[#282A2C] text-gray-400 transition-colors">
              <Mic size={20} />
            </button>
            {input && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className={cn(
                  'p-2 rounded-full text-white transition-colors',
                  isLoading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600'
                )}
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
