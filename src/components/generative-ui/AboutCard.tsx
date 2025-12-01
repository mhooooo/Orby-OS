'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Users, MapPin, Calendar, Shield, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Founder {
  name: string;
  role: string;
  expertise: string;
}

interface AboutData {
  company: string;
  tagline: string;
  founded: number;
  yearsExperience: number;
  founders: Founder[];
  certifications: string[];
  stats: {
    coursesPartner: number;
    happyGolfers: number;
    averageRating: number;
  };
  description: string;
}

interface AboutCardProps {
  data: AboutData;
  className?: string;
}

export function AboutCard({ data, className }: AboutCardProps) {
  return (
    <motion.div
      className={cn(
        'relative w-full rounded-[2.5rem] overflow-hidden',
        'bg-white/5 backdrop-blur-2xl border border-white/10',
        'shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-orange-500/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="relative p-4 sm:p-6 lg:p-8 pb-4 sm:pb-6 text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-block mb-3 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-widest"
        >
          Since {data.founded}
        </motion.div>
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">
          {data.company}
        </h2>
        <p className="text-base sm:text-lg text-gray-400 font-light">
          {data.tagline}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-px bg-white/5 border-y border-white/5">
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center group hover:bg-white/5 transition-colors">
          <Calendar size={20} className="text-orange-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform sm:w-6 sm:h-6" />
          <span className="text-2xl sm:text-3xl font-bold text-white mb-1">{data.yearsExperience}</span>
          <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Years</span>
        </div>
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center group hover:bg-white/5 transition-colors border-x border-white/5">
          <MapPin size={20} className="text-blue-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform sm:w-6 sm:h-6" />
          <span className="text-2xl sm:text-3xl font-bold text-white mb-1">{data.stats.coursesPartner}+</span>
          <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Courses</span>
        </div>
        <div className="p-4 sm:p-6 flex flex-col items-center justify-center group hover:bg-white/5 transition-colors">
          <Star size={20} className="text-yellow-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform sm:w-6 sm:h-6" />
          <span className="text-2xl sm:text-3xl font-bold text-white mb-1">{data.stats.averageRating}</span>
          <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider">Rating</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <p className="text-gray-300 leading-relaxed mb-8 text-center max-w-2xl mx-auto">
          {data.description}
        </p>

        {/* Founders */}
        <div className="mb-8">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 text-center">
            Leadership
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.founders.map((founder, idx) => (
              <motion.div
                key={founder.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors flex items-center gap-4 group"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Users size={20} className="text-white" />
                </div>
                <div>
                  <h4 className="text-white font-bold">{founder.name}</h4>
                  <p className="text-xs text-orange-400 font-medium mb-0.5">{founder.role}</p>
                  <p className="text-[10px] text-gray-500">{founder.expertise}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {data.certifications.map((cert) => (
            <div
              key={cert}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300"
            >
              <Shield size={12} className="text-emerald-400" />
              {cert}
            </div>
          ))}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
            <CheckCircle2 size={12} className="text-blue-400" />
            {data.stats.happyGolfers.toLocaleString()}+ Happy Golfers
          </div>
        </div>

        {/* CTA */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl bg-white text-black font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg shadow-white/10"
        >
          Get in Touch
        </motion.button>
      </div>
    </motion.div>
  );
}
