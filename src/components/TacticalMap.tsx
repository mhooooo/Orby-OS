'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Region, REGION_NAMES } from '@/types/itinerary';
import { cn } from '@/lib/utils';

// Extended region type to include Khao Yai (future)
type MapRegion = Region | 'khao_yai';

// Region metadata for the map
interface RegionData {
  id: MapRegion;
  name: string;
  description: string;
  courseCount: number;
  vibes: string[];
  signatureCourses: string[];
  // SVG path center point for course node placement
  center: { x: number; y: number };
}

// Course node on the map
interface CourseNode {
  id: string;
  name: string;
  region: MapRegion;
  position: { x: number; y: number };
  tags?: string[];
}

// Filter state
interface FilterState {
  active: boolean;
  query: string;
  matchingRegions: MapRegion[];
  matchingCourses: string[];
}

interface TacticalMapProps {
  selectedRegions: string[];
  onSelect: (regions: string[]) => void;
  multiSelect?: boolean;
  courses?: CourseNode[];
  filter?: FilterState;
  className?: string;
  onRegionHover?: (region: MapRegion | null) => void;
  onCourseClick?: (courseId: string) => void;
}

// Default region data
const REGION_DATA: Record<MapRegion, RegionData> = {
  bangkok: {
    id: 'bangkok',
    name: 'Bangkok & Central',
    description: 'Championship courses, convenient access, world-class facilities',
    courseCount: 8,
    vibes: ['championship', 'value'],
    signatureCourses: ['Thai Country Club', 'Alpine Golf Club'],
    center: { x: 280, y: 320 },
  },
  pattaya: {
    id: 'pattaya',
    name: 'Pattaya & East Coast',
    description: 'Beach resort vibes, night golf options, vibrant nightlife',
    courseCount: 6,
    vibes: ['scenic', 'nightGolf'],
    signatureCourses: ['Siam Country Club', 'Laem Chabang'],
    center: { x: 340, y: 360 },
  },
  hua_hin: {
    id: 'hua_hin',
    name: 'Hua Hin & West Coast',
    description: 'Royal seaside escape, mountain backdrops, boutique feel',
    courseCount: 5,
    vibes: ['scenic', 'championship'],
    signatureCourses: ['Black Mountain', 'Banyan Golf Club'],
    center: { x: 210, y: 400 },
  },
  phuket: {
    id: 'phuket',
    name: 'Phuket & South',
    description: 'Tropical paradise, ocean views, luxury resorts',
    courseCount: 4,
    vibes: ['scenic', 'championship'],
    signatureCourses: ['Blue Canyon', 'Red Mountain'],
    center: { x: 180, y: 620 },
  },
  chiang_mai: {
    id: 'chiang_mai',
    name: 'Chiang Mai & North',
    description: 'Mountain golf, cooler weather, cultural immersion',
    courseCount: 4,
    vibes: ['scenic', 'value'],
    signatureCourses: ['Chiang Mai Highlands', 'Alpine Golf Chiang Mai'],
    center: { x: 200, y: 140 },
  },
  khao_yai: {
    id: 'khao_yai',
    name: 'Khao Yai & Northeast',
    description: 'Highland retreat, vineyard vibes, nature escapes',
    courseCount: 3,
    vibes: ['scenic', 'value'],
    signatureCourses: ['Rancho Charnvee', 'Mission Hills Khao Yai'],
    center: { x: 340, y: 260 },
  },
};

// SVG paths for Thailand regions (simplified)
const REGION_PATHS: Record<MapRegion, string> = {
  chiang_mai: 'M180,60 L220,50 L260,70 L280,120 L260,180 L220,200 L180,180 L160,140 L160,100 Z',
  khao_yai: 'M280,200 L340,180 L380,220 L400,280 L370,320 L320,340 L280,320 L260,280 L260,230 Z',
  bangkok: 'M220,280 L280,280 L320,320 L340,380 L300,420 L240,420 L200,380 L200,320 Z',
  pattaya: 'M320,340 L380,340 L400,380 L400,440 L360,480 L320,460 L300,420 L300,380 Z',
  hua_hin: 'M180,380 L240,420 L260,480 L240,560 L200,600 L160,560 L140,480 L140,420 Z',
  phuket: 'M140,560 L200,580 L220,640 L200,720 L160,760 L120,720 L100,640 L100,580 Z',
};

