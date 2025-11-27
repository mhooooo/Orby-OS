'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronDown, Activity, User, LogOut } from 'lucide-react';

const UI_CONFIG = {
  appName: "golfokay",
  proBadge: "PRO",
  user: {
    name: "Tanyawit",
    email: "tanyawit@golfokay.co",
    org: "Managed by golfokay.co",
    avatar: "https://ui-avatars.com/api/?name=Tanyawit&background=0D8ABC&color=fff",
    secondaryUser: {
      name: "Ty N",
      email: "n.tanyawit@gmail.com",
      initial: "T",
      color: "bg-orange-500"
    }
  },
  greetingText: "Hi, Tanyawit!",
};

interface HeaderProps {
  theme: 'dark' | 'light';
}

export function Header({ theme }: HeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [isAccountsExpanded, setIsAccountsExpanded] = useState(true);
  const profileRef = useRef<HTMLDivElement>(null);

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
        <h1 className={`text-xl font-medium tracking-tight ${colors.text}`}>
          {UI_CONFIG.appName}
        </h1>
      </div>

      <div className="flex items-center gap-4 relative" ref={profileRef}>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${colors.borderColor} ${colors.textMuted} ${colors.bg}`}>
          {UI_CONFIG.proBadge}
        </span>

        {isLoggedIn ? (
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[1px] hover:scale-105 transition-transform"
          >
            <Image src={UI_CONFIG.user.avatar} alt="Profile" width={40} height={40} className="w-full h-full rounded-full" />
          </button>
        ) : (
          <button
            onClick={() => setIsLoggedIn(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Sign In
          </button>
        )}

        {/* PROFILE POPOVER */}
        {isProfileOpen && isLoggedIn && (
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
                <div className="text-sm text-gray-400 mb-6">{UI_CONFIG.user.email}</div>

                <div className="w-24 h-24 mx-auto rounded-full p-1 relative mb-4">
                  <Image src={UI_CONFIG.user.avatar} alt="Profile" width={96} height={96} className="w-full h-full rounded-full" />
                  <div className="absolute bottom-1 right-1 bg-[#1E1F20] p-1.5 rounded-full border border-gray-600">
                    <Activity size={14} className="text-blue-400" />
                  </div>
                </div>

                <h3 className="text-2xl font-normal text-gray-200 mb-6">
                  {UI_CONFIG.greetingText}
                </h3>
                <button className="border border-gray-500 rounded-full px-6 py-2.5 text-sm text-gray-200 hover:bg-[#3C4043] transition-colors font-medium mb-6">
                  Manage your Google Account
                </button>

                {/* Collapsible Section */}
                <div className="rounded-2xl overflow-hidden text-left bg-[#1E1F20]">
                  <button
                    onClick={() => setIsAccountsExpanded(!isAccountsExpanded)}
                    className="w-full flex items-center justify-between p-4 bg-[#1E1F20] hover:bg-[#303134] transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-200">
                      {isAccountsExpanded ? "Hide more accounts" : "Show more accounts"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-200 ${isAccountsExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Expanded Content */}
                  {isAccountsExpanded && (
                    <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                      <div className="p-4 pt-2 bg-[#1E1F20] flex items-center justify-between hover:bg-[#303134] cursor-pointer transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full ${UI_CONFIG.user.secondaryUser.color} flex items-center justify-center text-white font-medium text-lg`}>
                            {UI_CONFIG.user.secondaryUser.initial}
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-200">
                              {UI_CONFIG.user.secondaryUser.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {UI_CONFIG.user.secondaryUser.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-2 flex flex-col gap-1">
                        <button className="flex items-center gap-4 py-3 hover:bg-[#303134] rounded-lg px-2 transition-colors">
                          <User size={20} className="text-gray-400" />
                          <span className="text-sm text-gray-200">Add another account</span>
                        </button>
                        <button
                          onClick={() => {
                            setIsLoggedIn(false);
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
