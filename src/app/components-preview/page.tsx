'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Trophy, Wand2, Tag, Mic, Search, BookmarkX, MapPin, AlertCircle,
  RefreshCw, Home, Mountain, Coins, Menu, X, ChevronRight, Plus, Send,
  User, Users, UsersRound, Flag, Car, Plane, Shield, Utensils, Hotel,
  ArrowUpRight, Heart, Wind, Calendar, Star, Award, CheckCircle2, Check,
  Briefcase, Info, Loader2
} from 'lucide-react';

// Core Components
import { PersistentActor } from '@/components/NeuralDots';
import { GolfOkayIcon } from '@/components/icons/GolfOkayIcon';
import { TypingIndicator } from '@/components/chat/TypingIndicator';

// UI Primitives
import { Spinner, InlineLoading } from '@/components/ui/Spinner';
import { Skeleton, SkeletonGroup, CourseCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, InlineError } from '@/components/ui/ErrorState';
import { ToastContainer, ToastData } from '@/components/ui/Toast';

// --- SYSTEM TOKENS ---
const SYSTEM = {
  colors: {
    orange: '#FF6B35',
    cyan: '#00D4FF',
    purple: '#A855F7',
    red: '#FF3B3B',
    yellow: '#FBBF24',
  },
};

const BRAND_COLORS = {
  purple: 'text-[#E0C3FC] bg-[#9B5DE5]/20 border-[#9B5DE5]/40',
  blue: 'text-[#B3ECFF] bg-[#00BBF9]/20 border-[#00BBF9]/40',
  orange: 'text-[#FFCDB3] bg-[#FF6B35]/20 border-[#FF6B35]/40',
  red: 'text-[#FFC5C5] bg-[#F05D5E]/20 border-[#F05D5E]/40',
};

// --- HELPER COMPONENTS ---
const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
  <div className="w-full space-y-4">
    <div className="border-b border-white/10 pb-2">
      <h2 className="text-lg font-bold text-white">{title}</h2>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
    <div>{children}</div>
  </div>
);

const ComponentCard = ({ label, children, dark = false, wide = false }: { label: string; children: React.ReactNode; dark?: boolean; wide?: boolean }) => (
  <div className={`rounded-2xl border border-white/10 overflow-hidden ${dark ? 'bg-[#0a0a0a]' : 'bg-[#1E1F20]'} ${wide ? 'col-span-full' : ''}`}>
    <div className="px-4 py-2 bg-white/5 border-b border-white/10">
      <span className="text-xs font-mono text-gray-400">{label}</span>
    </div>
    <div className="p-4 sm:p-6">{children}</div>
  </div>
);

// === STATIC COMPONENT RECREATIONS ===

// Spectrum Pills (from GreetingState)
const SpectrumPillsStatic = () => {
  const pills = [
    { icon: Sparkles, label: "First-Time Guide", colorKey: "purple" as const },
    { icon: Trophy, label: "Top Rated", colorKey: "blue" as const },
    { icon: Wand2, label: "Build a Trip", colorKey: "orange" as const },
    { icon: Tag, label: "Get a Price", colorKey: "red" as const },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {pills.map((pill) => (
        <button
          key={pill.label}
          className="group relative flex items-center gap-3 pl-2 pr-4 py-2.5 bg-white/5 backdrop-blur-sm border border-white/15 rounded-full hover:bg-white/10 hover:border-white/30 transition-all duration-300"
        >
          <div className={`p-2 rounded-full border transition-all duration-300 group-hover:scale-110 ${BRAND_COLORS[pill.colorKey]}`}>
            <pill.icon size={18} strokeWidth={1.5} />
          </div>
          <span className="text-sm font-medium text-gray-100 group-hover:text-white">{pill.label}</span>
        </button>
      ))}
    </div>
  );
};