// Default course nodes (sample data)
const DEFAULT_COURSES: CourseNode[] = [
  { id: 'thai-cc', name: 'Thai Country Club', region: 'bangkok', position: { x: 270, y: 310 }, tags: ['championship'] },
  { id: 'alpine-bkk', name: 'Alpine Golf Club', region: 'bangkok', position: { x: 290, y: 340 }, tags: ['championship'] },
  { id: 'siam-cc', name: 'Siam Country Club', region: 'pattaya', position: { x: 350, y: 370 }, tags: ['championship', 'night_golf'] },
  { id: 'laem-chabang', name: 'Laem Chabang', region: 'pattaya', position: { x: 370, y: 400 }, tags: ['scenic'] },
  { id: 'black-mountain', name: 'Black Mountain', region: 'hua_hin', position: { x: 200, y: 420 }, tags: ['championship', 'scenic'] },
  { id: 'banyan', name: 'Banyan Golf Club', region: 'hua_hin', position: { x: 220, y: 480 }, tags: ['scenic'] },
  { id: 'blue-canyon', name: 'Blue Canyon', region: 'phuket', position: { x: 170, y: 640 }, tags: ['championship', 'scenic'] },
  { id: 'red-mountain', name: 'Red Mountain', region: 'phuket', position: { x: 190, y: 680 }, tags: ['scenic'] },
  { id: 'cm-highlands', name: 'Chiang Mai Highlands', region: 'chiang_mai', position: { x: 210, y: 130 }, tags: ['scenic'] },
  { id: 'rancho', name: 'Rancho Charnvee', region: 'khao_yai', position: { x: 350, y: 250 }, tags: ['scenic', 'value'] },
];

