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
        'w-full mx-auto rounded-input px-3 sm:px-4 transition-all duration-200 relative flex items-center gap-2 sm:gap-3',
        variant === 'centered'
          ? 'bg-surface-glass backdrop-blur-xl border border-white/20 h-[52px] sm:h-[60px] max-w-2xl shadow-glass'
          : 'bg-background-card border border-transparent h-[52px] sm:h-[64px] max-w-3xl',
        isFocused
          ? variant === 'centered'
            ? 'ring-2 ring-accent-coral/30 border-white/30'
            : 'shadow-lg ring-1 ring-white/10 bg-background-hover'
          : ''
      )}>
        {/* Plus button */}
        <button
          className={cn(
            'p-1.5 sm:p-2 rounded-full transition-colors flex-shrink-0',
            variant === 'centered'
              ? 'bg-white/10 hover:bg-white/20 text-text-secondary'
              : 'bg-background-hover hover:bg-white/10 text-text-muted'
          )}
        >
          <Plus size={18} className="sm:w-5 sm:h-5" />
        </button>

        {/* Input field */}
        <input
          type="text"
          placeholder="Ask me anything about golf in Thailand..."
          className={cn(
            'flex-1 bg-transparent text-sm sm:text-base outline-none',
            variant === 'centered'
              ? 'text-text-primary placeholder-text-muted'
              : 'text-text-primary placeholder-text-muted'
          )}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />

        {/* Mic button */}
        <button className="p-1.5 sm:p-2 rounded-full hover:bg-background-hover text-text-muted transition-colors flex-shrink-0 hidden sm:flex">
          <Mic size={18} className="sm:w-5 sm:h-5" />
        </button>

        {/* Send button - uses accent-coral */}
        {(input || isLoading) && (
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={cn(
              'p-1.5 sm:p-2 rounded-full text-text-primary transition-colors flex-shrink-0',
              isLoading
                ? 'bg-text-disabled cursor-not-allowed'
                : 'bg-accent-coral hover:bg-accent-coral/90'
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