// ChatInput Static
const ChatInputStatic = ({ variant = 'default' }: { variant?: 'default' | 'centered' }) => (
  <div className={`w-full mx-auto rounded-full px-3 sm:px-4 flex items-center gap-2 sm:gap-3 ${
    variant === 'centered'
      ? 'bg-white/10 backdrop-blur-xl border border-white/20 h-[52px] sm:h-[60px] max-w-2xl shadow-2xl'
      : 'bg-[#1E1F20] border border-transparent h-[52px] sm:h-[64px] max-w-3xl'
  }`}>
    <button className={`p-1.5 sm:p-2 rounded-full flex-shrink-0 ${
      variant === 'centered' ? 'bg-white/10 text-gray-300' : 'bg-[#282A2C] text-gray-400'
    }`}>
      <Plus size={18} />
    </button>
    <input
      type="text"
      placeholder="Ask me anything about golf in Thailand..."
      className={`flex-1 bg-transparent text-sm sm:text-base outline-none ${
        variant === 'centered' ? 'text-white placeholder-gray-400' : 'text-gray-200 placeholder-gray-500'
      }`}
      readOnly
    />
    <button className="p-1.5 sm:p-2 rounded-full hover:bg-[#282A2C] text-gray-400 flex-shrink-0">
      <Mic size={18} />
    </button>
  </div>
);

