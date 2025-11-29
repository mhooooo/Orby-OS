'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CourseCard } from './CourseCard';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';

// Mock data for initial development
export const MOCK_COURSES: Course[] = [
  {
    id: 'thai-country-club',
    name: 'Thai Country Club',
    region: 'bangkok',
    location: 'Bangkok, Thailand',
    par: 72,
    yardage: 7166,
    holes: 18,
    tags: ['championship', 'night_golf'],
    heroImage: 'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?w=800&q=80',
    description: 'Home to the Honda LPGA Thailand, Thai Country Club is one of the most prestigious courses in Southeast Asia with immaculate conditions year-round.',
    greenFee: {
      weekday: { guest: 180, member: 140 },
      weekend: { guest: 220, member: 180 },
    },
  },
  {
    id: 'alpine-golf-club',
    name: 'Alpine Golf Club',
    region: 'bangkok',
    location: 'Pathum Thani, Thailand',
    par: 72,
    yardage: 7135,
    holes: 18,
    tags: ['championship', 'scenic'],
    heroImage: 'https://images.unsplash.com/photo-1592919505780-303950717480?w=800&q=80',
    description: 'A world-class championship course that has hosted multiple Asian Tour events. Known for its challenging layout and pristine conditions.',
    greenFee: {
      weekday: { guest: 160, member: 120 },
      weekend: { guest: 200, member: 160 },
    },
  },
  {
    id: 'siam-country-club',
    name: 'Siam Country Club',
    region: 'pattaya',
    location: 'Pattaya, Thailand',
    par: 72,
    yardage: 6907,
    holes: 18,
    tags: ['championship', 'scenic'],
    heroImage: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&q=80',
    description: 'Thailand most famous golf destination featuring multiple championship courses set among beautiful natural scenery.',
    greenFee: {
      weekday: { guest: 200, member: 160 },
      weekend: { guest: 250, member: 200 },
    },
  },
  {
    id: 'blue-canyon',
    name: 'Blue Canyon Country Club',
    region: 'phuket',
    location: 'Phuket, Thailand',
    par: 72,
    yardage: 7179,
    holes: 18,
    tags: ['championship', 'scenic'],
    heroImage: 'https://images.unsplash.com/photo-1600005082509-d8ed5d1d9dc5?w=800&q=80',
    description: 'Two world-renowned courses carved through a former tin mine and rubber plantation. The Canyon Course is consistently ranked among Asia best.',
    greenFee: {
      weekday: { guest: 190, member: 150 },
      weekend: { guest: 240, member: 190 },
    },
  },
];

interface CourseCarouselProps {
  courses?: Course[];
  className?: string;
  onAuthRequired?: () => void;
}

export function CourseCarousel({
  courses = MOCK_COURSES,
  className,
  onAuthRequired,
}: CourseCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn('relative group', className)}>
      {/* Navigation arrows */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110 shadow-lg"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-black/70 hover:scale-110 shadow-lg"
      >
        <ChevronRight size={24} />
      </button>

      {/* Carousel container */}
      <motion.div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 -mx-4 scrollbar-hide scroll-smooth snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {courses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="flex-shrink-0 snap-center"
          >
            <CourseCard course={course} onAuthRequired={onAuthRequired} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
