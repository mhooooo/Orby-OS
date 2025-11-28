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
  ArrowUpRight
} from 'lucide-react';
import { useChatContext } from '@/context/ChatContext';

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
    gradient: 'from-emerald-500/30 to-teal-600/10',
    prompt: 'Show me golf courses in Thailand',
    size: 'large',
  },
  {
    id: 'transport',
    icon: Car,
    title: 'Premium Fleet',
    description: 'Luxury transfers with professional drivers',
    gradient: 'from-blue-500/30 to-indigo-600/10',
    prompt: 'Show me your transport options',
    size: 'medium',
  },
  {
    id: 'clubs',
    icon: Trophy,
    title: 'Club Rentals',
    description: 'Top brand equipment delivered to course',
    gradient: 'from-purple-500/30 to-pink-600/10',
    prompt: 'Tell me about club rentals',
    size: 'small',
  },
  {
    id: 'airport',
    icon: Plane,
    title: 'Airport Fast-Track',
    description: 'VIP arrival with priority immigration',
    gradient: 'from-cyan-500/30 to-sky-600/10',
    prompt: 'Tell me about airport fast-track service',
    size: 'small',
  },
  {
    id: 'insurance',
    icon: Shield,
    title: 'Golf Insurance',
    description: 'Comprehensive coverage including hole-in-one',
    gradient: 'from-rose-500/30 to-red-600/10',
    prompt: 'Tell me about golf insurance',
    size: 'medium',
  },
  {
    id: 'dining',
    icon: Utensils,
    title: 'Dining & Nightlife',
    description: 'The best 19th holes and restaurants',
    gradient: 'from-amber-500/30 to-orange-600/10',
    prompt: 'What dining options do you recommend?',
    size: 'small',
  },
  {
    id: 'hotels',
    icon: Hotel,
    title: 'Accommodations',
    description: 'Partner hotels near every course',
    gradient: 'from-violet-500/30 to-purple-600/10',
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
    <div className="w-full max-w-5xl mx-auto">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-4 md:grid-cols-6 gap-3 auto-rows-[100px]"
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
              className={`${gridClass} group relative overflow-hidden rounded-2xl bg-gradient-to-br ${service.gradient} border border-white/10 backdrop-blur-sm p-5 text-left transition-all hover:scale-[1.02] hover:border-white/20`}
            >
              {/* Background dot pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }} />
              </div>

              <div className="relative h-full flex flex-col">
                <div className="flex items-start justify-between mb-auto">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
                    <Icon size={service.size === 'small' ? 18 : 22} className="text-white" />
                  </div>
                  <ArrowUpRight
                    size={16}
                    className="text-white/0 group-hover:text-white/60 transition-all transform translate-x-2 -translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0"
                  />
                </div>

                <div className="mt-auto">
                  <h3 className={`font-semibold text-white mb-1 ${service.size === 'small' ? 'text-sm' : 'text-base'}`}>
                    {service.title}
                  </h3>
                  {service.size !== 'small' && (
                    <p className="text-sm text-gray-400 line-clamp-2">
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
