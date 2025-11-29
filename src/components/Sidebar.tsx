'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu, MapPin, Car, Info, Heart, Calendar, Plane,
  Settings, Moon, Sun, Flag, Compass, ChevronDown,
  Briefcase, Zap, Shield, Utensils, Hotel,
  LayoutGrid, Activity, HelpCircle, MessageCircle, Globe,
  X, Trash2
} from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { useSavedCourses } from '@/hooks/useSavedCourses';
import { useItineraryDrafts } from '@/hooks/useItineraryDrafts';

// Golf destinations in Thailand with their prompts
const DESTINATIONS = [
  { name: 'Bangkok', courseCount: 15, region: 'bangkok' },
  { name: 'Pattaya', courseCount: 12, region: 'pattaya' },
  { name: 'Hua Hin', courseCount: 8, region: 'hua_hin' },
  { name: 'Chiang Mai', courseCount: 6, region: 'chiang_mai' },
  { name: 'Phuket', courseCount: 5, region: 'phuket' },
  { name: 'Khao Yai', courseCount: 4, region: 'khao_yai' },
];

// GolfOkay services & navigation with prompts
const NAV_ITEMS = [
  { icon: Car, label: 'Fleet & Transport', prompt: 'What transport options do you have?' },
  { icon: Briefcase, label: 'Club Rentals', prompt: 'Tell me about club rental services' },
  { icon: Zap, label: 'Airport Fast-Track', prompt: 'Tell me about airport fast-track service' },
  { icon: Shield, label: 'Golf Insurance', prompt: 'Tell me about golf insurance options' },
  { icon: Utensils, label: 'Dining & Nightlife', prompt: 'What dining and nightlife options do you recommend?' },
  { icon: Hotel, label: 'Accommodations', prompt: 'What hotels do you recommend for golfers?' },
  { icon: Info, label: 'About Us', prompt: 'Tell me about Golf Okay' },
];


interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  theme: 'dark' | 'light';
  onThemeChange: (theme: 'dark' | 'light') => void;
}

