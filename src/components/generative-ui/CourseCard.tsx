'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Flag } from 'lucide-react';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  onSave?: (courseId: string) => void;
}

export function CourseCard({ course, onSave }: CourseCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.(course.id);
  };

  return (
    <div
      className="relative w-[280px] h-[380px] cursor-pointer perspective-1000"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="w-full h-full relative"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        {/* Front of card */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Hero Image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${course.heroImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Heart button */}
          <button
            onClick={handleSave}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 backdrop-blur-sm hover:bg-black/60 transition-colors z-10"
          >
            <Heart
              size={20}
              className={cn(
                'transition-colors',
                isSaved ? 'fill-red-500 text-red-500' : 'text-white'
              )}
            />
          </button>

          {/* Tags */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {course.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium rounded-full bg-[#A4E600] text-black"
              >
                {tag.replace('_', ' ')}
              </span>
            ))}
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-xl font-semibold text-white mb-2">
              {course.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-300 text-sm mb-3">
              <MapPin size={14} />
              <span>{course.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-gray-400 text-sm">
                <span className="flex items-center gap-1">
                  <Flag size={14} />
                  {course.holes} holes
                </span>
                <span>Par {course.par}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">From</span>
                <p className="text-lg font-semibold text-[#A4E600]">
                  ${course.greenFee.weekday.guest}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute w-full h-full rounded-3xl overflow-hidden bg-[#1E1F20] p-5 backface-hidden"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <h3 className="text-xl font-semibold text-white mb-4">
            {course.name}
          </h3>

          <p className="text-gray-400 text-sm mb-4 line-clamp-3">
            {course.description}
          </p>

          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Yardage</span>
              <span className="text-white font-medium">{course.yardage.toLocaleString()} yards</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Par</span>
              <span className="text-white font-medium">{course.par}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Holes</span>
              <span className="text-white font-medium">{course.holes}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Region</span>
              <span className="text-white font-medium capitalize">{course.region.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-xs text-gray-400 block">Weekday</span>
                <span className="text-[#A4E600] font-semibold">${course.greenFee.weekday.guest}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 block">Weekend</span>
                <span className="text-[#A4E600] font-semibold">${course.greenFee.weekend.guest}</span>
              </div>
            </div>
          </div>

          <button className="w-full mt-4 py-3 rounded-full bg-[#A4E600] text-black font-medium hover:bg-[#8BC500] transition-colors">
            Add to Trip
          </button>
        </div>
      </motion.div>
    </div>
  );
}
