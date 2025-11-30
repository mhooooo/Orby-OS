'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Flag, Ruler, Calendar, Users, Sun, Moon, Trophy, Wind } from 'lucide-react';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';
import { CourseDetailSkeleton } from '@/components/ui/Skeleton';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

interface CourseDetailCardProps {
  course?: Course;
  className?: string;
  isLoading?: boolean;
}

export function CourseDetailCard({ course, className, isLoading = false }: CourseDetailCardProps) {
  if (isLoading || !course) {
    return <CourseDetailSkeleton />;
  }

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
      {/* Hero Section */}
      <div className="relative h-64 sm:h-80 lg:h-96">
        <CloudinaryImage
          src={course.heroImage}
          alt={course.name}
          width={1200}
          height={384}
          priority
          blur
          className="absolute inset-0"
          objectFit="cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />

        {/* Top Tags */}
        <div className="absolute top-4 sm:top-6 left-4 sm:left-6 flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full bg-black/40 backdrop-blur-md text-white border border-white/10"
            >
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Title & Location */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-3 tracking-tight shadow-black drop-shadow-lg"
          >
            {course.name}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-gray-300 text-sm sm:text-base lg:text-lg"
          >
            <MapPin size={18} className="text-emerald-400 sm:w-5 sm:h-5" />
            <span>{course.location}</span>
          </motion.div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 border-b border-white/5 bg-white/5">
        <div className="flex flex-col items-center py-4 sm:py-6 border-r border-white/5 group hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Flag size={16} className="text-purple-400 sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Holes</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">{course.holes}</span>
        </div>
        <div className="flex flex-col items-center py-4 sm:py-6 border-r border-white/5 group hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Trophy size={16} className="text-yellow-400 sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Par</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">{course.par}</span>
        </div>
        <div className="flex flex-col items-center py-4 sm:py-6 group hover:bg-white/5 transition-colors">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <Ruler size={16} className="text-blue-400 sm:w-[18px] sm:h-[18px]" />
            <span className="text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Yards</span>
          </div>
          <span className="text-xl sm:text-2xl font-bold text-white">{course.yardage.toLocaleString()}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Description */}
          <div className="md:col-span-2 space-y-6 sm:space-y-8">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-gray-500 uppercase tracking-widest mb-3 sm:mb-4">
                About the Course
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm sm:text-base lg:text-lg font-light">
                {course.description}
              </p>
            </div>

            {course.tags.includes('night_golf') && (
              <div className="flex items-center gap-4 p-5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-300">
                  <Moon size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold">Night Golf Available</h4>
                  <p className="text-sm text-indigo-200/70">Experience the course under the lights for a unique challenge.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Pricing & CTA */}
          <div className="space-y-6">
            <div className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden">
              <div className="p-4 bg-white/5 border-b border-white/5">
                <h3 className="text-sm font-bold text-white text-center">Green Fees</h3>
              </div>

              {/* Weekday */}
              <div className="p-4 border-b border-white/5">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-3">
                  <Sun size={14} />
                  Weekday
                </div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-gray-500">Guest</span>
                  <span className="text-xl font-bold text-emerald-400">${course.greenFee.weekday.guest}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-500">Member</span>
                  <span className="text-lg font-semibold text-white">${course.greenFee.weekday.member}</span>
                </div>
              </div>

              {/* Weekend */}
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-400 text-xs uppercase tracking-wider mb-3">
                  <Calendar size={14} />
                  Weekend
                </div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-gray-500">Guest</span>
                  <span className="text-xl font-bold text-emerald-400">${course.greenFee.weekend.guest}</span>
                </div>
                <div className="flex justify-between items-end">
                  <span className="text-sm text-gray-500">Member</span>
                  <span className="text-lg font-semibold text-white">${course.greenFee.weekend.member}</span>
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-colors"
            >
              Add to Trip
            </motion.button>

            <p className="text-[10px] text-center text-gray-500">
              * Prices in USD. Caddie fee and cart rental not included.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
