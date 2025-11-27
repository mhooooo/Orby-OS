'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Flag, Ruler, Calendar, Users, Sun, Moon } from 'lucide-react';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';

interface CourseDetailCardProps {
  course: Course;
  className?: string;
}

export function CourseDetailCard({ course, className }: CourseDetailCardProps) {
  return (
    <motion.div
      className={cn(
        'w-full rounded-3xl overflow-hidden bg-[#1E1F20] border border-gray-800',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Image */}
      <div className="relative h-64 md:h-80">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${course.heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1E1F20] via-transparent to-transparent" />

        {/* Tags overlay */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {course.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium rounded-full bg-[#A4E600] text-black"
            >
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Course name overlay */}
        <div className="absolute bottom-4 left-6 right-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {course.name}
          </h2>
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={16} />
            <span>{course.location}</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 border-b border-gray-800">
        <div className="flex flex-col items-center py-4 border-r border-gray-800">
          <Flag size={20} className="text-[#A4E600] mb-1" />
          <span className="text-lg font-semibold text-white">{course.holes}</span>
          <span className="text-xs text-gray-500">Holes</span>
        </div>
        <div className="flex flex-col items-center py-4 border-r border-gray-800">
          <span className="text-[#A4E600] font-bold text-lg mb-1">Par</span>
          <span className="text-lg font-semibold text-white">{course.par}</span>
          <span className="text-xs text-gray-500">Championship</span>
        </div>
        <div className="flex flex-col items-center py-4">
          <Ruler size={20} className="text-[#A4E600] mb-1" />
          <span className="text-lg font-semibold text-white">{course.yardage.toLocaleString()}</span>
          <span className="text-xs text-gray-500">Yards</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">
            About
          </h3>
          <p className="text-gray-300 leading-relaxed">
            {course.description}
          </p>
        </div>

        {/* Pricing Table */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-3">
            Green Fees
          </h3>
          <div className="bg-[#131314] rounded-xl overflow-hidden">
            <div className="grid grid-cols-3 text-center border-b border-gray-800">
              <div className="py-3 text-xs text-gray-500 font-medium"></div>
              <div className="py-3 text-xs text-gray-500 font-medium flex items-center justify-center gap-1">
                <Users size={12} />
                Guest
              </div>
              <div className="py-3 text-xs text-gray-500 font-medium flex items-center justify-center gap-1">
                <Users size={12} />
                Member
              </div>
            </div>
            <div className="grid grid-cols-3 text-center border-b border-gray-800">
              <div className="py-3 text-sm text-gray-400 flex items-center justify-center gap-1">
                <Sun size={14} />
                Weekday
              </div>
              <div className="py-3 text-sm font-semibold text-[#A4E600]">
                ${course.greenFee.weekday.guest}
              </div>
              <div className="py-3 text-sm font-semibold text-white">
                ${course.greenFee.weekday.member}
              </div>
            </div>
            <div className="grid grid-cols-3 text-center">
              <div className="py-3 text-sm text-gray-400 flex items-center justify-center gap-1">
                <Calendar size={14} />
                Weekend
              </div>
              <div className="py-3 text-sm font-semibold text-[#A4E600]">
                ${course.greenFee.weekend.guest}
              </div>
              <div className="py-3 text-sm font-semibold text-white">
                ${course.greenFee.weekend.member}
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            * Prices in USD. Caddie fee and cart rental not included.
          </p>
        </div>

        {/* Night Golf indicator */}
        {course.tags.includes('night_golf') && (
          <div className="flex items-center gap-2 p-3 bg-[#131314] rounded-xl mb-6">
            <Moon size={18} className="text-[#A4E600]" />
            <span className="text-sm text-gray-300">
              Night golf available - Play under the lights!
            </span>
          </div>
        )}

        {/* CTA Button */}
        <button className="w-full py-4 rounded-full bg-[#A4E600] text-black font-semibold hover:bg-[#8BC500] transition-colors">
          Add to Trip
        </button>
      </div>
    </motion.div>
  );
}
