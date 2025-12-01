'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, Settings, Moon, Sun, ChevronRight,
  LayoutGrid, Activity, HelpCircle, MessageCircle, Globe,
  Trash2, FileText, MapPin, Plus
} from 'lucide-react';
import Image from 'next/image';
import { useChatContext } from '@/context/ChatContext';
import { useChatHistoryContext } from '@/context/ChatHistoryContext';
import { useAuth } from '@/hooks/useAuth';
import { useSavedCourses } from '@/hooks/useSavedCourses';
import { useItineraryDrafts } from '@/hooks/useItineraryDrafts';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

// Helper to group chats by date
function groupChatsByDate(chats: Array<{ id: string; title: string | null; updated_at: string }>) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  const groups: { label: string; chats: typeof chats }[] = [
    { label: 'Today', chats: [] },
    { label: 'Yesterday', chats: [] },
    { label: 'Previous 7 Days', chats: [] },
    { label: 'Previous 30 Days', chats: [] },
    { label: 'Older', chats: [] },
  ];

  chats.forEach(chat => {
    const chatDate = new Date(chat.updated_at);
    if (chatDate >= today) {
      groups[0].chats.push(chat);
    } else if (chatDate >= yesterday) {
      groups[1].chats.push(chat);
    } else if (chatDate >= sevenDaysAgo) {
      groups[2].chats.push(chat);
    } else if (chatDate >= thirtyDaysAgo) {
      groups[3].chats.push(chat);
    } else {
      groups[4].chats.push(chat);
    }
  });

  return groups.filter(g => g.chats.length > 0);
}

