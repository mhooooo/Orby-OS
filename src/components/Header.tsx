'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronDown, Activity, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  theme: 'dark' | 'light';
  showLogo?: boolean;
}

export function Header({ theme, showLogo = true }: HeaderProps) {
  const { user, loading, signIn, signOut } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);

  // Derive user info from auth
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userEmail = user?.email || '';
  const userAvatar = user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=0D8ABC&color=fff`;
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const colors = {
    text: theme === 'dark' ? 'text-gray-200' : 'text-gray-800',
    borderColor: theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
    textMuted: theme === 'dark' ? 'text-gray-400' : 'text-gray-600',
    bg: theme === 'dark' ? 'bg-[#131314]' : 'bg-white',
  };

  return (
    <header className="flex items-center justify-between p-4 z-50 relative">
      <div className="flex items-center gap-3">
        <Image
          src="/golfokay-logo.svg"
          alt="Golf Okay"
          width={120}
          height={30}
          className={`transition-all duration-500 ${showLogo ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        />
      </div>

      <div className="flex items-center gap-4 relative" ref={profileRef}>
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

        {/* PROFILE POPOVER */}
        {isProfileOpen && user && (
          <div className={`absolute top-12 right-0 w-[400px] rounded-[2rem] shadow-[0_20px_50px_-10px_rgba(0,0,0,0.8)] overflow-hidden border ${colors.borderColor} bg-[#1E1F20] z-50 animate-in fade-in zoom-in-95`}>
            {/* Main Card */}
            <div className="p-2">
              <div className="rounded-[1.5rem] bg-[#282A2C] p-6 text-center relative">
                <div
                  className="absolute top-4 right-4 text-xs text-gray-500 hover:bg-gray-700/50 p-2 rounded-full cursor-pointer transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <X size={16} />
                </div>
                <div className="text-sm text-gray-400 mb-6">{userEmail}</div>

                <div className="w-24 h-24 mx-auto rounded-full p-1 relative mb-4">
                  <Image src={userAvatar} alt="Profile" width={96} height={96} className="w-full h-full rounded-full" unoptimized />
                  <div className="absolute bottom-1 right-1 bg-[#1E1F20] p-1.5 rounded-full border border-gray-600">
                    <Activity size={14} className="text-blue-400" />
                  </div>
                </div>

                <h3 className="text-2xl font-normal text-gray-200 mb-6">
                  Hi, {userName}!
                </h3>

                {/* Sign Out Section */}
                <div className="rounded-2xl overflow-hidden text-left bg-[#1E1F20]">
                  <button
                    onClick={() => setIsAccountsExpanded(!isAccountsExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-[#1E1F20] hover:bg-[#303134] transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-200">
                      {isAccountsExpanded ? "Hide options" : "Show options"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isAccountsExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {isAccountsExpanded && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="p-4 pt-2 flex flex-col gap-1">
                        <button
                          onClick={async () => {
                            await signOut();
                            setIsProfileOpen(false);
                          }}
                          className="flex items-center gap-4 py-3 hover:bg-[#303134] rounded-lg px-2 transition-colors"
                        >
                          <LogOut size={20} className="text-gray-400" />
                          <span className="text-sm text-gray-200">Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Links */}
            <div className="p-4 text-center text-xs text-gray-500 flex justify-center gap-6 bg-[#1E1F20] rounded-b-[2rem]">
              <span className="cursor-pointer hover:text-gray-300">Privacy Policy</span>
              <span>•</span>
              <span className="cursor-pointer hover:text-gray-300">Terms of Service</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