export function TacticalMap({
  selectedRegions,
  onSelect,
  multiSelect = false,
  courses = DEFAULT_COURSES,
  filter,
  className,
  onRegionHover,
  onCourseClick,
}: TacticalMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<MapRegion | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Handle region selection
  const handleRegionClick = useCallback((region: MapRegion) => {
    // Skip khao_yai for now as it's not in the Region type
    if (region === 'khao_yai') return;

    if (multiSelect) {
      if (selectedRegions.includes(region)) {
        onSelect(selectedRegions.filter((r) => r !== region));
      } else {
        onSelect([...selectedRegions, region]);
      }
    } else {
      onSelect([region]);
    }
  }, [multiSelect, selectedRegions, onSelect]);

  // Handle hover
  const handleRegionHover = useCallback((region: MapRegion | null) => {
    setHoveredRegion(region);
    setShowInfoPanel(!!region);
    onRegionHover?.(region);
  }, [onRegionHover]);

  // Check if region matches filter
  const isRegionFiltered = useCallback((region: MapRegion) => {
    if (!filter?.active) return false;
    return !filter.matchingRegions.includes(region);
  }, [filter]);

  // Check if course matches filter
  const isCourseFiltered = useCallback((courseId: string) => {
    if (!filter?.active) return false;
    return !filter.matchingCourses.includes(courseId);
  }, [filter]);

  // Check if region is selected
  const isRegionSelected = useCallback((region: MapRegion) => {
    return selectedRegions.includes(region);
  }, [selectedRegions]);

  // Get region fill color based on state
  const getRegionFill = useCallback((region: MapRegion) => {
    const filtered = isRegionFiltered(region);
    const selected = isRegionSelected(region);
    const hovered = hoveredRegion === region;

    if (filtered) return 'rgba(255,255,255,0.02)';
    if (selected) return 'rgba(255,107,53,0.15)'; // accent-coral muted
    if (hovered) return 'rgba(255,255,255,0.1)';
    return 'rgba(255,255,255,0.05)';
  }, [isRegionFiltered, isRegionSelected, hoveredRegion]);

  // Get region stroke color
  const getRegionStroke = useCallback((region: MapRegion) => {
    const filtered = isRegionFiltered(region);
    const selected = isRegionSelected(region);
    const hovered = hoveredRegion === region;

    if (filtered) return 'rgba(255,255,255,0.05)';
    if (selected) return '#FF6B35'; // accent-coral
    if (hovered) return 'rgba(255,255,255,0.4)';
    return 'rgba(255,255,255,0.2)';
  }, [isRegionFiltered, isRegionSelected, hoveredRegion]);

  // Hovered region data
  const hoveredRegionData = hoveredRegion ? REGION_DATA[hoveredRegion] : null;

  // Courses in hovered region
  const hoveredRegionCourses = useMemo(() => {
    if (!hoveredRegion) return [];
    return courses.filter((c) => c.region === hoveredRegion);
  }, [hoveredRegion, courses]);

  return (
    <div
      className={cn(
        'relative',
        className
      )}
    >
      {/* Map Container */}
      <div className="relative flex">
        {/* SVG Map */}
        <div className="flex-1">
          <svg
            viewBox="0 0 500 800"
            className="w-full h-auto max-h-[500px]"
            style={{ filter: filter?.active ? 'saturate(0.7)' : 'none' }}
          >
            {/* Glow filter definitions */}
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Region paths */}
            {(Object.keys(REGION_PATHS) as MapRegion[]).map((region) => (
              <g key={region}>
                <motion.path
                  d={REGION_PATHS[region]}
                  fill={getRegionFill(region)}
                  stroke={getRegionStroke(region)}
                  strokeWidth={isRegionSelected(region) ? 2 : 1}
                  className="cursor-pointer transition-colors duration-300"
                  style={{
                    filter: isRegionSelected(region) || hoveredRegion === region ? 'url(#glow)' : 'none',
                    opacity: isRegionFiltered(region) ? 0.2 : 1,
                  }}
                  onMouseEnter={() => handleRegionHover(region)}
                  onMouseLeave={() => handleRegionHover(null)}
                  onClick={() => handleRegionClick(region)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                />

                {/* Region label */}
                <text
                  x={REGION_DATA[region].center.x}
                  y={REGION_DATA[region].center.y - 20}
                  textAnchor="middle"
                  className={cn(
                    'text-[10px] font-medium pointer-events-none transition-opacity duration-300',
                    isRegionFiltered(region) ? 'fill-white/10' : 'fill-white/60'
                  )}
                >
                  {REGION_DATA[region].name.split(' & ')[0]}
                </text>
              </g>
            ))}

            {/* Course nodes */}
            {courses.map((course) => {
              const filtered = isCourseFiltered(course.id);
              const inHoveredRegion = hoveredRegion === course.region;
              const inSelectedRegion = isRegionSelected(course.region);
              const matchesFilter = filter?.active && filter.matchingCourses.includes(course.id);

              return (
                <g key={course.id}>
                  {/* Glow ring for matching courses */}
                  {matchesFilter && (
                    <motion.circle
                      cx={course.position.x}
                      cy={course.position.y}
                      r={12}
                      fill="none"
                      stroke="#00D4FF"
                      strokeWidth={2}
                      style={{ filter: 'url(#glow-strong)' }}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}

                  {/* Course dot */}
                  <motion.circle
                    cx={course.position.x}
                    cy={course.position.y}
                    r={inHoveredRegion || inSelectedRegion ? 6 : 4}
                    className={cn(
                      'cursor-pointer transition-all duration-300',
                      filtered ? 'fill-white/10' : inSelectedRegion ? 'fill-accent-coral' : inHoveredRegion ? 'fill-white/80' : 'fill-white/40'
                    )}
                    style={{
                      filter: inHoveredRegion || matchesFilter ? 'url(#glow)' : 'none',
                      opacity: filtered ? 0.2 : 1,
                    }}
                    onClick={() => onCourseClick?.(course.id)}
                    whileHover={{ scale: 1.5 }}
                    whileTap={{ scale: 0.9 }}
                  />

                  {/* Course label on hover */}
                  {(inHoveredRegion || matchesFilter) && !filtered && (
                    <motion.text
                      x={course.position.x + 10}
                      y={course.position.y + 4}
                      className="text-[8px] fill-white/80 pointer-events-none"
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      {course.name}
                    </motion.text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Info Panel - Tactical HUD style */}
        <AnimatePresence>
          {showInfoPanel && hoveredRegionData && (
            <motion.div
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-0 bottom-0 w-56 bg-black/85 backdrop-blur-sm border-l border-white/10 p-4 flex flex-col"
            >
              {/* Region name with indicator */}
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  isRegionSelected(hoveredRegion!) ? 'bg-white' : 'bg-white/40'
                )} />
                <h4 className="text-sm font-medium text-white">
                  {hoveredRegionData.name}
                </h4>
              </div>

              {/* Description - compact */}
              <p className="text-xs text-text-muted leading-relaxed mb-3">
                {hoveredRegionData.description}
              </p>

              {/* Stats row - horizontal */}
              <div className="flex gap-4 text-xs text-text-muted mb-3">
                <span>{hoveredRegionData.courseCount} courses</span>
              </div>

              {/* Vibes - small pills inline */}
              <div className="flex flex-wrap gap-1 mb-3">
                {hoveredRegionData.vibes.map((vibe) => (
                  <span
                    key={vibe}
                    className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-text-secondary"
                  >
                    {vibe}
                  </span>
                ))}
              </div>

              {/* Signature courses - minimal */}
              <div className="text-xs text-text-muted mb-4">
                <span className="uppercase tracking-wider text-[10px]">Top picks</span>
                <div className="mt-1.5 space-y-1">
                  {hoveredRegionData.signatureCourses.map((course) => (
                    <div key={course} className="text-text-secondary text-xs">
                      {course}
                    </div>
                  ))}
                </div>
              </div>

              {/* Spacer */}
              <div className="flex-1" />

              {/* Action - ghost button */}
              {hoveredRegion !== 'khao_yai' && (
                <button
                  onClick={() => handleRegionClick(hoveredRegion!)}
                  className={cn(
                    'w-full py-2 rounded text-xs font-medium transition-colors',
                    isRegionSelected(hoveredRegion!)
                      ? 'bg-white/10 border border-white/20 text-white'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10 text-text-secondary hover:text-white'
                  )}
                >
                  {isRegionSelected(hoveredRegion!) ? '✓ Selected' : 'Select region'}
                </button>
              )}

              {hoveredRegion === 'khao_yai' && (
                <p className="text-xs text-text-muted text-center">
                  Coming soon
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
