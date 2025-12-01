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
import { PersistentActor } from '@/components/NeuralDots';

function PageContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [loading, setLoading] = useState(true);
  const { messages, isLoading } = useChatContext();

  const isChatting = messages.length > 0;

  const colors = {
    bg: theme === 'dark' ? 'bg-[#131314]' : 'bg-white',
    text: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
  };

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  // Determine actor state
  const actorState = loading ? 'loading' : isChatting ? 'chat' : 'hero';

  // Sidebar width for chat layout padding
  const sidebarWidth = isSidebarOpen ? 280 : 68;

  return (
    <div className={`relative min-h-screen w-full font-sans overflow-hidden ${colors.bg} ${colors.text}`}>
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

      {/* ===== 1.5 HEADER (Fixed on top, always visible when not loading) ===== */}
      {!loading && (
        <motion.div
          className="fixed top-0 right-0 z-[70]"
          style={{ left: sidebarWidth }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Header theme={theme} showLogo={!isChatting} />
        </motion.div>
      )}

      {/* ===== 2. HERO LAYER (Wallpaper - Viewport Centered, ignores sidebar) ===== */}
      <AnimatePresence>
        {!isChatting && !loading && (
          <motion.div
            key="hero-layer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center pointer-events-none"
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

      {/* ===== 3. CHAT LAYER (Document - Respects sidebar) ===== */}
      {isChatting && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col h-screen transition-all duration-300 relative z-[60]"
          style={{ paddingLeft: sidebarWidth }}
        >
          {/* Header spacer - actual header is fixed above */}
          <div className="h-16" />
          <div className="flex-1 overflow-y-auto">
            <MessageList />
          </div>
          <ChatInput />
        </motion.div>
      )}

      {/* ===== 4. THE CURTAIN (Black overlay during loading) ===== */}
      <motion.div
        className="fixed inset-0 bg-[#050505] z-40 pointer-events-none"
        initial={{ opacity: 1 }}
        animate={{ opacity: loading ? 1 : 0 }}
        transition={{ duration: 0.8, delay: loading ? 0 : 0.2 }}
      />

      {/* ===== 5. THE ACTOR (Viewport centered - Never unmounts) ===== */}
      <motion.div
        layout
        className={`fixed flex items-center justify-center pointer-events-none ${
          loading
            ? 'inset-0 z-50' // Center of VIEWPORT during loading (above curtain)
            : isChatting
            ? 'top-5 left-1/2 -translate-x-1/2 z-10' // Dynamic Island (BELOW header)
            : 'top-[28%] left-1/2 -translate-x-1/2 z-50' // Hero position
        }`}
        transition={{
          layout: {
            type: 'spring',
            stiffness: 50,
            damping: 20,
          },
        }}
      >
        <PersistentActor
          state={actorState}
          isThinking={isLoading}
          onLoadingComplete={handleLoadingComplete}
        />
      </motion.div>
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
