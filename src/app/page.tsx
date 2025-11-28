'use client';

import React, { useState } from 'react';
import { ChatProvider } from '@/context/ChatContext';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [introComplete, setIntroComplete] = useState(false);

  const colors = {
    bg: theme === 'dark' ? 'bg-[#131314]' : 'bg-white',
    text: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
  };

  return (
    <ChatProvider>
      <div className={`flex h-screen w-full font-sans overflow-hidden transition-colors duration-300 ${colors.bg} ${colors.text}`}>
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

        {/* SIDEBAR */}
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          onThemeChange={setTheme}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden">
          <Header theme={theme} showLogo={introComplete} />
          <MainContent onIntroComplete={() => setIntroComplete(true)} />
        </main>
      </div>
    </ChatProvider>
  );
}