// Region Picker Static
const RegionPickerStatic = () => {
  const regions = [
    { id: 'bangkok', name: 'Bangkok', courses: 12, emoji: '🏙️' },
    { id: 'phuket', name: 'Phuket', courses: 8, emoji: '🏝️' },
    { id: 'pattaya', name: 'Pattaya', courses: 15, emoji: '🌴' },
    { id: 'hua_hin', name: 'Hua Hin', courses: 10, emoji: '👑' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 max-w-sm">
      {regions.map((region) => (
        <button
          key={region.id}
          className="flex items-center gap-3 p-3 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] transition-all text-left group"
        >
          <span className="text-2xl">{region.emoji}</span>
          <div>
            <div className="font-medium text-white group-hover:text-[#FF6B35] transition-colors">{region.name}</div>
            <div className="text-xs text-gray-500">{region.courses} courses</div>
          </div>
        </button>
      ))}
    </div>
  );
};

// Vibe Picker Static
const VibePickerStatic = () => {
  const vibes = [
    { id: 'championship', name: 'Championship', description: 'Tournament-quality', icon: Trophy, color: 'from-amber-500/20 to-amber-600/10' },
    { id: 'scenic', name: 'Scenic', description: 'Beautiful landscapes', icon: Mountain, color: 'from-emerald-500/20 to-emerald-600/10' },
    { id: 'value', name: 'Value', description: 'Great prices', icon: Coins, color: 'from-blue-500/20 to-blue-600/10' },
  ];

  return (
    <div className="space-y-2 max-w-sm">
      {vibes.map((vibe) => (
        <button
          key={vibe.id}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] transition-all text-left group overflow-hidden relative"
        >
          <div className={`absolute inset-0 bg-gradient-to-r ${vibe.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
          <div className="relative z-10 w-10 h-10 rounded-xl bg-gray-700 group-hover:bg-[#FF6B35] flex items-center justify-center transition-colors">
            <vibe.icon size={20} className="text-gray-300 group-hover:text-white transition-colors" />
          </div>
          <div className="relative z-10 flex-1">
            <div className="font-semibold text-white text-sm">{vibe.name}</div>
            <div className="text-xs text-gray-400">{vibe.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

// Group Size Picker Static
const GroupSizePickerStatic = () => {
  const options = [
    { id: 'solo', size: 1, label: 'Solo', icon: User },
    { id: 'couple', size: 2, label: 'Pair', icon: Users },
    { id: 'flight', size: 4, label: 'Flight', icon: UsersRound },
    { id: 'group', size: 8, label: 'Group', icon: UsersRound },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 max-w-md">
      {options.map((option) => (
        <button
          key={option.id}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-700 group-hover:bg-[#FF6B35] flex items-center justify-center transition-colors">
            <option.icon size={20} className="text-gray-300 group-hover:text-white transition-colors" />
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{option.size}</div>
            <div className="text-xs text-gray-500">{option.label}</div>
          </div>
        </button>
      ))}
    </div>
  );
};

// Days Picker Static
const DaysPickerStatic = () => {
  const options = [3, 5, 7, 10];
  return (
    <div className="flex gap-3 max-w-md">
      {options.map((days) => (
        <button
          key={days}
          className="flex-1 flex flex-col items-center gap-1 p-4 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] transition-all group"
        >
          <span className="text-3xl font-bold text-white group-hover:text-[#FF6B35] transition-colors">{days}</span>
          <span className="text-xs text-gray-500">days</span>
        </button>
      ))}
    </div>
  );
};

// Transport Picker Static
const TransportPickerStatic = () => {
  const options = [
    { id: 'sedan', name: 'Sedan', capacity: '1-3', price: '฿2,500/day' },
    { id: 'suv', name: 'SUV', capacity: '1-4', price: '฿3,500/day' },
    { id: 'van', name: 'Van', capacity: '5-8', price: '฿4,500/day' },
  ];

  return (
    <div className="space-y-2 max-w-sm">
      {options.map((option) => (
        <button
          key={option.id}
          className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#282A2C] border border-gray-700 hover:border-[#FF6B35] transition-all group"
        >
          <div className="flex items-center gap-3">
            <Car size={20} className="text-gray-400 group-hover:text-[#FF6B35] transition-colors" />
            <div className="text-left">
              <div className="font-medium text-white">{option.name}</div>
              <div className="text-xs text-gray-500">{option.capacity} passengers</div>
            </div>
          </div>
          <span className="text-sm font-bold text-emerald-400">{option.price}</span>
        </button>
      ))}
    </div>
  );
};

// Course Card Static (simplified)
const CourseCardStatic = () => (
  <div className="relative w-[300px] rounded-[2rem] overflow-hidden bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
    <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-[50px] pointer-events-none" />
    <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/30 rounded-full blur-[50px] pointer-events-none" />
    <div className="relative h-[200px] overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 to-teal-800" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
        <div className="flex gap-2">
          <span className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20">Championship</span>
        </div>
        <button className="p-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white">
          <Heart size={18} />
        </button>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-xl font-bold text-white mb-2">Alpine Golf Club</h3>
        <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
          <MapPin size={14} className="text-blue-400" />
          <span>Chiang Mai</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Price</span>
            <div className="text-lg font-bold text-emerald-400">$85</div>
          </div>
          <button className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wide flex items-center gap-2">
            Quick View
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Fleet Card Static (simplified)
const FleetCardStatic = () => (
  <div className="relative w-full max-w-md rounded-[2.5rem] overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]">
    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
    <div className="p-6 border-b border-white/5">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400"><Car size={20} /></div>
        <h2 className="text-xl font-bold text-white">Premium Transport</h2>
      </div>
      <p className="text-gray-400 text-sm pl-11">Select your preferred vehicle</p>
    </div>
    <div className="p-6">
      <div className="rounded-3xl overflow-hidden border border-blue-500/50 bg-white/10">
        <div className="h-32 bg-gradient-to-br from-slate-800 to-slate-900 relative">
          <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
            <Check size={14} className="text-white" />
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/20 backdrop-blur-md text-white">SUV</span>
            <h3 className="text-lg font-bold text-white mt-1">Toyota Fortuner</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex gap-3 mb-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs bg-white/5 px-3 py-1.5 rounded-lg">
              <Users size={14} className="text-blue-400" /><span>4 Pax</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400 text-xs bg-white/5 px-3 py-1.5 rounded-lg">
              <Briefcase size={14} className="text-purple-400" /><span>4 Bags</span>
            </div>
          </div>
          <div className="flex items-end justify-between pt-4 border-t border-white/5">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Daily Rate</p>
              <span className="text-lg font-bold text-white">฿3,500</span>
            </div>
            <button className="px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold uppercase">Selected</button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// About Card Static (simplified)
const AboutCardStatic = () => (
  <div className="relative w-full max-w-md rounded-[2.5rem] overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />
    <div className="relative p-6 text-center">
      <div className="inline-block mb-3 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest">Since 2015</div>
      <h2 className="text-2xl font-bold text-white mb-2">Golf Okay</h2>
      <p className="text-gray-400">Your Thailand Golf Concierge</p>
    </div>
    <div className="grid grid-cols-3 gap-px bg-white/5 border-y border-white/5">
      <div className="p-4 flex flex-col items-center justify-center">
        <Calendar size={20} className="text-orange-400 mb-2" />
        <span className="text-2xl font-bold text-white">9</span>
        <span className="text-[10px] text-gray-500 uppercase">Years</span>
      </div>
      <div className="p-4 flex flex-col items-center justify-center border-x border-white/5">
        <MapPin size={20} className="text-blue-400 mb-2" />
        <span className="text-2xl font-bold text-white">50+</span>
        <span className="text-[10px] text-gray-500 uppercase">Courses</span>
      </div>
      <div className="p-4 flex flex-col items-center justify-center">
        <Star size={20} className="text-yellow-400 mb-2" />
        <span className="text-2xl font-bold text-white">4.9</span>
        <span className="text-[10px] text-gray-500 uppercase">Rating</span>
      </div>
    </div>
    <div className="p-6">
      <button className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm">Get in Touch</button>
    </div>
  </div>
);

// Service Bento Static (simplified)
const ServiceBentoStatic = () => {
  const services = [
    { icon: Flag, title: '50+ Golf Courses', size: 'large', gradient: 'from-emerald-500/20 to-teal-600/5' },
    { icon: Car, title: 'Premium Fleet', size: 'medium', gradient: 'from-blue-500/20 to-indigo-600/5' },
    { icon: Trophy, title: 'Club Rentals', size: 'small', gradient: 'from-purple-500/20 to-pink-600/5' },
    { icon: Plane, title: 'Airport Fast-Track', size: 'small', gradient: 'from-cyan-500/20 to-sky-600/5' },
  ];

  return (
    <div className="grid grid-cols-4 gap-3 auto-rows-[100px]">
      {services.map((service) => {
        const gridClass = service.size === 'large' ? 'col-span-2 row-span-2' : service.size === 'medium' ? 'col-span-2 row-span-2' : 'col-span-2 row-span-1';
        return (
          <button
            key={service.title}
            className={`${gridClass} group relative overflow-hidden rounded-2xl p-4 text-left bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 transition-all`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity ${service.gradient}`} />
            <div className="relative h-full flex flex-col z-10">
              <div className="flex items-start justify-between mb-auto">
                <div className="p-2 rounded-xl bg-white/5 border border-white/5">
                  <service.icon size={18} className="text-white" />
                </div>
                <ArrowUpRight size={16} className="text-white/30 group-hover:text-white transition-all" />
              </div>
              <h3 className="font-bold text-white text-sm">{service.title}</h3>
            </div>
          </button>
        );
      })}
    </div>
  );
};