export function Sidebar({ isOpen, onToggle, theme, onThemeChange }: SidebarProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCoursesExpanded, setIsCoursesExpanded] = useState(true);
  const [isSavedCoursesExpanded, setIsSavedCoursesExpanded] = useState(false);
  const [isItinerariesExpanded, setIsItinerariesExpanded] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const { sendMessage } = useChatContext();
  const { user } = useAuth();
  const { savedCourses, unsaveCourse } = useSavedCourses();
  const { drafts, deleteDraft } = useItineraryDrafts();

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

  const handlePlanTrip = () => {
    sendMessage('Help me plan a golf trip');
  };

  const handleDestinationClick = (destination: typeof DESTINATIONS[0]) => {
    sendMessage(`Show me golf courses in ${destination.name}`);
  };

  const handleNavItemClick = (item: typeof NAV_ITEMS[0]) => {
    sendMessage(item.prompt);
  };

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
    ctaBg: theme === 'dark' ? 'bg-[#282A2C]' : 'bg-[#DDE3EA]',
    ctaHover: theme === 'dark' ? 'hover:bg-[#323436]' : 'hover:bg-[#D0D4D8]',
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
              <button
                onClick={handlePlanTrip}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-colors w-full text-sm font-medium ${colors.ctaBg} ${colors.ctaHover} ${colors.text}`}
              >
                <Compass size={18} className={colors.textMuted} />
                <span className="truncate">Plan a Trip</span>
              </button>
            ) : (
              <button
                onClick={handlePlanTrip}
                className={`p-3 rounded-full transition-colors ${colors.ctaBg} ${colors.ctaHover} ${colors.text}`}
              >
                <Compass size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Content */}
        <div className={`flex-1 overflow-y-auto pr-2 mt-6 px-4 custom-scrollbar transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {/* Explore Section */}
          <div className="mb-8">
            <h3 className={`text-xs font-medium mb-3 px-3 uppercase tracking-wider ${colors.textMuted}`}>
              Explore
            </h3>

            {/* Courses with expandable destinations */}
            <div>
              <button
                onClick={() => setIsCoursesExpanded(!isCoursesExpanded)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${colors.hoverBg}`}
              >
                <Flag size={18} className={`${colors.textMuted} flex-shrink-0`} />
                <span className={`flex-1 truncate text-sm ${colors.text}`}>Courses</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                  {DESTINATIONS.reduce((sum, d) => sum + d.courseCount, 0)}
                </span>
                <ChevronDown
                  size={16}
                  className={`${colors.textMuted} transition-transform duration-200 ${isCoursesExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Destination sub-items */}
              <div className={`overflow-hidden transition-all duration-200 ${isCoursesExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="ml-4 mt-1 border-l border-gray-700/50 pl-2">
                  {DESTINATIONS.map((dest, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDestinationClick(dest)}
                      className={`flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg transition-colors group ${colors.hoverBg}`}
                    >
                      <MapPin size={14} className={`${colors.textMuted} flex-shrink-0`} />
                      <span className={`flex-1 truncate text-sm ${colors.textMuted}`}>{dest.name}</span>
                      <span className={`text-xs ${colors.textMuted}`}>{dest.courseCount}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Other nav items */}
            {NAV_ITEMS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleNavItemClick(item)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${colors.hoverBg}`}
              >
                <item.icon size={18} className={`${colors.textMuted} flex-shrink-0`} />
                <span className={`flex-1 truncate text-sm ${colors.text}`}>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Travel Wallet Section */}
          <div>
            <h3 className={`text-xs font-medium mb-3 px-3 uppercase tracking-wider ${colors.textMuted}`}>
              My Golf
            </h3>

            {/* Saved Courses - expandable */}
            <div>
              <button
                onClick={() => setIsSavedCoursesExpanded(!isSavedCoursesExpanded)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${colors.hoverBg}`}
              >
                <Heart size={18} className={`${savedCourses.length > 0 ? 'text-[#FF3B3B]' : colors.textMuted} flex-shrink-0`} />
                <span className={`flex-1 truncate text-sm ${colors.text}`}>Saved Courses</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${savedCourses.length > 0 ? 'bg-[#FF3B3B]/20 text-[#FF3B3B]' : `${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}`}>
                  {savedCourses.length}
                </span>
                {savedCourses.length > 0 && (
                  <ChevronDown
                    size={16}
                    className={`${colors.textMuted} transition-transform duration-200 ${isSavedCoursesExpanded ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {/* Saved courses list */}
              {savedCourses.length > 0 && (
                <div className={`overflow-hidden transition-all duration-200 ${isSavedCoursesExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="ml-4 mt-1 border-l border-gray-700/50 pl-2 max-h-48 overflow-y-auto">
                    {savedCourses.map((saved) => (
                      <div
                        key={saved.id}
                        className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors group ${colors.hoverBg}`}
                      >
                        <button
                          onClick={() => sendMessage(`Tell me more about ${saved.courses?.name || 'this course'}`)}
                          className="flex-1 truncate text-sm text-left"
                        >
                          <span className={colors.textMuted}>{saved.courses?.name || 'Unknown Course'}</span>
                        </button>
                        <button
                          onClick={() => unsaveCourse(saved.course_id)}
                          className="p-1 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* My Itineraries - expandable */}
            <div>
              <button
                onClick={() => setIsItinerariesExpanded(!isItinerariesExpanded)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${colors.hoverBg}`}
              >
                <Calendar size={18} className={`${drafts.length > 0 ? 'text-[#00D4FF]' : colors.textMuted} flex-shrink-0`} />
                <span className={`flex-1 truncate text-sm ${colors.text}`}>My Itineraries</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${drafts.length > 0 ? 'bg-[#00D4FF]/20 text-[#00D4FF]' : `${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}`}>
                  {drafts.length}
                </span>
                {drafts.length > 0 && (
                  <ChevronDown
                    size={16}
                    className={`${colors.textMuted} transition-transform duration-200 ${isItinerariesExpanded ? 'rotate-180' : ''}`}
                  />
                )}
              </button>

              {/* Itineraries list */}
              {drafts.length > 0 && (
                <div className={`overflow-hidden transition-all duration-200 ${isItinerariesExpanded ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="ml-4 mt-1 border-l border-gray-700/50 pl-2 max-h-48 overflow-y-auto">
                    {drafts.map((draft) => (
                      <div
                        key={draft.id}
                        className={`flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg transition-colors group ${colors.hoverBg}`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm truncate ${colors.textMuted}`}>
                            {draft.name || `${draft.preview.region || 'Trip'} - ${draft.preview.numberOfDays} days`}
                          </div>
                          <div className="text-xs text-gray-500">
                            {draft.preview.groupSize} golfers
                          </div>
                        </div>
                        <button
                          onClick={() => deleteDraft(draft.id)}
                          className="p-1 rounded hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} className="text-red-400" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Upcoming Trips - static for now */}
            <button className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors group ${colors.hoverBg}`}>
              <Plane size={18} className={`${colors.textMuted} flex-shrink-0`} />
              <span className={`flex-1 truncate text-sm ${colors.textMuted}`}>Upcoming Trips</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-600'}`}>
                0
              </span>
            </button>

            {/* Sign in prompt if not authenticated */}
            {!user && (
              <div className={`mt-3 mx-3 p-3 rounded-lg ${theme === 'dark' ? 'bg-[#282A2C]' : 'bg-gray-100'}`}>
                <p className={`text-xs ${colors.textMuted} mb-2`}>
                  Sign in to save courses and itineraries
                </p>
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
