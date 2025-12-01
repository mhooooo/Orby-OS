'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronDown, LogOut, Map, Compass, Car, Briefcase, Zap, Shield, Utensils } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useChatContext } from '@/context/ChatContext';

// Hero actions - primary discovery features
const DISCOVER_ACTIONS = [
  { icon: Map, label: 'Find a Course', subtitle: 'Interactive Map', prompt: 'Show me golf courses in Thailand' },
  { icon: Compass, label: 'Plan a Trip', subtitle: 'Build Your Itinerary', prompt: 'Help me plan a golf trip to Thailand' },
];

// Add-on services
const SERVICES = [
  { icon: Car, label: 'Fleet & Transport', prompt: 'What transport options do you have?' },
  { icon: Briefcase, label: 'Club Rentals', prompt: 'Tell me about club rental services' },
  { icon: Zap, label: 'Airport Fast-Track', prompt: 'Tell me about airport fast-track service' },
  { icon: Shield, label: 'Golf Insurance', prompt: 'Tell me about golf insurance options' },
  { icon: Utensils, label: 'Dining & Nightlife', prompt: 'What dining and nightlife options do you recommend?' },
];

interface HeaderProps {
  theme: 'dark' | 'light';
  showLogo?: boolean;
}

export function Header({ theme, showLogo = true }: HeaderProps) {
  const { user, loading, signIn, signOut } = useAuth();
  const { sendMessage } = useChatContext();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  // Derive user info from auth
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userAvatar = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setIsExploreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleActionClick = (prompt: string) => {
    sendMessage(prompt);
    setIsExploreOpen(false);
  };

  const colors = {
    text: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
    borderColor: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    bg: theme === 'dark' ? 'bg-[#131314]' : 'bg-white',
    hoverBg: theme === 'dark' ? 'hover:bg-[#282A2C]' : 'hover:bg-gray-100',
    popoverBg: theme === 'dark' ? 'bg-[#1E1F20]' : 'bg-white',
  };

  return (
    <header className="flex items-center justify-between p-4 z-[100] relative">
      <div className="flex items-center gap-3">
        <Image
          src="/golfokay-logo.svg"
          alt="Golf Okay"
          width={120}
          height={30}
          className={`transition-all duration-500 ${showLogo ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        />
      </div>

      <div className="flex items-center gap-4">
        {/* Explore Dropdown */}
        <div className="relative" ref={exploreRef}>
          <button
            onClick={() => setIsExploreOpen(!isExploreOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${colors.hoverBg} ${colors.text}`}
          >
            <span>Explore</span>
            <ChevronDown
              size={16}
              className={`transition-transform duration-200 ${isExploreOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Explore Popover */}
          {isExploreOpen && (
            <div className={`absolute top-12 right-0 w-[260px] rounded-2xl shadow-[0_10px_40px_-10px_rgba(255,255,255,0.05)] overflow-hidden border border-white/10 backdrop-blur-xl ${colors.popoverBg} z-50 animate-in fade-in zoom-in-95 duration-200`}>
              <div className="p-2">
                {/* Discover - Primary Actions */}
                <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 text-gray-500">
                  DISCOVER
                </div>
                {DISCOVER_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleActionClick(action.prompt)}
                    className="group flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all rounded-lg relative hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent hover:pl-4 border-l-2 border-l-transparent hover:border-l-[#FF6B35]"
                  >
                    <action.icon size={20} className="text-[#FF6B35] group-hover:brightness-110 transition-all" strokeWidth={1.5} />
                    <div>
                      <div className={`font-medium ${colors.text}`}>{action.label}</div>
                      <div className="text-xs text-gray-500">{action.subtitle}</div>
                    </div>
                  </button>
                ))}

                {/* Divider */}
                <div className="h-px bg-white/10 my-2 mx-3" />

                {/* Services - Secondary Actions */}
                <div className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 text-gray-500">
                  SERVICES
                </div>
                {SERVICES.map((service) => (
                  <button
                    key={service.label}
                    onClick={() => handleActionClick(service.prompt)}
                    className="group flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left transition-all hover:bg-gradient-to-r hover:from-white/5 hover:to-transparent hover:pl-4 border-l-2 border-l-transparent hover:border-l-[#FF6B35]"
                  >
                    <service.icon size={18} className="text-gray-500 group-hover:text-gray-300 transition-colors" strokeWidth={1.5} />
                    <span className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{service.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div className="relative" ref={profileRef}>
        {user && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors.borderColor} ${colors.textMuted} ${colors.bg}`}>
            PRO
          </span>
        )}

        {loading ? (
          <div className="w-10 h-10 rounded-full bg-gray-700 animate-pulse" />
        ) : user ? (
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px] hover:scale-105 transition-transform"
          >
            <Image src={userAvatar} alt="Profile" width={40} height={40} className="w-full h-full rounded-full" unoptimized />
          </button>
        ) : (
          <button
            onClick={signIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Sign In
          </button>
        )}

        {/* PROFILE POPOVER - BLACK CARD (Scaled down 20%) */}
        {isProfileOpen && user && (
          <div className="absolute top-14 right-0 w-[340px] z-50 animate-in fade-in zoom-in-95">
            {/* Black Card Member Card */}
            <div className="relative w-full h-[195px] bg-[#0a0a0a] rounded-xl border border-white/10 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Noise Texture Overlay */}
              <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'repeat',
                }}
              />

              {/* Close Button */}
              <button
                className="absolute top-4 right-4 text-white/40 hover:text-white/60 hover:bg-white/5 p-2 rounded-full cursor-pointer transition-all z-10"
                onClick={() => setIsProfileOpen(false)}
              >
                <X size={16} />
              </button>

              {/* Card Content - Scaled down padding */}
              <div className="relative h-full p-4 flex flex-col justify-between">
                {/* Top Row: Logo + Member Badge */}
                <div className="flex items-start justify-between">
                  <div className="text-[10px] font-bold tracking-[0.15em] text-white/60">
                    GOLFOKAY
                  </div>
                  <div className="text-[8px] font-bold tracking-[0.15em] px-1.5 py-0.5 rounded border border-[#D4AF37]/30 text-[#D4AF37]">
                    MEMBER
                  </div>
                </div>

                {/* Middle Row: Avatar + Name + QR */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Avatar with Gold Ring - Scaled down */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F4D03F] opacity-80 blur-[2px]" />
                      <div className="relative w-12 h-12 rounded-full bg-[#0a0a0a] p-[2px]">
                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#D4AF37]/50">
                          <Image
                            src={userAvatar}
                            alt="Profile"
                            width={44}
                            height={44}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      </div>
                    </div>

                    {/* Name + Email */}
                    <div className="flex flex-col">
                      <div className="text-base font-semibold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                        {userName}
                      </div>
                      <div className="text-[11px] text-white/40 tracking-wide">
                        {userEmail}
                      </div>
                    </div>
                  </div>

                  {/* QR Placeholder - Scaled down */}
                  <div className="w-10 h-10 rounded border border-white/10 bg-white/5 flex items-center justify-center">
                    <div className="text-[7px] text-white/20 font-mono">QR</div>
                  </div>
                </div>

                {/* Bottom Row: Stats Strip */}
                <div className="flex items-center justify-between text-[9px] font-medium tracking-wider">
                  <div className="text-white/40">
                    HANDICAP: <span className="text-white/60">--</span>
                  </div>
                  <div className="text-white/20">|</div>
                  <div className="text-white/40">
                    TRIPS: <span className="text-white/60">--</span>
                  </div>
                  <div className="text-white/20">|</div>
                  <div className="text-white/40">
                    STATUS: <span className="text-[#D4AF37]">PRO</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions Below Card - Compact */}
            <div className="mt-2 bg-[#1E1F20] rounded-xl border border-white/10 overflow-hidden">
              <button
                onClick={async () => {
                  await signOut();
                  setIsProfileOpen(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2.5 hover:bg-white/5 transition-colors text-left"
              >
                <LogOut size={16} className="text-white/40" />
                <span className="text-xs text-white/80">Sign out</span>
              </button>
            </div>

            {/* Footer Links - Compact */}
            <div className="mt-2 text-center text-[10px] text-white/30 flex justify-center gap-3">
              <span className="cursor-pointer hover:text-white/50 transition-colors">Privacy</span>
              <span>•</span>
              <span className="cursor-pointer hover:text-white/50 transition-colors">Terms</span>
            </div>
          </div>
        )}
        </div>
      </div>
    </header>
  );
}