// Auth Gate Modal Static
const AuthGateModalStatic = () => (
  <div className="relative w-full max-w-md rounded-[2rem] overflow-hidden bg-[#1a1a1a]/80 backdrop-blur-2xl border border-white/10">
    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-emerald-500/20 to-transparent pointer-events-none" />
    <div className="relative p-8 pt-12">
      <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center shadow-lg">
        <Award size={28} className="text-white" />
      </div>
      <h2 className="text-white text-2xl font-bold mb-2 text-center">Save this course?</h2>
      <p className="text-gray-400 text-center mb-8 text-sm">Sign in to unlock the full experience.</p>
      <div className="space-y-3 mb-8 bg-white/5 rounded-2xl p-4 border border-white/5">
        {['Save favorite courses', 'Keep itinerary drafts', 'Get personalized recs'].map((benefit) => (
          <div key={benefit} className="flex items-center gap-3 text-gray-300">
            <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check size={12} className="text-emerald-400" />
            </div>
            <span className="text-sm">{benefit}</span>
          </div>
        ))}
      </div>
      <button className="w-full py-4 px-6 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-3 mb-3">
        Continue with Google
      </button>
      <button className="w-full py-3 text-gray-500 text-xs font-medium">Maybe later</button>
    </div>
  </div>
);

