'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Flag, Expand } from 'lucide-react';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { useSavedCourses } from '@/hooks/useSavedCourses';

interface CourseCardProps {
  course: Course;
  onAuthRequired?: () => void;
  compact?: boolean;
}

export function CourseCard({ course, onAuthRequired, compact = false }: CourseCardProps) {
  const { sendMessage } = useChatContext();
  const { user } = useAuth();
  const { saveCourse, unsaveCourse, isSaved } = useSavedCourses();
  const [isProcessing, setIsProcessing] = useState(false);

  const courseIsSaved = isSaved(course.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[CourseCard] handleSave called, user:', user?.email, 'courseId:', course.id);

    // If not authenticated, trigger auth modal
    if (!user) {
      console.log('[CourseCard] No user, triggering auth modal');
      onAuthRequired?.();
      return;
    }

    // Prevent double-clicks while processing
    if (isProcessing) {
      console.log('[CourseCard] Already processing, skipping');
      return;
    }

    setIsProcessing(true);
    console.log('[CourseCard] Starting save/unsave, isSaved:', courseIsSaved);

    try {
      if (courseIsSaved) {
        const result = await unsaveCourse(course.id);
        console.log('[CourseCard] unsaveCourse result:', result);
      } else {
        const result = await saveCourse(course.id);
        console.log('[CourseCard] saveCourse result:', result);
      }
    } catch (err) {
      console.error('[CourseCard] Error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendMessage(`Tell me more about ${course.name}`);
  };

  return (
    <div className={cn(
      'relative rounded-3xl overflow-hidden group',
      compact ? 'w-[240px] h-[300px]' : 'w-[280px] h-[340px]'
    )}>
      {/* Hero Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
        style={{ backgroundImage: `url(${course.heroImage})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />

      {/* Top Actions */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {course.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-xs font-medium rounded-full bg-white/90 text-gray-800"
            >
              {tag.replace('_', ' ')}
            </span>
          ))}
        </div>

        {/* Heart button */}
        <motion.button
          onClick={handleSave}
          disabled={isProcessing}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'p-2 rounded-full bg-black/40 backdrop-blur-sm transition-colors',
            isProcessing ? 'cursor-not-allowed opacity-50' : 'hover:bg-black/60'
          )}
        >
          <Heart
            size={18}
            className={cn(
              'transition-all duration-200',
              courseIsSaved ? 'fill-[#FF3B3B] text-[#FF3B3B]' : 'text-white'
            )}
          />
        </motion.button>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className={cn(
          'font-semibold text-white mb-1.5',
          compact ? 'text-base' : 'text-lg'
        )}>
          {course.name}
        </h3>

        <div className="flex items-center gap-1.5 text-gray-300 text-sm mb-3">
          <MapPin size={12} />
          <span>{course.location}</span>
        </div>

        {/* Footer Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1">
              <Flag size={12} />
              {course.holes} holes
            </span>
            <span>Par {course.par}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-gray-400 block">From</span>
            <span className="text-base font-semibold text-[#FF6B35]">
              ${course.greenFee.weekday.guest}
            </span>
          </div>
        </div>

        {/* Expand button - appears on hover */}
        <motion.button
          onClick={handleExpand}
          initial={{ opacity: 0, y: 10 }}
          whileHover={{ scale: 1.02 }}
          className="w-full mt-3 py-2.5 rounded-xl bg-white/10 backdrop-blur-sm text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/20 transition-colors opacity-0 group-hover:opacity-100"
        >
          <Expand size={14} />
          View Details
        </motion.button>
      </div>
    </div>
  );
}
