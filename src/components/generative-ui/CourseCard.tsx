'use client';

import React, { useState, useRef, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MapPin, Flag, X, ChevronRight, Wind, Loader2 } from 'lucide-react';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';
import { useChatContext } from '@/context/ChatContext';
import { useAuth } from '@/hooks/useAuth';
import { useSavedCourses } from '@/hooks/useSavedCourses';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

interface CourseCardProps {
  course: Course;
  onAuthRequired?: () => void;
  compact?: boolean;
}

function CourseCardInner({ course, onAuthRequired, compact = false }: CourseCardProps) {
  const { sendMessage } = useChatContext();
  const { user } = useAuth();
  const { saveCourse, unsaveCourse, isSaved } = useSavedCourses();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const courseIsSaved = isSaved(course.id);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      onAuthRequired?.();
      return;
    }
    if (isProcessing) return;

    setIsProcessing(true);
    try {
      if (courseIsSaved) {
        await unsaveCourse(course.id);
      } else {
        await saveCourse(course.id);
      }
    } catch (err) {
      console.error('Error saving course:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleChatInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    sendMessage(`I'm interested in ${course.name}. Can you tell me more?`);
  };

  return (
    <motion.div
      ref={containerRef}
      layout
      className={cn(
        'relative group z-0',
        compact ? 'w-[280px] sm:w-[260px]' : 'w-[300px] sm:w-[320px]',
        isExpanded ? 'z-50' : ''
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Glassmorphic Container */}
      <motion.div
        layout
        className={cn(
          'relative overflow-hidden rounded-[2rem]',
          'bg-white/5 backdrop-blur-xl border border-white/10',
          'shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]',
          'transition-all duration-500',
          isExpanded ? 'h-auto' : compact ? 'h-[340px]' : 'h-[400px]'
        )}
      >
        {/* Glow Effects */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/30 rounded-full blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/30 rounded-full blur-[50px] pointer-events-none" />

        {/* Hero Image Section */}
        <motion.div
          layout
          className={cn(
            "relative w-full overflow-hidden",
            isExpanded ? "h-[200px]" : "h-full"
          )}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ scale: isExpanded ? 1.05 : 1 }}
            whileHover={{ scale: isExpanded ? 1.05 : 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <CloudinaryImage
              src={course.heroImage}
              alt={course.name}
              width={320}
              height={400}
              blur
              className="w-full h-full"
              objectFit="cover"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          
          {/* Top Actions */}
          <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
            <div className="flex flex-wrap gap-2">
              {course.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-[10px] uppercase tracking-wider font-bold rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20 shadow-lg"
                >
                  {tag.replace('_', ' ')}
                </span>
              ))}
            </div>
            
            <motion.button
              onClick={handleSave}
              whileHover={{ scale: isProcessing ? 1 : 1.1, backgroundColor: 'rgba(255,255,255,0.2)' }}
              whileTap={{ scale: isProcessing ? 1 : 0.9 }}
              className="p-2.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10 text-white transition-colors"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <Heart
                  size={18}
                  className={cn(
                    'transition-colors duration-300',
                    courseIsSaved ? 'fill-rose-500 text-rose-500' : 'text-white'
                  )}
                />
              )}
            </motion.button>
          </div>

          {/* Collapsed Content Overlay */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 p-5"
            animate={{ opacity: isExpanded ? 0 : 1, y: isExpanded ? 20 : 0 }}
          >
            <h3 className="text-xl font-bold text-white mb-2 leading-tight shadow-black drop-shadow-md">
              {course.name}
            </h3>
            <div className="flex items-center gap-2 text-gray-300 text-sm mb-4">
              <MapPin size={14} className="text-blue-400" />
              <span>{course.location}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">Price</span>
                  <span className="text-lg font-bold text-emerald-400">${course.greenFee.weekday.guest}</span>
                </div>
              </div>
              
              <motion.button
                onClick={toggleExpand}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white text-xs font-bold uppercase tracking-wide transition-all flex items-center gap-2 group/btn"
              >
                Quick View
                <ChevronRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-5 pt-2"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white leading-tight">{course.name}</h3>
                  <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
                    <MapPin size={12} />
                    {course.location}
                  </div>
                </div>
                <button 
                  onClick={toggleExpand}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <p className="text-sm text-gray-300 leading-relaxed mb-6 line-clamp-3">
                {course.description}
              </p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1">
                  <Flag size={16} className="text-purple-400" />
                  <span className="text-xs text-gray-400">Holes</span>
                  <span className="text-sm font-bold text-white">{course.holes}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1">
                  <Wind size={16} className="text-blue-400" />
                  <span className="text-xs text-gray-400">Par</span>
                  <span className="text-sm font-bold text-white">{course.par}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center justify-center gap-1">
                  <MapPin size={16} className="text-emerald-400" />
                  <span className="text-xs text-gray-400">Yards</span>
                  <span className="text-sm font-bold text-white">{course.yardage}</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                  <span className="text-sm text-gray-400">Weekday Guest</span>
                  <span className="text-sm font-bold text-white">${course.greenFee.weekday.guest}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-xl bg-white/5">
                  <span className="text-sm text-gray-400">Weekend Guest</span>
                  <span className="text-sm font-bold text-white">${course.greenFee.weekend.guest}</span>
                </div>
              </div>

              <motion.button
                onClick={handleChatInquiry}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all"
              >
                Book Now
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// Memoize to prevent re-renders when parent updates (e.g., during streaming)
export const CourseCard = memo(CourseCardInner, (prevProps, nextProps) => {
  return (
    prevProps.course.id === nextProps.course.id &&
    prevProps.compact === nextProps.compact
  );
});