// Inquiry Form Static
const InquiryFormStatic = () => (
  <div className="w-full max-w-md rounded-[2rem] overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 p-6">
    <h2 className="text-xl font-bold text-white mb-4">Ready to Book?</h2>
    <div className="space-y-4">
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Name</label>
        <input type="text" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none" placeholder="John Doe" />
      </div>
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Email</label>
        <input type="email" className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none" placeholder="john@example.com" />
      </div>
      <div>
        <label className="text-xs text-gray-400 uppercase tracking-wide mb-1 block">Message</label>
        <textarea className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none h-24 resize-none" placeholder="Tell us about your trip..." />
      </div>
      <button className="w-full py-4 rounded-xl bg-[#FF6B35] text-white font-bold text-sm">Send Inquiry</button>
    </div>
  </div>
);

// Chat Message Preview
const ChatMessagePreview = ({ isUser = false, children }: { isUser?: boolean; children: React.ReactNode }) => (
  <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
    {!isUser && (
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
        <GolfOkayIcon size={16} />
      </div>
    )}
    <div className={`max-w-[80%] px-4 py-3 rounded-2xl ${isUser ? 'bg-[#FF6B35] text-white' : 'bg-[#282A2C] text-gray-200'}`}>
      <p className="text-sm">{children}</p>
    </div>
  </div>
);

// Header Preview
const HeaderPreview = () => (
  <div className="w-full flex items-center justify-between px-4 py-3 bg-[#131314] border-b border-white/10 rounded-xl">
    <div className="flex items-center gap-3">
      <button className="p-2 hover:bg-white/10 rounded-lg transition-colors"><Menu size={20} className="text-white" /></button>
      <div className="flex items-center gap-2">
        <GolfOkayIcon size={24} />
        <span className="font-bold text-white">Golf Okay</span>
      </div>
    </div>
    <button className="px-4 py-2 bg-[#FF6B35] text-white text-sm font-medium rounded-full">Sign In</button>
  </div>
);

