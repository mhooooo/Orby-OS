'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Flag,
  Car,
  Trophy,
  Plane,
  Shield,
  Utensils,
  Hotel,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';
import { cn } from '@/lib/utils';

interface ServiceItem {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  prompt: string;
  size: 'large' | 'medium' | 'small';
}

const SERVICES: ServiceItem[] = [
  {
    id: 'courses',
    icon: Flag,
    title: '50+ Golf Courses',
    description: 'Championship layouts to hidden gems across 6 regions',
    gradient: 'from-emerald-500/20 to-teal-600/5',
    prompt: 'Show me golf courses in Thailand',
    size: 'large',
  },
  {
    id: 'transport',
    icon: Car,
    title: 'Premium Fleet',
    description: 'Luxury transfers with professional drivers',
    gradient: 'from-blue-500/20 to-indigo-600/5',
    prompt: 'Show me your transport options',
    size: 'medium',
  },
  {
    id: 'clubs',
    icon: Trophy,
    title: 'Club Rentals',
    description: 'Top brand equipment delivered to course',
    gradient: 'from-purple-500/20 to-pink-600/5',
    prompt: 'Tell me about club rentals',
    size: 'small',
  },
  {
    id: 'airport',
    icon: Plane,
    title: 'Airport Fast-Track',
    description: 'VIP arrival with priority immigration',
    gradient: 'from-cyan-500/20 to-sky-600/5',
    prompt: 'Tell me about airport fast-track service',
    size: 'small',
  },
  {
    id: 'insurance',
    icon: Shield,
    title: 'Golf Insurance',
    description: 'Comprehensive coverage including hole-in-one',
    gradient: 'from-rose-500/20 to-red-600/5',
    prompt: 'Tell me about golf insurance',
    size: 'medium',
  },
  {
    id: 'dining',
    icon: Utensils,
    title: 'Dining & Nightlife',
    description: 'The best 19th holes and restaurants',
    gradient: 'from-amber-500/20 to-orange-600/5',
    prompt: 'What dining options do you recommend?',
    size: 'small',
  },
  {
    id: 'hotels',
    icon: Hotel,
    title: 'Accommodations',
    description: 'Partner hotels near every course',
    gradient: 'from-violet-500/20 to-purple-600/5',
    prompt: 'Tell me about hotel options',
    size: 'small',
  },
];

export function ServiceBento() {
  const { sendMessage } = useChatContext();

  const handleServiceClick = (prompt: string) => {
    sendMessage(prompt);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 md:grid-cols-6 gap-4 auto-rows-[120px]"
      >
        {SERVICES.map((service) => {
          const Icon = service.icon;
          const gridClass = service.size === 'large'
            ? 'col-span-4 md:col-span-3 row-span-2'
            : service.size === 'medium'
              ? 'col-span-2 md:col-span-3 row-span-2'
              : 'col-span-2 md:col-span-2 row-span-1';

          return (
            <motion.button
              key={service.id}
              variants={itemVariants}
              onClick={() => handleServiceClick(service.prompt)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                gridClass,
                "group relative overflow-hidden rounded-3xl p-6 text-left transition-all duration-300",
                "bg-white/5 backdrop-blur-xl border border-white/10",
                "hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]"
              )}
            >
              {/* Gradient Background */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                service.gradient
              )} />

              {/* Decorative Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />

              <div className="relative h-full flex flex-col z-10">
                <div className="flex items-start justify-between mb-auto">
                  <div className={cn(
                    "p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/5 group-hover:scale-110 transition-transform duration-300",
                    "group-hover:bg-white/10 group-hover:border-white/20"
                  )}>
                    <Icon size={service.size === 'small' ? 20 : 24} className="text-white" />
                  </div>
                  <ArrowUpRight
                    size={20}
                    className="text-white/30 group-hover:text-white transition-all transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"
                  />
                </div>

                <div className="mt-auto">
                  <h3 className={cn(
                    "font-bold text-white mb-1 leading-tight",
                    service.size === 'small' ? 'text-sm' : 'text-xl'
                  )}>
                    {service.title}
                  </h3>
                  {service.size !== 'small' && (
                    <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-200 transition-colors">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
}
