'use client';

import React, { useState, KeyboardEvent } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { Send, Plus, Mic } from 'lucide-react';

interface ChatInputProps {
  className?: string;
  variant?: 'default' | 'centered';
}

export function ChatInput({ className, variant = 'default' }: ChatInputProps) {
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
        'w-full mx-auto rounded-full px-4 transition-all duration-200 border border-transparent relative flex items-center gap-3',
        variant === 'centered' ? 'bg-[#1E1F20] h-[56px] max-w-2xl' : 'bg-[#1E1F20] h-[64px] max-w-3xl',
        isFocused
          ? 'shadow-lg ring-1 ring-gray-400/20 bg-[#282A2C]'
          : 'bg-[#1E1F20]'
      )}>
        <button
          className="p-2 rounded-full bg-[#282A2C] hover:bg-[#3a3c3e] text-gray-400 transition-colors flex-shrink-0"
        >
          <Plus size={20} />
        </button>

        <input
          type="text"
          placeholder="Ask me anything about golf in Thailand..."
          className="flex-1 bg-transparent text-base outline-none text-gray-200 placeholder-gray-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />

        <button className="p-2 rounded-full hover:bg-[#282A2C] text-gray-400 transition-colors flex-shrink-0">
          <Mic size={20} />
        </button>

        {input && (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'p-2 rounded-full text-white transition-colors flex-shrink-0',
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
  );
}
