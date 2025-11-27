'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, Plus, MessageSquare, Settings, Gem,
  Activity, LayoutGrid, Moon, Sun, SquarePen
} from 'lucide-react';

const UI_CONFIG = {
  sidebarSection1: "Gems",
  sidebarSection2: "Chats",
  gems: [{ name: "Brainstormer" }, { name: "Prime CEO" }],
  recentChats: ["Prompt for Web Design", "Nano Banana Launch"]
};

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

export function Sidebar({ isOpen, onToggle, theme, onThemeChange }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setIsSettingsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const colors = {
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    text: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
    sidebarBg: theme === 'dark' ? 'bg-[#1E1F20]' : 'bg-[#F0F4F9]',
    hoverBg: theme === 'dark' ? 'hover:bg-[#282A2C]' : 'hover:bg-[#E2E6EA]',
    activeBg: theme === 'dark' ? 'bg-[#282A2C]' : 'bg-[#D3E3FD]',
    popoverBg: theme === 'dark' ? 'bg-[#1E1F20]' : 'bg-[#F0F4F9]',
    borderColor: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    bg: theme === 'dark' ? 'bg-[#131314]' : 'bg-white',
  };

  return (
    <aside
      className={`flex-shrink-0 h-full flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative z-30 ${colors.sidebarBg} ${isOpen ? 'w-[280px]' : 'w-[68px]'}`}
    >
      <div className="flex flex-col h-full whitespace-nowrap">
        {/* Top Section */}
        <div className="pt-4 px-4 flex flex-col gap-6">
          <button
            onClick={onToggle}
            className={`p-2 rounded-full transition-colors self-start ${colors.hoverBg} ${colors.textMuted}`}
          >
            <Menu size={20} />
          </button>
          <div className="transition-all duration-300 h-12">
            {isOpen ? (
              <button className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors w-fit text-sm font-medium shadow-sm ${theme === 'dark' ? 'bg-[#1A1A1C] text-gray-300 hover:bg-[#282A2C]' : 'bg-[#DDE3EA] text-gray-700'}`}>
                <Plus size={18} className={colors.textMuted} />
                <span className="truncate">New chat</span>
              </button>
            ) : (
              <button className={`p-3 rounded-full transition-colors ${theme === 'dark' ? 'bg-[#282A2C] text-gray-300' : 'bg-[#DDE3EA] text-gray-700'}`}>
                <SquarePen size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto pr-2 mt-4 px-4 custom-scrollbar transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="mb-6">
            <h3 className={`text-xs font-medium mb-3 px-3 uppercase tracking-wider ${colors.textMuted}`}>
              {UI_CONFIG.sidebarSection1}
            </h3>
            {UI_CONFIG.gems.map((gem, idx) => (
              <button key={idx} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors group ${colors.hoverBg}`}>
                <div className="w-6 h-6 rounded bg-purple-900/50 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Gem size={14} />
                </div>
                <div className={`flex-1 truncate text-sm group-hover:${colors.text}`}>{gem.name}</div>
              </button>
            ))}
          </div>
          <div>
            <h3 className={`text-xs font-medium mb-3 px-3 uppercase tracking-wider ${colors.textMuted}`}>
              {UI_CONFIG.sidebarSection2}
            </h3>
            {UI_CONFIG.recentChats.map((chat, idx) => (
              <button key={idx} className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors group ${colors.hoverBg}`}>
                <MessageSquare size={16} className={`${colors.textMuted} flex-shrink-0`} />
                <span className={`flex-1 truncate text-sm ${colors.textMuted} group-hover:${colors.text}`}>{chat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="mt-auto pb-4 px-2 relative flex flex-col items-center" ref={settingsRef}>
          {isSettingsOpen && (
            <div className={`absolute bottom-12 left-4 w-[260px] translate-x-4 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden py-2 border ${colors.popoverBg} ${colors.borderColor} z-50 animate-in fade-in slide-in-from-bottom-4 duration-200`}>
              <MenuItem icon={<Activity size={18} />} label="Activity" colors={colors} />
              <MenuItem icon={<LayoutGrid size={18} />} label="Apps" colors={colors} />
              <div className="relative group">
                <button
                  onClick={() => onThemeChange(theme === 'dark' ? 'light' : 'dark')}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm ${colors.hoverBg} ${colors.text}`}
                >
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                    <span>Theme</span>
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{theme}</span>
                </button>
              </div>
              <div className="px-4 py-2 border-t border-gray-700/30 mt-2">
                <div className={`flex items-center gap-2 text-xs font-medium ${colors.text}`}>
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Saphan Sung, Bangkok
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-sm ${colors.hoverBg} ${isSettingsOpen ? colors.activeBg : ''} ${colors.textMuted} ${!isOpen && 'justify-center'}`}
          >
            <Settings size={20} />
            {isOpen && <span>Settings & help</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

const MenuItem = ({ icon, label, colors }: { icon: React.ReactNode, label: string, colors: { hoverBg: string; text: string } }) => (
  <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${colors.hoverBg} ${colors.text}`}>
    {icon}<span>{label}</span>
  </button>
);