export function Sidebar({ isOpen, onToggle, theme, onThemeChange }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMyGolfExpanded, setIsMyGolfExpanded] = useState(true);
  const [isPlansExpanded, setIsPlansExpanded] = useState(true);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { sendMessage, clearMessages, loadChat, setCurrentChatId, currentChatId } = useChatContext();
  const { chats, createChat, deleteChat, setCurrentChatId: setHistoryChatId } = useChatHistoryContext();
  const { user } = useAuth();
  const { savedCourses, unsaveCourse } = useSavedCourses();
  const { drafts, deleteDraft } = useItineraryDrafts();

  // Group chats by date
  const groupedChats = groupChatsByDate(chats);

  // Handle creating a new chat
  const handleNewChat = async () => {
    clearMessages();
    setCurrentChatId(null);
    const chatId = await createChat();
    if (chatId) {
      setCurrentChatId(chatId);
    }
  };

  // Handle selecting a chat from history
  const handleSelectChat = async (chatId: string) => {
    // Use loadChat from ChatContext - it handles fetching messages and setting state
    const success = await loadChat(chatId);
    if (success) {
      // Also update the ChatHistory context's current chat ID for highlighting
      setHistoryChatId(chatId);
    }
  };

  // Handle deleting a chat
  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await deleteChat(chatId);
    if (success && currentChatId === chatId) {
      clearMessages();
      setCurrentChatId(null);
    }
  };

  // Handle clicking a saved course
  const handleSavedCourseClick = (courseName: string) => {
    sendMessage(`I want to book ${courseName}`);
  };

  // Handle clicking a draft/plan
  const handlePlanClick = (draft: { id: string; name?: string | null; preview: { region?: string | null } }) => {
    sendMessage(`Continue planning my ${draft.name || draft.preview.region || 'golf'} trip`);
  };

  // Fetch user location from IP
  useEffect(() => {
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        if (data.city && data.country_name) {
          setUserLocation(`${data.city}, ${data.country_name}`);
        }
      })
      .catch(() => setUserLocation(null));
  }, []);

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
    // TRANSPARENT SIDEBAR - let background flow through
    sidebarBg: theme === 'dark' ? 'bg-transparent' : 'bg-white/80 backdrop-blur-xl',
    hoverBg: theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-black/5',
    activeBg: theme === 'dark' ? 'bg-white/5' : 'bg-black/5',
    popoverBg: theme === 'dark' ? 'bg-[#1E1F20]' : 'bg-[#F0F4F9]',
    borderColor: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    cardBg: theme === 'dark' ? 'bg-[#282A2C]' : 'bg-white',
    cardHover: theme === 'dark' ? 'hover:bg-[#323436]' : 'hover:bg-gray-50',
  };

  return (
    <aside
      className={`flex-shrink-0 h-full flex flex-col transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] relative z-30 border-r border-white/5 ${colors.sidebarBg} ${isOpen ? 'w-[280px]' : 'w-[68px]'}`}
    >
      <div className="flex flex-col h-full whitespace-nowrap">
        {/* Top Section */}
        <div className="pt-4 px-4 flex flex-col gap-3">
          <button
            onClick={onToggle}
            className={`p-2 rounded-full transition-colors self-start ${colors.hoverBg} ${colors.textMuted}`}
          >
            <Menu size={20} />
          </button>

          {/* New Chat Button - Subtle Ghost (Concierge doesn't shout) */}
          {isOpen ? (
            <button
              onClick={handleNewChat}
              className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group px-2 py-3"
              title="New Chat"
            >
              <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 border border-white/5 group-hover:border-white/20 transition-all">
                <Plus size={18} />
              </div>
              <span className="text-sm font-medium tracking-wide">New Chat</span>
            </button>
          ) : (
            <button
              onClick={handleNewChat}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all text-gray-400 hover:text-white"
              title="New Chat"
            >
              <Plus size={18} />
            </button>
          )}
        </div>

        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto mt-4 px-4 custom-scrollbar transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

          {/* My Golf Section - Mini-Tickets */}
          {(savedCourses.length > 0 || !user) && (
            <div className="mb-6">
              <button
                onClick={() => setIsMyGolfExpanded(!isMyGolfExpanded)}
                className="flex items-center gap-2 w-full text-left px-1 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500"
              >
                <span className="flex-1">MY GOLF</span>
                <ChevronRight
                  size={12}
                  className={`transition-transform duration-200 ${isMyGolfExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {isMyGolfExpanded && (
                <div className="mt-2 space-y-2">
                  {savedCourses.length === 0 ? (
                    <div className="text-xs text-gray-500 px-1">
                      {user ? 'No saved courses yet' : 'Sign in to save courses'}
                    </div>
                  ) : (
                    savedCourses.slice(0, 5).map((saved) => (
                      <div
                        key={saved.id}
                        onClick={() => handleSavedCourseClick(saved.courses?.name || 'this course')}
                        className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer group"
                      >
                        {/* Course Image or Placeholder - Desaturated to not fight orange pills */}
                        <div className="w-10 h-10 rounded bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {saved.courses?.hero_image ? (
                            <Image
                              src={saved.courses.hero_image}
                              alt={saved.courses.name || 'Course'}
                              width={40}
                              height={40}
                              className="object-cover w-full h-full opacity-50 grayscale-[30%] group-hover:opacity-80 group-hover:grayscale-0 transition-all"
                            />
                          ) : (
                            <MapPin size={16} className="text-gray-500 group-hover:text-orange-400 transition-colors" />
                          )}
                        </div>

                        {/* Course Info */}
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-gray-200 truncate">
                            {saved.courses?.name || 'Course'}
                          </div>
                          <div className="text-[10px] text-orange-400 font-mono">
                            {new Date(saved.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>

                        {/* Remove button on hover */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            unsaveCourse(saved.course_id);
                          }}
                          className="p-1 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Plans Section - Mini-Tickets */}
          {drafts.length > 0 && (
            <div className="mb-6">
              <button
                onClick={() => setIsPlansExpanded(!isPlansExpanded)}
                className="flex items-center gap-2 w-full text-left px-1 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500"
              >
                <span className="flex-1">TRIP PLANS</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400">
                  {drafts.length}
                </span>
                <ChevronRight
                  size={12}
                  className={`transition-transform duration-200 ${isPlansExpanded ? 'rotate-90' : ''}`}
                />
              </button>

              {isPlansExpanded && (
                <div className="mt-2 space-y-2">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      onClick={() => handlePlanClick(draft)}
                      className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5 hover:border-orange-500/50 transition-all cursor-pointer group"
                    >
                      {/* Plan Icon/Placeholder */}
                      <div className="w-10 h-10 rounded bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-purple-400" />
                      </div>

                      {/* Plan Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-gray-200 truncate">
                          {draft.name || `${draft.preview.region || 'Golf'} Trip`}
                        </div>
                        <div className="text-[10px] text-orange-400 font-mono">
                          {new Date(draft.updated_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>

                      {/* Remove button on hover */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDraft(draft.id);
                        }}
                        className="p-1 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} className="text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Chat History Section - Grouped by Date */}
          <div className="mb-4">
            <div className="px-1 py-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              HISTORY
            </div>

            {groupedChats.length === 0 ? (
              <div className="text-xs text-gray-500 px-1">
                No chat history yet
              </div>
            ) : (
              <div className="space-y-4">
                {groupedChats.map((group) => (
                  <div key={group.label}>
                    <div className="text-[10px] uppercase tracking-widest text-gray-500 px-1 py-1 mb-1">
                      {group.label}
                    </div>
                    <div className="space-y-1">
                      {group.chats.map((chat) => (
                        <div
                          key={chat.id}
                          onClick={() => handleSelectChat(chat.id)}
                          className={`relative flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all group ${
                            currentChatId === chat.id
                              ? 'bg-white/5 border-l-2 border-orange-500'
                              : 'hover:bg-white/5 border-l-2 border-transparent hover:border-orange-500/30'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm truncate ${
                                currentChatId === chat.id ? 'text-gray-200 font-medium' : 'text-gray-400'
                              }`}
                            >
                              {chat.title || 'New conversation'}
                            </div>
                          </div>
                          <button
                            onClick={(e) => handleDeleteChat(chat.id, e)}
                            className="p-1 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Settings & Help */}
        <div className="mt-auto pb-4 px-2 relative flex flex-col items-center" ref={settingsRef}>
          {isSettingsOpen && (
            <div className={`absolute bottom-0 left-full ml-2 w-[260px] rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden py-2 border ${colors.popoverBg} ${colors.borderColor} z-50 animate-in fade-in slide-in-from-left-2 duration-200`}>
              {/* Settings Section */}
              <div className={`px-4 py-1.5 text-xs font-medium uppercase tracking-wider ${colors.textMuted}`}>
                Settings
              </div>
              <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${colors.hoverBg} ${colors.text}`}>
                <Activity size={18} />
                <span>Activity</span>
              </button>
              <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${colors.hoverBg} ${colors.text}`}>
                <LayoutGrid size={18} />
                <span>Connected Apps</span>
              </button>
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

              {/* Help Section */}
              <div className={`px-4 py-1.5 mt-2 text-xs font-medium uppercase tracking-wider border-t ${colors.borderColor} ${colors.textMuted}`}>
                Help
              </div>
              <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${colors.hoverBg} ${colors.text}`}>
                <HelpCircle size={18} />
                <span>Help Center</span>
              </button>
              <button className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm ${colors.hoverBg} ${colors.text}`}>
                <MessageCircle size={18} />
                <span>Contact Us</span>
              </button>

              {/* Location Footer */}
              <div className={`px-4 py-2.5 border-t mt-2 ${colors.borderColor}`}>
                <div className={`flex items-center gap-2 text-xs ${colors.textMuted}`}>
                  <Globe size={12} />
                  <span>{userLocation || 'Detecting location...'}</span>
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
