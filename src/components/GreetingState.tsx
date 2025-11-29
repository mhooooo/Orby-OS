'use client';

import React, { useState, useRef, useLayoutEffect, useEffect } from 'react';
import { ChatInput } from './chat/ChatInput';
import { Compass, Flag, Sparkles, ChevronDown, ConciergeBell } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';
import { GolfOkayIcon } from './icons/GolfOkayIcon';

interface SuggestedAction {
  icon: React.ElementType;
  label: string;
  subPrompts?: string[];
  directPrompt?: string; // For actions that trigger immediately without dropdown
  highlight?: boolean; // For special styling
}

const SUGGESTED_ACTIONS: SuggestedAction[] = [
  {
    icon: Compass,
    label: "Plan a trip",
    subPrompts: [
      "Help me plan my first golf trip to Thailand",
      "I have 5 days, what can I see?",
      "Plan a trip for 4 golfers in March"
    ]
  },
  {
    icon: Flag,
    label: "Explore courses",
    subPrompts: [
      "What are the top courses for first-timers?",
      "Show me the most scenic courses",
      "Which courses are closest to Bangkok?"
    ]
  },
  {
    icon: ConciergeBell,
    label: "Our services",
    directPrompt: "What services do you offer?",
  },
  {
    icon: Sparkles,
    label: "Why Golf Okay?",
    directPrompt: "Show me everything Golf Okay has to offer",
    highlight: true, // Special styling for tour button
  },
];

interface GreetingStateContentProps {
  onIntroComplete?: () => void;
}

const TAGLINE = "We're passionate about golf and travel, and we want to share that passion with you";

export function GreetingStateContent({ onIntroComplete }: GreetingStateContentProps) {
  const [introPhase, setIntroPhase] = useState<'logo' | 'shrinking' | 'content'>('logo');
  const [contentVisible, setContentVisible] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [typedText, setTypedText] = useState('');
  const { sendMessage } = useChatContext();
  const hasInitialized = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Typing effect for tagline
  useEffect(() => {
    if (introPhase === 'logo' && typedText.length < TAGLINE.length) {
      const timeout = setTimeout(() => {
        setTypedText(TAGLINE.slice(0, typedText.length + 1));
      }, 25); // Speed of typing
      return () => clearTimeout(timeout);
    }
  }, [typedText, introPhase]);

  // Start typing after a short delay
  useEffect(() => {
    const startTyping = setTimeout(() => {
      setTypedText(TAGLINE[0]);
    }, 400);
    return () => clearTimeout(startTyping);
  }, []);

  // Intro animation sequence
  useLayoutEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;

      // Wait for typing to complete + small pause, then shrink
      // TAGLINE length * 25ms typing speed + 400ms initial delay + 500ms pause
      const typingDuration = TAGLINE.length * 25 + 400 + 800;

      const shrinkTimer = setTimeout(() => {
        setIntroPhase('shrinking');
      }, typingDuration);

      // Phase 2: After shrink animation (0.6s), show content
      const contentTimer = setTimeout(() => {
        setIntroPhase('content');
        onIntroComplete?.();
        // Small delay before fading in content
        setTimeout(() => setContentVisible(true), 100);
      }, typingDuration + 600);

      return () => {
        clearTimeout(shrinkTimer);
        clearTimeout(contentTimer);
      };
    }
  }, [onIntroComplete]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveChip(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleChipClick = (label: string) => {
    setActiveChip(activeChip === label ? null : label);
  };

  const handleSubPromptClick = (prompt: string) => {
    sendMessage(prompt);
    setActiveChip(null);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center w-full h-full relative overflow-hidden" onClick={() => setActiveChip(null)}>
      {/* Intro Logo Animation */}
      {introPhase !== 'content' && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center z-50 transition-all duration-600 ease-out
            ${introPhase === 'shrinking' ? 'opacity-0 scale-50 -translate-y-[40vh] -translate-x-[30vw]' : 'opacity-100 scale-100'}
          `}
        >
          <h1 className="text-8xl md:text-9xl lg:text-[10rem] font-medium tracking-tight text-gray-100 mb-6">
            golfokay
          </h1>
          <p className="text-lg md:text-xl text-gray-400 text-center max-w-lg px-4 h-14 flex items-center">
            <span>{typedText}</span>
            <span className="inline-block w-0.5 h-5 bg-gray-400 ml-1 animate-pulse" />
          </p>
        </div>
      )}

      {/* Main Content */}
      <div
        className={`w-full max-w-3xl mx-auto flex flex-col items-center justify-center -mt-20 transition-all duration-500
          ${introPhase === 'content' ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Greeting Area */}
        <div className="mb-8 text-left w-full max-w-2xl px-4">
          <div className={`flex items-center gap-4 transition-all duration-500 delay-100 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <GolfOkayIcon size={56} className="text-gray-100 flex-shrink-0" />
            <h2 className="text-5xl md:text-6xl font-medium text-gray-100 tracking-tight">
              Hi, there!
            </h2>
          </div>
        </div>

        {/* Centered Input */}
        <div className={`w-full px-4 transition-all duration-500 delay-200 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <ChatInput variant="centered" className="p-0" />
        </div>

        {/* Suggestion Chips */}
        <div className={`mt-6 flex flex-wrap justify-center gap-3 relative transition-all duration-500 delay-300 ${contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {SUGGESTED_ACTIONS.map((action, idx) => (
            <div key={idx} className="relative">
              {action.directPrompt ? (
                /* Direct action button - no dropdown */
                <button
                  onClick={() => sendMessage(action.directPrompt!)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${
                    action.highlight
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/30 hover:bg-orange-500/20 hover:border-orange-500/50'
                      : 'bg-[#1E1F20] text-gray-400 hover:text-gray-200 border-transparent hover:border-gray-700'
                  }`}
                >
                  <action.icon size={16} />
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ) : (
                /* Dropdown action button */
                <>
                  <button
                    onClick={() => handleChipClick(action.label)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all border ${activeChip === action.label
                        ? 'bg-[#282A2C] text-gray-200 border-gray-600'
                        : 'bg-[#1E1F20] text-gray-400 hover:text-gray-200 border-transparent hover:border-gray-700'
                      }`}
                  >
                    <action.icon size={16} />
                    <span className="text-sm font-medium">{action.label}</span>
                    {activeChip === action.label && <ChevronDown size={14} className="animate-in fade-in zoom-in" />}
                  </button>

                  {/* Dropdown Menu */}
                  {activeChip === action.label && action.subPrompts && (
                    <div
                      ref={dropdownRef}
                      className="absolute top-full left-0 mt-2 w-64 bg-[#1E1F20] border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                    >
                      {action.subPrompts.map((prompt, pIdx) => (
                        <button
                          key={pIdx}
                          onClick={() => handleSubPromptClick(prompt)}
                          className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-[#282A2C] hover:text-white transition-colors border-b border-gray-800/50 last:border-0"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
