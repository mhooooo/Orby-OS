'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Users, MapPin, Calendar, Shield } from 'lucide-react';
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
        'w-full rounded-3xl overflow-hidden',
        // Glassmorphism effect
        'bg-gradient-to-br from-[#1E1F20]/90 to-[#131314]/90',
        'backdrop-blur-xl border border-gray-800/50',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with gradient accent */}
      <div className="relative p-6 border-b border-gray-800/50">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF6B35] via-[#E85A2A] to-[#FF6B35]" />
        <h2 className="text-2xl font-bold text-white mb-1">
          {data.company}
        </h2>
        <p className="text-[#FF6B35] font-medium">
          {data.tagline}
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 border-b border-gray-800/50">
        <div className="flex flex-col items-center py-5 border-r border-gray-800/50">
          <Calendar size={20} className="text-[#FF6B35] mb-2" />
          <span className="text-2xl font-bold text-white">{data.yearsExperience}</span>
          <span className="text-xs text-gray-500">Years Experience</span>
        </div>
        <div className="flex flex-col items-center py-5 border-r border-gray-800/50">
          <MapPin size={20} className="text-[#FF6B35] mb-2" />
          <span className="text-2xl font-bold text-white">{data.stats.coursesPartner}+</span>
          <span className="text-xs text-gray-500">Partner Courses</span>
        </div>
        <div className="flex flex-col items-center py-5">
          <Star size={20} className="text-[#FF6B35] mb-2" />
          <span className="text-2xl font-bold text-white">{data.stats.averageRating}</span>
          <span className="text-xs text-gray-500">Rating</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <p className="text-gray-300 leading-relaxed mb-6">
          {data.description}
        </p>

        {/* Founders */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Our Founders
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {data.founders.map((founder) => (
              <div
                key={founder.name}
                className="p-4 rounded-xl bg-[#131314]/50 border border-gray-800/50"
              >
                <div className="w-10 h-10 rounded-full bg-[#FF6B35]/20 flex items-center justify-center mb-3">
                  <Users size={20} className="text-[#FF6B35]" />
                </div>
                <h4 className="text-white font-semibold">{founder.name}</h4>
                <p className="text-xs text-gray-500">{founder.role}</p>
                <p className="text-xs text-[#FF6B35] mt-1">{founder.expertise}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Certifications & Trust
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.certifications.map((cert) => (
              <div
                key={cert}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#131314]/50 border border-gray-800/50"
              >
                <Shield size={14} className="text-[#FF6B35]" />
                <span className="text-sm text-gray-300">{cert}</span>
              </div>
            ))}
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#131314]/50 border border-gray-800/50">
              <Award size={14} className="text-[#FF6B35]" />
              <span className="text-sm text-gray-300">{data.stats.happyGolfers.toLocaleString()}+ Happy Golfers</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button className="w-full py-3 rounded-full bg-[#282A2C] text-white font-medium hover:bg-[#333536] transition-colors">
          Contact Us
        </button>
      </div>
    </motion.div>
  );
}
