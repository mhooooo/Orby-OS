'use client';

import React, { useState, KeyboardEvent } from 'react';
import { useChatContext } from '@/context/ChatContext';
import { cn } from '@/lib/utils';
import { Send, Plus, Mic, Loader2 } from 'lucide-react';

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
    <div className={cn('p-2 sm:p-4', className)}>
      <div className={cn(
        'w-full mx-auto rounded-full px-3 sm:px-4 transition-all duration-200 relative flex items-center gap-2 sm:gap-3',
        variant === 'centered'
          ? 'bg-white/10 backdrop-blur-xl border border-white/20 h-[52px] sm:h-[60px] max-w-2xl shadow-2xl'
          : 'bg-[#1E1F20] border border-transparent h-[52px] sm:h-[64px] max-w-3xl',
        isFocused
          ? variant === 'centered'
            ? 'ring-2 ring-orange-500/30 border-white/30'
            : 'shadow-lg ring-1 ring-gray-400/20 bg-[#282A2C]'
          : ''
      )}>
        <button
          className={cn(
            'p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0',
            variant === 'centered'
              ? 'bg-white/10 hover:bg-white/20 text-gray-300'
              : 'bg-[#282A2C] hover:bg-[#3a3c3e] text-gray-400'
          )}
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
        </button>

        <input
          type="text"
          placeholder="Ask me anything about golf in Thailand..."
          className={cn(
            'flex-1 bg-transparent text-sm sm:text-base outline-none',
            variant === 'centered'
              ? 'text-white placeholder-gray-400'
              : 'text-gray-200 placeholder-gray-500'
          )}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />

        <button className="p-1.5 sm:p-2 rounded-full hover:bg-[#282A2C] text-gray-400 transition-colors flex-shrink-0 hidden sm:flex">
          <Mic size={18} className="sm:w-5 sm:h-5" />
        </button>

        {(input || isLoading) && (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'p-1.5 sm:p-2 rounded-full text-white transition-colors flex-shrink-0',
              isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600'
            )}
          >
            {isLoading ? (
              <Loader2 size={16} className="sm:w-[18px] sm:h-[18px] animate-spin" />
            ) : (
              <Send size={16} className="sm:w-[18px] sm:h-[18px]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
