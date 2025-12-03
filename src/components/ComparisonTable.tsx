'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, MapPin, Calendar, Users, Sparkles, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Course } from '@/types/course';
import { useChatContext } from '@/context/ChatContext';
import { CloudinaryImage } from '@/components/ui/CloudinaryImage';

interface CourseComparisonProps {
  courses: Course[];
  title?: string;
  className?: string;
}

// Calculate all-in price (green fee + caddie + cart)
function calculateAllInPrice(course: Course, isWeekend: boolean = false): number {
  const greenFee = isWeekend ? course.greenFee.weekend.guest : course.greenFee.weekday.guest;
  const caddie = course.caddieFee ?? 450;
  const cart = course.cartFee ?? 700;
  return greenFee + caddie + cart;
}

// Derive travel time from region
function deriveTravelTime(course: Course): string {
  if (course.travelTimeFromBangkok) return course.travelTimeFromBangkok;
  const times: Record<string, string> = {
    bangkok: '30-60 min',
    pattaya: '1.5 hrs',
    hua_hin: '2.5 hrs',
    phuket: '1 hr flight',
    chiang_mai: '1 hr flight',
  };
  return times[course.region] || '—';
}

// Get vibe/best for tag
function getBestFor(course: Course): string {
  if (course.tags.includes('championship')) return 'Championship experience';
  if (course.tags.includes('scenic')) return 'Scenic views';
  if (course.tags.includes('night_golf')) return 'Night golf';
  if (course.tags.includes('beginner_friendly')) return 'Relaxed play';
  return 'Quality round';
}

