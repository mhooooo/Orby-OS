'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatProvider, useChatContext } from '@/context/ChatContext';
import { ChatHistoryProvider } from '@/context/ChatHistoryContext';
import { ToastProvider } from '@/context/ToastContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MessageList, ChatInput } from '@/components/chat';
import { GreetingStateContent } from '@/components/GreetingState';
import { MorphingAvatar } from '@/components/MorphingAvatar';

function PageContent() {
  // Sidebar starts COLLAPSED during intro, expands after loading completes
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState(true);
  const { messages, isLoading } = useChatContext();

  const isChatting = messages.length > 0;

  const colors = {
    bg: theme === 'dark' ? 'bg-[#131314]' : 'bg-white',
    text: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
  };

  // When intro animation finishes, expand the sidebar
  const handleIntroComplete = useCallback(() => {
    setLoading(false);
    setIsSidebarOpen(true); // Trigger sidebar expansion
  }, []);

  // Sidebar width for layout calculations
  const sidebarWidth = isSidebarOpen ? 280 : 68;

  return (
    <div className={`flex h-screen w-full font-sans overflow-hidden bg-[#0a0a0a] ${colors.text}`}>
      <style jsx global>{`
        @keyframes golfRoll {
          0% { transform: translate(-40px, -40px) rotate(-180deg); opacity: 0; }
          40% { transform: translate(0px, 0px) rotate(0deg); opacity: 1; }
          60% { transform: translate(0px, -5px) rotate(-10deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        .animate-golf-ball {
          animation: golfRoll 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
          transform-origin: center bottom;
        }
        .enter-stage { opacity: 0; transform: translateY(10px); transition: all 0.5s ease-out; }
        .enter-stage.show { opacity: 1; transform: translateY(0); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* ===== 1. SIDEBAR (Fixed on left, z-20) ===== */}
      <motion.div
        className="fixed left-0 top-0 h-full z-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: loading ? 0 : 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          onThemeChange={setTheme}
        />
      </motion.div>

      {/* ===== 2. MAIN CONTENT AREA (Reference point for avatar) ===== */}
      {/* Background is on <main> so it shifts with content when sidebar expands */}
      <main
        className={`relative flex-1 flex flex-col min-w-0 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${colors.bg}`}
        style={{ marginLeft: sidebarWidth }}
      >
        {/* ===== 2.0 AMBIENT GLOW (Moves with content area) ===== */}
        {!loading && !isChatting && (
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[90vw] max-w-[800px] h-[60vh] bg-gradient-to-b from-purple-500/20 via-orange-500/10 to-transparent rounded-full blur-[150px] opacity-50 pointer-events-none z-0" />
        )}

        {/* ===== 2.1 HEADER (Fixed on top of content area) ===== */}
        {!loading && (
          <motion.div
            className="absolute top-0 left-0 right-0 z-[70]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Header theme={theme} showLogo={!isChatting} />
          </motion.div>
        )}

        {/* ===== 2.2 THE AVATAR (Centered in main content area) ===== */}
        {/* Uses absolute positioning so it centers relative to <main>, not viewport */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
          <MorphingAvatar
            isChatting={isChatting}
            isThinking={isLoading || loading}
            onLoadingComplete={handleIntroComplete}
          />
        </div>

        {/* ===== 2.3 HERO LAYER ===== */}
        <AnimatePresence>
          {!isChatting && !loading && (
            <motion.div
              key="hero-layer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
            >
              {/* Re-enable pointer events for interactive content */}
              <div className="pointer-events-auto flex flex-col items-center w-full max-w-3xl px-4">
                {/* Space for the actor above */}
                <div className="h-32 mb-6" />

                {/* Hero content from GreetingState */}
                <GreetingStateContent />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== 2.4 CHAT LAYER ===== */}
        {isChatting && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col h-full relative z-[60]"
          >
            {/* Header spacer */}
            <div className="h-16" />
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <MessageList />
            </div>
            <ChatInput />
          </motion.div>
        )}

        {/* ===== 2.5 THE CURTAIN (Black overlay during loading) ===== */}
        <motion.div
          className="absolute inset-0 bg-[#050505] z-40 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: loading ? 1 : 0 }}
          transition={{ duration: 0.8, delay: loading ? 0 : 0.2 }}
        />
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <ChatHistoryProvider>
        <ChatProvider>
          <PageContent />
        </ChatProvider>
      </ChatHistoryProvider>
    </ToastProvider>
  );
}
