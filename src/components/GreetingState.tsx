'use client';

import React, { useState, useRef, useLayoutEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

const SUGGESTED_PROMPTS = [
  "Show me championship courses in Bangkok",
  "Plan a 3-day golf trip to Phuket",
  "Compare green fees for weekend play",
  "Find courses with night golf",
];

export function GreetingStateContent() {
  const [hasLoaded, setHasLoaded] = useState(false);
  const { sendMessage } = useChatContext();
  const hasInitialized = useRef(false);

  useLayoutEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      // Use requestAnimationFrame to schedule the state update after paint
      requestAnimationFrame(() => {
        setHasLoaded(true);
      });
    }
  }, []);

  const handlePromptClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start pt-[10vh] px-4 w-full overflow-y-auto">
      <div className="w-full max-w-3xl mx-auto flex flex-col">
        {/* Greeting Area */}
        <div className="mb-10 text-left w-full pl-2">
          <div className={`mb-2 w-8 h-8 enter-stage ${hasLoaded ? 'show' : ''}`}>
            <Sparkles className="text-blue-400 w-full h-full animate-golf-ball" />
          </div>
          <h2
            className={`text-5xl md:text-6xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-red-400 tracking-tight enter-stage delay-100 ${hasLoaded ? 'show' : ''}`}
          >
            Hi, Tanyawit!
          </h2>
        </div>

        {/* Suggested Prompts */}
        <div className="w-full flex justify-center mb-8">
          <div className={`flex flex-wrap gap-3 w-fit max-w-2xl content-start enter-stage delay-300 ${hasLoaded ? 'show' : ''}`}>
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                className="px-6 py-3 rounded-full text-sm bg-[#1E1F20] hover:bg-[#282A2C] text-gray-400 hover:text-gray-200 transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-auto p-4 text-center text-xs text-gray-400">
          golfokay may display inaccurate info, including about people, so double-check its responses.
        </div>
      </div>
    </div>
  );
}