export function ComparisonTable({ courses, title = 'Course Comparison', className }: CourseComparisonProps) {
  const { sendMessage } = useChatContext();

  if (courses.length === 0) {
    return null;
  }

  // Find cheapest and closest for highlighting
  const prices = courses.map(c => calculateAllInPrice(c, false));
  const cheapestPrice = Math.min(...prices);

  const handleAskAbout = (course: Course) => {
    sendMessage(`Tell me more about ${course.name}`);
  };

  const handleSelectCourse = (course: Course) => {
    sendMessage(`I'd like to book ${course.name}. What's the availability?`);
  };

  return (
    <motion.div
      className={cn('w-full', className)}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-primary mb-1">{title}</h2>
        <p className="text-sm text-text-muted">Compare what matters for your booking decision</p>
      </div>

      {/* Comparison Cards */}
      <div className="bg-surface-glass backdrop-blur-xl border border-white/10 shadow-glass rounded-card overflow-hidden">
        {/* Course Headers with Images */}
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${courses.length}, minmax(200px, 1fr))` }}>
          <div className="p-4 border-b border-r border-white/10">
            <span className="text-xs font-bold text-text-muted uppercase tracking-wider">Course</span>
          </div>
          {courses.map((course, idx) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 border-b border-r border-white/10 last:border-r-0"
            >
              <div className="relative w-full h-24 rounded-lg overflow-hidden mb-3">
                <CloudinaryImage
                  src={course.heroImage}
                  alt={course.name}
                  width={300}
                  height={150}
                  className="w-full h-full"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              </div>
              <h3 className="font-bold text-text-primary text-sm leading-tight">{course.name}</h3>
              <div className="flex items-center gap-1 text-[10px] text-text-muted mt-1">
                <MapPin size={10} />
                <span>{course.location}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total Price Row - Most Important */}
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${courses.length}, minmax(200px, 1fr))` }}>
          <div className="p-4 border-b border-r border-white/10 flex items-center gap-2">
            <span className="text-sm font-medium text-text-secondary">All-in Price</span>
          </div>
          {courses.map((course) => {
            const price = calculateAllInPrice(course, false);
            const isCheapest = price === cheapestPrice;
            return (
              <div
                key={`${course.id}-price`}
                className={cn(
                  "p-4 border-b border-r border-white/10 last:border-r-0",
                  isCheapest && "bg-accent-gold/10"
                )}
              >
                <div className="flex items-center justify-center gap-2">
                  {isCheapest && (
                    <div className="p-1 rounded-full bg-accent-gold/20">
                      <Check size={10} className="text-accent-gold" />
                    </div>
                  )}
                  <span className={cn(
                    "text-xl font-bold",
                    isCheapest ? "text-accent-gold" : "text-text-primary"
                  )}>
                    ฿{price.toLocaleString()}
                  </span>
                </div>
                <p className="text-[10px] text-text-muted text-center mt-1">per round (weekday)</p>
              </div>
            );
          })}
        </div>

        {/* Travel Time Row */}
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${courses.length}, minmax(200px, 1fr))` }}>
          <div className="p-4 border-b border-r border-white/10 flex items-center gap-2">
            <Clock size={14} className="text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Travel Time</span>
          </div>
          {courses.map((course) => {
            const time = deriveTravelTime(course);
            return (
              <div
                key={`${course.id}-travel`}
                className="p-4 border-b border-r border-white/10 last:border-r-0 flex items-center justify-center"
              >
                <span className="text-sm font-semibold text-text-primary">{time}</span>
              </div>
            );
          })}
        </div>

        {/* Best For / Vibe Row */}
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${courses.length}, minmax(200px, 1fr))` }}>
          <div className="p-4 border-b border-r border-white/10 flex items-center gap-2">
            <Sparkles size={14} className="text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Best For</span>
          </div>
          {courses.map((course) => (
            <div
              key={`${course.id}-vibe`}
              className="p-4 border-b border-r border-white/10 last:border-r-0 flex items-center justify-center"
            >
              <span className="text-sm text-accent-purple font-medium text-center">{getBestFor(course)}</span>
            </div>
          ))}
        </div>

        {/* Weekend Price Delta Row */}
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${courses.length}, minmax(200px, 1fr))` }}>
          <div className="p-4 border-b border-r border-white/10 flex items-center gap-2">
            <Calendar size={14} className="text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Weekend Delta</span>
          </div>
          {courses.map((course) => {
            const weekdayPrice = calculateAllInPrice(course, false);
            const weekendPrice = calculateAllInPrice(course, true);
            const delta = weekendPrice - weekdayPrice;
            return (
              <div
                key={`${course.id}-delta`}
                className="p-4 border-b border-r border-white/10 last:border-r-0 flex items-center justify-center"
              >
                <span className={cn(
                  "text-sm font-semibold",
                  delta === 0 ? "text-accent-cyan" : "text-text-secondary"
                )}>
                  {delta === 0 ? 'Same price!' : `+฿${delta.toLocaleString()}`}
                </span>
              </div>
            );
          })}
        </div>

        {/* Group Discount Row */}
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${courses.length}, minmax(200px, 1fr))` }}>
          <div className="p-4 border-b border-r border-white/10 flex items-center gap-2">
            <Users size={14} className="text-text-muted" />
            <span className="text-sm font-medium text-text-secondary">Group Discount</span>
          </div>
          {courses.map((course) => (
            <div
              key={`${course.id}-group`}
              className="p-4 border-b border-r border-white/10 last:border-r-0 flex items-center justify-center"
            >
              <span className="text-sm text-text-secondary">8+ golfers: 10%</span>
            </div>
          ))}
        </div>

        {/* Key Differentiator Row */}
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${courses.length}, minmax(200px, 1fr))` }}>
          <div className="p-4 border-b border-r border-white/10">
            <span className="text-sm font-medium text-text-secondary">Highlight</span>
          </div>
          {courses.map((course) => (
            <div
              key={`${course.id}-highlight`}
              className="p-4 border-b border-r border-white/10 last:border-r-0"
            >
              <p className="text-xs text-text-muted text-center line-clamp-2">
                {course.hookLine || course.description?.substring(0, 80) + '...'}
              </p>
            </div>
          ))}
        </div>

        {/* Action Row */}
        <div className="grid" style={{ gridTemplateColumns: `180px repeat(${courses.length}, minmax(200px, 1fr))` }}>
          <div className="p-4 border-r border-white/10"></div>
          {courses.map((course, idx) => (
            <motion.div
              key={`${course.id}-action`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="p-4 border-r border-white/10 last:border-r-0 space-y-2"
            >
              <button
                onClick={() => handleSelectCourse(course)}
                className="w-full py-2.5 rounded-button bg-accent-coral hover:bg-accent-coral/90 text-white font-bold text-sm transition-colors"
              >
                Select
              </button>
              <button
                onClick={() => handleAskAbout(course)}
                className="w-full py-2 rounded-button bg-white/5 hover:bg-white/10 text-text-secondary text-xs font-medium border border-white/10 transition-colors flex items-center justify-center gap-1.5"
              >
                <MessageCircle size={12} />
                More info
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-4 text-center"
      >
        <p className="text-sm text-text-muted">
          Which looks good? Tap &quot;Select&quot; or ask me for more details.
        </p>
      </motion.div>
    </motion.div>
  );
}

// Keep backward compatibility with old interface
export { ComparisonTable as CourseComparisonTable };