// Sidebar Preview
const SidebarPreview = () => (
  <div className="w-64 bg-[#131314] border-r border-white/10 p-4 rounded-xl space-y-1">
    {[
      { icon: Home, label: 'Home', active: true },
      { icon: MapPin, label: 'Courses', active: false },
      { icon: BookmarkX, label: 'Saved', active: false },
      { icon: Trophy, label: 'Top Rated', active: false },
    ].map((item) => (
      <div key={item.label} className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${item.active ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
        <item.icon size={18} />
        <span className="text-sm font-medium">{item.label}</span>
        {item.active && <ChevronRight size={16} className="ml-auto" />}
      </div>
    ))}
  </div>
);

// === MAIN PAGE ===
export default function ComponentsPreview() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = (type: ToastData['type']) => {
    const messages = { success: 'Course saved!', error: 'Failed to save', warning: 'Session expiring', info: 'New courses available' };
    setToasts(prev => [...prev, { id: Date.now().toString(), type, message: messages[type] }]);
  };

  const dismissToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#050505]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">ALL Components</h1>
            <p className="text-sm text-gray-500">Complete Golf Okay Design System</p>
          </div>
          <GolfOkayIcon size={32} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 relative z-10">

        {/* BRAND */}
        <Section title="1. Brand" description="Logo and color palette">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComponentCard label="<GolfOkayIcon />">
              <div className="flex items-center gap-8">
                <GolfOkayIcon size={64} className="text-white" />
                <GolfOkayIcon size={48} className="text-white" />
                <GolfOkayIcon size={32} className="text-white" />
              </div>
            </ComponentCard>
            <ComponentCard label="Brand Colors">
              <div className="flex flex-wrap gap-4">
                {Object.entries(SYSTEM.colors).map(([name, hex]) => (
                  <div key={name} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full" style={{ backgroundColor: hex, boxShadow: `0 0 20px ${hex}40` }} />
                    <span className="text-xs font-mono text-gray-400">{hex}</span>
                  </div>
                ))}
              </div>
            </ComponentCard>
          </div>
        </Section>

        {/* NEURAL ORB */}
        <Section title="2. Neural Orb (NeuralDots)" description="The living logo - core brand element">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ComponentCard label="state='hero'" dark><PersistentActor state="hero" /></ComponentCard>
            <ComponentCard label="state='chat'" dark><PersistentActor state="chat" /></ComponentCard>
            <ComponentCard label="isThinking={true}" dark><PersistentActor state="hero" isThinking /></ComponentCard>
            <ComponentCard label="state='loading'" dark><PersistentActor state="loading" /></ComponentCard>
          </div>
        </Section>

        {/* GREETING STATE */}
        <Section title="3. Greeting State" description="Hero section with input and pills">
          <ComponentCard label="GreetingStateContent" wide>
            <div className="flex flex-col items-center gap-6 py-8">
              <PersistentActor state="hero" />
              <h2 className="text-4xl font-semibold text-white">Hi, there!</h2>
              <ChatInputStatic variant="centered" />
              <SpectrumPillsStatic />
            </div>
          </ComponentCard>
        </Section>

        {/* CHAT INPUT */}
        <Section title="4. Chat Input" description="Message input variants">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComponentCard label="variant='centered'"><ChatInputStatic variant="centered" /></ComponentCard>
            <ComponentCard label="variant='default'"><ChatInputStatic variant="default" /></ComponentCard>
          </div>
        </Section>

        {/* PICKERS */}
        <Section title="5. Pickers" description="Selection components for trip building">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ComponentCard label="<RegionPicker />"><RegionPickerStatic /></ComponentCard>
            <ComponentCard label="<VibePicker />"><VibePickerStatic /></ComponentCard>
            <ComponentCard label="<GroupSizePicker />"><GroupSizePickerStatic /></ComponentCard>
            <ComponentCard label="<DaysPicker />"><DaysPickerStatic /></ComponentCard>
            <ComponentCard label="<TransportPicker />"><TransportPickerStatic /></ComponentCard>
          </div>
        </Section>

        {/* GENERATIVE UI CARDS */}
        <Section title="6. Generative UI Cards" description="AI-rendered components">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ComponentCard label="<CourseCard />" dark><CourseCardStatic /></ComponentCard>
            <ComponentCard label="<FleetCard />" dark><FleetCardStatic /></ComponentCard>
            <ComponentCard label="<AboutCard />" dark><AboutCardStatic /></ComponentCard>
          </div>
        </Section>

        {/* SERVICE BENTO */}
        <Section title="7. Service Bento" description="Interactive service grid">
          <ComponentCard label="<ServiceBento />" wide dark>
            <ServiceBentoStatic />
          </ComponentCard>
        </Section>

        {/* AUTH & INQUIRY */}
        <Section title="8. Auth & Inquiry" description="Conversion components">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComponentCard label="<AuthGateModal />" dark><AuthGateModalStatic /></ComponentCard>
            <ComponentCard label="<InquiryForm />" dark><InquiryFormStatic /></ComponentCard>
          </div>
        </Section>

        {/* CHAT COMPONENTS */}
        <Section title="9. Chat Components" description="Conversation UI">
          <ComponentCard label="Messages + TypingIndicator" wide>
            <div className="max-w-lg space-y-4">
              <ChatMessagePreview>Hi! Where would you like to play golf in Thailand?</ChatMessagePreview>
              <ChatMessagePreview isUser>I want to play in Phuket</ChatMessagePreview>
              <ChatMessagePreview>Great choice! Phuket has 8 amazing courses.</ChatMessagePreview>
              <TypingIndicator />
            </div>
          </ComponentCard>
        </Section>

        {/* LAYOUT */}
        <Section title="10. Layout Components" description="Header, Sidebar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComponentCard label="<Header />"><HeaderPreview /></ComponentCard>
            <ComponentCard label="<Sidebar />"><SidebarPreview /></ComponentCard>
          </div>
        </Section>

        {/* LOADING STATES */}
        <Section title="11. Loading States" description="Spinners and indicators">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ComponentCard label="Spinner sm"><Spinner size="sm" /></ComponentCard>
            <ComponentCard label="Spinner md"><Spinner size="md" /></ComponentCard>
            <ComponentCard label="Spinner lg"><Spinner size="lg" /></ComponentCard>
            <ComponentCard label="InlineLoading"><InlineLoading message="Loading..." /></ComponentCard>
          </div>
        </Section>

        {/* SKELETONS */}
        <Section title="12. Skeletons" description="Loading placeholders">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <ComponentCard label="text"><Skeleton variant="text" className="w-full" /></ComponentCard>
            <ComponentCard label="card"><Skeleton variant="card" className="w-full h-24" /></ComponentCard>
            <ComponentCard label="image"><Skeleton variant="image" className="w-full" /></ComponentCard>
            <ComponentCard label="circle"><Skeleton variant="circle" className="w-12 h-12" /></ComponentCard>
          </div>
          <div className="mt-4">
            <ComponentCard label="<CourseCardSkeleton />" wide><CourseCardSkeleton /></ComponentCard>
          </div>
        </Section>

        {/* TOASTS */}
        <Section title="13. Toasts" description="Notification messages">
          <div className="flex flex-wrap gap-3">
            <button onClick={() => addToast('success')} className="px-4 py-2 bg-green-500/20 text-green-400 text-sm rounded-lg">Success</button>
            <button onClick={() => addToast('error')} className="px-4 py-2 bg-red-500/20 text-red-400 text-sm rounded-lg">Error</button>
            <button onClick={() => addToast('warning')} className="px-4 py-2 bg-yellow-500/20 text-yellow-400 text-sm rounded-lg">Warning</button>
            <button onClick={() => addToast('info')} className="px-4 py-2 bg-cyan-500/20 text-cyan-400 text-sm rounded-lg">Info</button>
          </div>
        </Section>

        {/* EMPTY & ERROR STATES */}
        <Section title="14. Empty & Error States" description="Feedback components">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <EmptyState icon={Search} title="No results found" description="Try adjusting your search" action={{ label: 'Clear Filters', onClick: () => {} }} />
            <ErrorState title="Something went wrong" message="Please try again" onRetry={() => {}} onGoHome={() => {}} />
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <ComponentCard label="<EmptyState compact />"><EmptyState icon={MapPin} title="No courses here" compact /></ComponentCard>
            <ComponentCard label="<InlineError />"><InlineError message="This field is required" /></ComponentCard>
          </div>
        </Section>

        {/* GLASS CARDS */}
        <Section title="15. Glass Cards" description="Container styles">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Basic Glass</span>
              <p className="mt-4 text-white font-medium">bg-white/5</p>
            </div>
            <div className="rounded-3xl bg-white/[0.08] backdrop-blur-xl border border-white/10 shadow-2xl p-6">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Elevated</span>
              <p className="mt-4 text-white font-medium">+ shadow-2xl</p>
            </div>
            <motion.div whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,0.2)' }} className="rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 cursor-pointer">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Interactive</span>
              <p className="mt-4 text-white font-medium">+ hover:scale</p>
            </motion.div>
          </div>
        </Section>

        {/* MOTION */}
        <Section title="16. Motion Principles" description="Animation patterns">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center space-y-4">
              <motion.div className="w-16 h-16 rounded-2xl bg-purple-500/20 border border-purple-500/30 mx-auto" animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} />
              <div><p className="text-sm font-medium text-white">Drift</p><p className="text-xs text-gray-500">easeInOut</p></div>
            </div>
            <div className="text-center space-y-4">
              <motion.div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 mx-auto cursor-pointer" whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 120 }} />
              <div><p className="text-sm font-medium text-white">Snap</p><p className="text-xs text-gray-500">spring</p></div>
            </div>
            <div className="text-center space-y-4">
              <motion.div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/30 mx-auto" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} />
              <div><p className="text-sm font-medium text-white">Breathe</p><p className="text-xs text-gray-500">scale pulse</p></div>
            </div>
            <div className="text-center space-y-4">
              <motion.div className="w-16 h-16 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 mx-auto" animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
              <div><p className="text-sm font-medium text-white">Spin</p><p className="text-xs text-gray-500">linear</p></div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <div className="text-center text-gray-600 text-sm pt-12 border-t border-white/5">
          <p>Golf Okay — Complete Component Library</p>
          <p className="text-xs mt-1">45 components • Next.js • Tailwind • Framer Motion</p>
        </div>

      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
